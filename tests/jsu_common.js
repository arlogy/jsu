/*
 https://github.com/arlogy/jsu
 Released under the MIT License (see LICENSE file)
 Copyright (c) 2022 https://github.com/arlogy
*/

const JsuCmn = require('../src/jsu_common.js');

const { dummy } = require('./utils_core.js');
const { cssDisplays, funcParams, htmlVisualTagNames } = require('./utils_test_data.js');

const assert = require('assert');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const sinon = require('sinon');
afterEach(() => {
    sinon.restore(); // restore the default sandbox to prevent memory leak
});

(function() {
    const dom = new JSDOM('<!DOCTYPE html><html></html>');
    global.window = dom.window;
    global.document = dom.window.document;
    global.CSS = undefined;

    const falsyValues = funcParams.filter(x => !x);
    const valfalCssDisplays = [...cssDisplays, ...falsyValues]; // valid and falsy CSS displays
    const numbers = funcParams.filter(x => typeof x === 'number' || typeof x === 'bigint');

    function getCssDisplay(vis, dsp) {
        return vis ? (dsp && dsp !== 'none' ? dsp : 'revert')
                   : 'none';
    }

    (function() {
        describe('getLocalStorageItem() && setLocalStorageItem()', () => {
            it('should fail if window.localSotrage is not available', () => {
                // accessing window.localStorage will throw an exception because no URL is configured for dom
                const dom = new JSDOM('<!DOCTYPE html><html></html>');
                sinon.stub(global, 'window').value(dom.window);
                funcParams.forEach(function(key) {
                    funcParams.forEach(function(val) {
                        assert.strictEqual(JsuCmn.setLocalStorageItem(key, val), false);
                        assert.strictEqual(JsuCmn.getLocalStorageItem(key), null);
                    });
                });
            });
            it('should succeed if window.localStorage is available unless the key or the value is a symbol', () => {
                const dom = new JSDOM('<!DOCTYPE html><html></html>', {
                    url: 'https://fake_url/',
                });
                sinon.stub(global, 'window').value(dom.window);
                funcParams.forEach(function(key) {
                    funcParams.forEach(function(val) {
                        if(JsuCmn.setLocalStorageItem(key, val)) {
                            assert.strictEqual(JsuCmn.getLocalStorageItem(key), val+'');
                        }
                        else {
                            assert.strictEqual(typeof key === 'symbol' || typeof val === 'symbol', true);
                        }
                    });
                });
            });
        });
    })();

    (function() {
        describe('setEltVisible()', () => {
            it('should correctly set the CSS display of an HTML element', function() {
                this.timeout(0); // disable timeout limit for the test case
                htmlVisualTagNames.forEach(function(tag) {
                    const elt = document.createElement(tag);
                    funcParams.forEach(function(vis) {
                        valfalCssDisplays.forEach(function(dsp) {
                            JsuCmn.setEltVisible(elt, vis, dsp);
                            assert.strictEqual(elt.style.display, getCssDisplay(vis, dsp));
                        });
                    });
                });
            });
        });
    })();

    (function() {
        describe('isEltVisible()', () => {
            it('should return whether the CSS display computed by window.getComputedStyle() is not none', function() {
                this.timeout(0); // disable timeout limit for the test case
                htmlVisualTagNames.forEach(function(tag) {
                    const elt = document.createElement(tag);
                    cssDisplays.forEach(function(dsp) {
                        const getComputedStyle = sinon.stub(window, 'getComputedStyle').returns({display:dsp});
                        const retVal = JsuCmn.isEltVisible(elt);
                        assert.strictEqual(getComputedStyle.calledOnceWithExactly(elt, null), true);
                        assert.strictEqual(retVal, getComputedStyle.getCall(0).returnValue.display !== 'none');
                        getComputedStyle.restore();
                    });
                });
            });
        });
    })();

    (function() {
        describe('switchEltVisibility()', () => {
            it('should toggle the visibility of an HTML element and set its CSS display accordingly', function() {
                this.timeout(0); // disable timeout limit for the test case
                htmlVisualTagNames.forEach(function(tag) {
                    const elt = document.createElement(tag);
                    valfalCssDisplays.forEach(function(dsp) {
                        [true, false].forEach(function(vis) {
                            JsuCmn.setEltVisible(elt, vis); // we don't care about dsp here
                            JsuCmn.switchEltVisibility(elt, dsp);
                            const cvis = JsuCmn.isEltVisible(elt); // currently visible?
                            assert.strictEqual(cvis, !vis);
                            assert.strictEqual(elt.style.display, getCssDisplay(cvis, dsp));
                        });
                    });
                });
            });
        });
    })();

    (function() {
        describe('isBoolean()', () => {
            it('should return true only for true or false', () => {
                funcParams.forEach(function(val) {
                    assert.strictEqual(JsuCmn.isBoolean(val), val === true || val === false);
                });
            });
            it('should return false for a boolean object', () => {
                funcParams.filter(val => val instanceof Boolean).forEach(function(val) {
                    assert.strictEqual(JsuCmn.isBoolean(val), false);
                });
            });
        });
    })();

    (function() {
        describe('isNumber()', () => {
            const values = [...funcParams, '-10', '0', '10.99']; // add finite numbers that are strings
            const numIsFinite = Number.isFinite;
            it('should return true only for a finite number that is not a string', () => {
                values.forEach(function(val) {
                    assert.strictEqual(JsuCmn.isNumber(val), numIsFinite(val));
                });
            });
            it('should behave correctly if Number.isFinite() is not available', () => {
                sinon.stub(Number, 'isFinite').value(undefined);
                values.forEach(function(val) {
                    assert.strictEqual(JsuCmn.isNumber(val), numIsFinite(val));
                });
            });
        });
    })();

    (function() {
        describe('isNumberAlike()', () => {
            it('should return true only for a finite number or a primitive string convertible to such a number', () => {
                funcParams.forEach(function(val) {
                    const tov = typeof val;
                    const retVal = (tov === 'number' || tov === 'string') && isFinite(val);
                    assert.strictEqual(JsuCmn.isNumberAlike(val), retVal);
                });
            });
        });
    })();

    (function() {
        describe('isString()', () => {
            it('should return true only for a primitive string or an object string', () => {
                funcParams.forEach(function(val) {
                    assert.strictEqual(JsuCmn.isString(val), typeof val === 'string' || val instanceof String);
                });
            });
        });
    })();

    (function() {
        describe('isArray()', () => {
            const isArray = Array.isArray;
            it('should return true only for an array', () => {
                funcParams.forEach(function(val) {
                    assert.strictEqual(JsuCmn.isArray(val), isArray(val));
                });
            });
            it('should behave correctly if Array.isArray() is not available', () => {
                sinon.stub(Array, 'isArray').value(undefined);
                funcParams.forEach(function(val) {
                    assert.strictEqual(JsuCmn.isArray(val), isArray(val));
                });
            });
        });
    })();

    (function() {
        describe('isCssColor()', () => {
            it('should return the same value as CSS.supports() if the function is defined, or null otherwise', () => {
                const cssDefs = [undefined, {supports:undefined}, {supports:sinon.stub().callsFake(dummy)}];
                cssDefs.forEach(function(def) {
                    sinon.stub(global, 'CSS').value(def);
                    funcParams.forEach(function(val) {
                        const retVal = JsuCmn.isCssColor(val);
                        if(CSS && CSS.supports) {
                            const supports = CSS.supports;
                            assert.strictEqual(supports.calledOnceWithExactly('color', val), true);
                            assert.strictEqual(retVal, supports.getCall(0).returnValue);
                            supports.resetHistory();
                        }
                        else assert.strictEqual(retVal, null);
                    });
                });
            });
        });
    })();

    (function() {
        describe('isCssColorOrString()', () => {
            it("should return isCssColor() if not null, or isString() otherwise", () => {
                [null, false, true].forEach(function(isCssColorRetVal) {
                    funcParams.forEach(function(val) {
                        const isCssColor = sinon.stub(JsuCmn, 'isCssColor').returns(isCssColorRetVal);
                        const retVal = JsuCmn.isCssColorOrString(val);
                        assert.strictEqual(isCssColor.calledOnceWithExactly(val), true);
                        assert.strictEqual(retVal, isCssColorRetVal !== null ? isCssColorRetVal : JsuCmn.isString(val));
                        isCssColor.restore();
                    });
                });
            });
        });
    })();

    (function() {
        describe('copyPropsNoCheck() && copyPropsAndCheck()', () => {
            it('should not copy anything if there are no targeted properties', () => {
                for(let i = 0; i < 2; i++) {
                    const fromObj = {a:0};
                    const toObj = {};
                    switch(i) {
                        case 0: JsuCmn.copyPropsNoCheck([], fromObj, toObj); break;
                        case 1: JsuCmn.copyPropsAndCheck([], fromObj, toObj, (_) => true); break;
                        default: throw new Error('Unhandled operation');
                    }
                    assert.deepStrictEqual(toObj, {});
                    assert.deepStrictEqual(fromObj, {a:0}); // fromObj has not been modified
                }
            });
            it('should only copy the targeted properties', () => {
                for(let i = 0; i < 2; i++) {
                    const fromObj = {a:0, b:{}, c:0};
                    const toObj = {x:0, y:0};
                    switch(i) {
                        // copy both defined and undefined properties from fromObj
                        case 0: JsuCmn.copyPropsNoCheck(['a', 'b', 'x', 'X'], fromObj, toObj); break;
                        case 1: JsuCmn.copyPropsAndCheck(['a', 'b', 'x', 'X'], fromObj, toObj, (_) => true); break;
                        default: throw new Error('Unhandled operation');
                    }
                    assert.deepStrictEqual(toObj, {a:0, b:{}, x:undefined, X:undefined, y:0}); // some properties added, some overridden, some unchanged
                    assert.strictEqual('c' in fromObj && 'c' in toObj === false, true); // only targeted properties should have been copied
                    assert.deepStrictEqual(fromObj, {a:0, b:{}, c:0}); // fromObj has not been modified
                }
            });
            it('copyPropsAndCheck() should only copy the targeted properties allowed by the check function', () => {
                const fromObj = {a:0, b:1, c:2, d:3, e:4}; // even and odd numbers as values
                const fromProps = Object.getOwnPropertyNames(fromObj);
                const toObj = {};
                JsuCmn.copyPropsAndCheck([...fromProps, '_'], fromObj, toObj, (val) => val === undefined || val%2 === 0);
                assert.deepStrictEqual(toObj, {a:0, c:2, e:4, _:undefined});
                assert.deepStrictEqual(fromObj, {a:0, b:1, c:2, d:3, e:4}); // fromObj has not been modified
            });
        });
    })();

    (function() {
        describe('formatString()', () => {
            it('should correctly format a string', () => {
                assert.strictEqual(JsuCmn.formatString('{0}', ['zero']), 'zero');
                assert.strictEqual(JsuCmn.formatString('{1}', ['zero', 'one']), 'one');
                assert.strictEqual(JsuCmn.formatString('{1}', ['one']), '{1}');
                assert.strictEqual(JsuCmn.formatString('{0} {1} {0}', ['{1}', 'one']), '{1} one {1}');
                assert.strictEqual(JsuCmn.formatString('x={x} y={?} z={z} x^2={x}*{x}', {x:0, y:1}), 'x=0 y={?} z={z} x^2=0*0');
            });
        });
    })();

    (function() {
        const knownFormat = String.prototype.format;
        const hasFormat = 'format' in String.prototype;
        describe('setStringPrototypeFormat()', () => {
            after(() => {
                // runs once after the last test in this block
                String.prototype.format = knownFormat;
                if(!hasFormat) delete String.prototype.format;
            });
            it('should succeed if String.prototype.format is undefined or has been set using setStringPrototypeFormat()', () => {
                String.prototype.format = undefined;
                assert.strictEqual(JsuCmn.setStringPrototypeFormat(), true); // set format function for the first time
                assert.strictEqual(JsuCmn.setStringPrototypeFormat(), true); // format function can be set again
                [[], [0], [0, 1], [0, 1, 2]].forEach(function(arr) {
                    // make sure the formatting is correct
                    assert.strictEqual('{0}{1}{0}'.format(...arr), JsuCmn.formatString('{0}{1}{0}', arr));
                });
            });
            it('should fail otherwise', () => {
                funcParams.filter(val => val !== undefined).forEach(function(formatter) {
                    String.prototype.format = formatter;
                    assert.strictEqual(JsuCmn.setStringPrototypeFormat(), false);
                });
            });
        });
    })();

    (function() {
        describe('parseInlineCssStyle()', () => {
            it('should correctly parse a single CSS rule', () => {
                ['Wrong', 'Arial'].forEach(function(val) {
                    assert.strictEqual(JsuCmn.parseInlineCssStyle('font-family:'+val+'; just-ignore-me').fontFamily, val);
                    assert.strictEqual(JsuCmn.parseInlineCssStyle('font-family:'+val+'; ').fontFamily, val);
                    assert.strictEqual(JsuCmn.parseInlineCssStyle('font-family:'+val+';').fontFamily, val);
                    assert.strictEqual(JsuCmn.parseInlineCssStyle('font-family:'+val).fontFamily, val);
                });
                assert.strictEqual(JsuCmn.parseInlineCssStyle('font-size:12px;').fontSize, '12px');
                assert.strictEqual(JsuCmn.parseInlineCssStyle('font-size:12').fontSize, '');
            });
            it('should correctly parse multiple CSS rules', () => {
                const obj = JsuCmn.parseInlineCssStyle('font-family:Arial; font-size:12px');
                assert.strictEqual(obj.fontFamily, 'Arial');
                assert.strictEqual(obj.fontSize, '12px');
            });
            it('should correctly parse a short-hand CSS rule', () => {
                // rule is taken from CSS font documentation and should set each of the following
                //     style | variant | weight | stretch | size/line-height | family
                const font = 'italic small-caps bolder condensed 16px/3 cursive';
                const rule = 'font: '+font+';';
                const obj = JsuCmn.parseInlineCssStyle(rule);
                assert.strictEqual(obj.fontStyle, 'italic');
                assert.strictEqual(obj.fontVariant, 'small-caps');
                assert.strictEqual(obj.fontWeight, 'bolder');
                assert.strictEqual(obj.fontFamily, 'cursive');
                // it seems that jsdom sets the following obj properties differently when parseInlineCssStyle() is called
                //     they are therefore commented in the test case
//                    assert.strictEqual(obj.font.split(' ').sort().join(' '), font.split(' ').sort().join(' '));
//                    assert.strictEqual(obj.fontStretch, 'condensed');
//                    assert.strictEqual(obj.fontSize, '16px');
//                    assert.strictEqual(obj.fontLineHeight, '3');
            });
        });
    })();

    (function() {
        describe('parseSuffixedValue()', () => {
            it('should return null in case of failure', () => {
                [null, undefined, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, NaN, 'x1', ' x1'].forEach(function(val) {
                    assert.deepStrictEqual(JsuCmn.parseSuffixedValue(val), null);
                });
            });
            const nums = numbers.filter(x => x !== Number.POSITIVE_INFINITY && x !== Number.NEGATIVE_INFINITY && !Number.isNaN(x));
            it('should correctly parse a valid number', () => {
                nums.forEach(function(x) {
                    const p = parseFloat(x); // parsed x
                    assert.deepStrictEqual(JsuCmn.parseSuffixedValue(x), {number:p, suffix:''});
                    assert.deepStrictEqual(JsuCmn.parseSuffixedValue(x+''), {number:p, suffix:''});
                    assert.deepStrictEqual(JsuCmn.parseSuffixedValue(' \t'+x+'\t '), {number:p, suffix:''});
                });
            });
            it('should correctly parse a valid suffixed string', () => {
                nums.forEach(function(x) {
                    const p = parseFloat(x); // parsed x
                    assert.deepStrictEqual(JsuCmn.parseSuffixedValue('\t'+x+'\t pixels \t'), {number:p, suffix:'pixels'});
                    assert.deepStrictEqual(JsuCmn.parseSuffixedValue('\t'+x+'\t pixel units \t'), {number:p, suffix:'pixel units'});
                });
            });
        });
    })();

    (function() {
        describe('parseSpaceAsPerJsonStringify()', () => {
            const output = (space) => {
                if(JsuCmn.isNumber(space) && space >= 0) return ' '.repeat(Math.min(space, 10));
                if(JsuCmn.isString(space)) return space.substring(0, 10);
                return '';
            };
            it('should correctly parse any entry', () => {
                funcParams.forEach(function(val) {
                    assert.strictEqual(JsuCmn.parseSpaceAsPerJsonStringify(val), output(val));
                });
            });
        });
    })();

    (function() {
        describe('matchAllAndIndex() & isolateMatchingData() & isolateMatchingValues()', () => {
            it('should correctly indicate that no match was found', () => {
                assert.deepStrictEqual(JsuCmn.matchAllAndIndex('', '\\w+'), null);
                assert.deepStrictEqual(JsuCmn.isolateMatchingData('', '\\w+'), []);
                assert.deepStrictEqual(JsuCmn.isolateMatchingValues('', '\\w+'), []);

                assert.deepStrictEqual(JsuCmn.matchAllAndIndex('no digits', '[0-9]'), null);
                assert.deepStrictEqual(JsuCmn.isolateMatchingData('no digits', '[0-9]'), [
                    {value:'n', matched:false, index:0},
                    {value:'o', matched:false, index:1},
                    {value:' ', matched:false, index:2},
                    {value:'d', matched:false, index:3},
                    {value:'i', matched:false, index:4},
                    {value:'g', matched:false, index:5},
                    {value:'i', matched:false, index:6},
                    {value:'t', matched:false, index:7},
                    {value:'s', matched:false, index:8},
                ]);
                assert.deepStrictEqual(JsuCmn.isolateMatchingValues('no digits', '[0-9]'), [
                    'n', 'o', ' ', 'd', 'i', 'g', 'i', 't', 's',
                ]);
            });

            it('should correctly indicate that matches have been found', () => {
                assert.deepStrictEqual(JsuCmn.matchAllAndIndex('these are words', '\\w+'), {0:'these', 6:'are', 10:'words'});
                assert.deepStrictEqual(JsuCmn.isolateMatchingData('these are words', '\\w+'), [
                    {value:'these', matched:true, index:0},
                    {value:' ', matched:false, index:5},
                    {value:'are', matched:true, index:6},
                    {value:' ', matched:false, index:9},
                    {value:'words', matched:true, index:10},
                ]);
                assert.deepStrictEqual(JsuCmn.isolateMatchingValues('these are words', '\\w+'), [
                    'these', ' ', 'are', ' ', 'words',
                ]);
            });

            it('should correctly handle alternation in a regex pattern', () => {
                assert.deepStrictEqual(JsuCmn.matchAllAndIndex('a12bc z', '[0-9]+|[a-z]+'), {0:'a', 1:'12', 3:'bc', 6:'z'});
                assert.deepStrictEqual(JsuCmn.isolateMatchingData('a12bc z', '[0-9]+|[a-z]+'), [
                    {value:'a', matched:true, index:0},
                    {value:'12', matched:true, index:1},
                    {value:'bc', matched:true, index:3},
                    {value:' ', matched:false, index:5},
                    {value:'z', matched:true, index:6},
                ]);
                assert.deepStrictEqual(JsuCmn.isolateMatchingValues('a12bc z', '[0-9]+|[a-z]+'), [
                    'a', '12', 'bc', ' ', 'z',
                ]);
            });

            it('should correctly handle a regex pattern containing capturing groups', () => {
                assert.deepStrictEqual(JsuCmn.matchAllAndIndex('ab', '(a|b)'), {0:'a', 1:'b'});
                assert.deepStrictEqual(JsuCmn.isolateMatchingData('ab', '(a|b)'), [
                    {value:'a', matched:true, index:0},
                    {value:'b', matched:true, index:1},
                ]);
                assert.deepStrictEqual(JsuCmn.isolateMatchingValues('ab', '(a|b)'), [
                    'a', 'b',
                ]);

                assert.deepStrictEqual(JsuCmn.matchAllAndIndex('ab', '(a)|(b)'), {0:'a', 1:'b'});
                assert.deepStrictEqual(JsuCmn.isolateMatchingData('ab', '(a)|(b)'), [
                    {value:'a', matched:true, index:0},
                    {value:'b', matched:true, index:1},
                ]);
                assert.deepStrictEqual(JsuCmn.isolateMatchingValues('ab', '(a|b)'), [
                    'a', 'b',
                ]);
            });

            it('should handle case sensitivity correctly', () => {
                assert.deepStrictEqual(JsuCmn.matchAllAndIndex('abABc', '[a-z]', false), {0:'a', 1:'b', 4:'c'});
                assert.deepStrictEqual(JsuCmn.isolateMatchingData('abABc', '[a-z]', false), [
                    {value:'a', matched:true, index:0},
                    {value:'b', matched:true, index:1},
                    {value:'A', matched:false, index:2},
                    {value:'B', matched:false, index:3},
                    {value:'c', matched:true, index:4},
                ]);
                assert.deepStrictEqual(JsuCmn.isolateMatchingValues('abABc', '[a-z]', false), [
                    'a', 'b', 'A', 'B', 'c',
                ]);

                assert.deepStrictEqual(JsuCmn.matchAllAndIndex('abABc', '[a-z]', true), {0:'a', 1:'b', 2:'A', 3:'B', 4:'c'});
                assert.deepStrictEqual(JsuCmn.isolateMatchingData('abABc', '[a-z]', true), [
                    {value:'a', matched:true, index:0},
                    {value:'b', matched:true, index:1},
                    {value:'A', matched:true, index:2},
                    {value:'B', matched:true, index:3},
                    {value:'c', matched:true, index:4},
                ]);
                assert.deepStrictEqual(JsuCmn.isolateMatchingValues('abABc', '[a-z]', true), [
                    'a', 'b', 'A', 'B', 'c',
                ]);
            });
        });
    })();
})();
