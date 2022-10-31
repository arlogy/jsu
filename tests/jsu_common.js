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

const { isNode } = require("browser-or-node");

(function() {
    if(isNode) {
        const dom = new JSDOM('<!DOCTYPE html><html></html>');
        global.window = dom.window;
        global.document = dom.window.document;
        global.CSS = undefined;
    }

    const falsyValues = funcParams.filter(x => !x);
    const valfalCssDisplays = [...cssDisplays, ...falsyValues]; // valid and falsy CSS displays
    const numbers = funcParams.filter(x => typeof x === 'number' || typeof x === 'bigint');

    function getCssDisplay(vis, dsp, testDisplay) {
        // testDisplay is introduced for testing purposes only
        // ignore it if you want to focus only on the expected actual implementation
        return vis ? (dsp && dsp !== 'none' ? (testDisplay || dsp) : 'revert')
                   : 'none';
    }

    (function() {
        describe('getLocalStorageItem() & setLocalStorageItem()', () => {
            it('should fail if window.localSotrage is not available', () => {
                const checkImpl = () => {
                    funcParams.forEach(function(key) {
                        funcParams.forEach(function(val) {
                            assert.strictEqual(JsuCmn.setLocalStorageItem(key, val), false);
                            assert.strictEqual(JsuCmn.getLocalStorageItem(key), null);
                        });
                    });
                };
                [undefined, null].forEach(function(storageObj) {
                    sinon.stub(window, 'localStorage').value(storageObj);
                    checkImpl();
                });
            });
            it('should succeed otherwise unless the key or the value cannot be converted to a string', () => {
                if(isNode) {
                    const dom = new JSDOM('<!DOCTYPE html><html></html>', {
                        url: 'https://fake_url/', // so that accessing window.localStorage doesn't throw an exception
                    });
                    sinon.stub(global, 'window').value(dom.window);
                }
                funcParams.forEach(function(key) {
                    funcParams.forEach(function(val) {
                        if(JsuCmn.setLocalStorageItem(key, val)) {
                            assert.strictEqual(JsuCmn.getLocalStorageItem(key), val+'');
                        }
                        else { // fails because a symbol cannot be implicitly converted to a string
                               //     see Symbol type conversions in the documentation
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
                htmlVisualTagNames.forEach(function(tag) {
                    const elt = document.createElement(tag);
                    funcParams.forEach(function(vis) {
                        valfalCssDisplays.forEach(function(dsp) {
                            let testDisplay = undefined;
                            if(!isNode) {
                                // necessary for web browsers because dsp can be ignored when set as CSS display
                                elt.style.display = dsp;
                                const dspAllowed = elt.style.display === dsp; // is dsp a valid CSS display for elt?
                                if(!dspAllowed) testDisplay = elt.style.display;
                            }
                            JsuCmn.setEltVisible(elt, vis, dsp);
                            assert.strictEqual(elt.style.display, getCssDisplay(vis, dsp, testDisplay));
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
            it('should toggle the visibility of an HTML element', function() {
                this.timeout(0); // disable timeout limit for the test case
                htmlVisualTagNames.forEach(function(tag) {
                    const elt = document.createElement(tag);
                    [true, false].forEach(function(vis) {
                        valfalCssDisplays.forEach(function(dsp) {
                            const isEltVisible = sinon.stub(JsuCmn, 'isEltVisible').returns(vis);
                            const setEltVisible = sinon.stub(JsuCmn, 'setEltVisible');
                            JsuCmn.switchEltVisibility(elt, dsp);
                            assert.strictEqual(isEltVisible.calledOnceWithExactly(elt), true);
                            assert.strictEqual(setEltVisible.calledOnceWithExactly(elt, !isEltVisible.getCall(0).returnValue, dsp), true);
                            assert.strictEqual(setEltVisible.calledAfter(isEltVisible), true);
                            sinon.restore(); // avoid leak threshold warning (instead of isEltVisible.restore() and others for example)
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
            const acceptsValue = Number.isFinite;
            it('should return true only for a finite number that is not a string (when Number.isFinite() is available)', () => {
                assert.strictEqual(typeof Number.isFinite, 'function');
                sinon.stub(JsuCmn, 'isNumber').callsFake(JsuCmn._getIsNumberImpl());
                values.forEach(function(val) {
                    assert.strictEqual(JsuCmn.isNumber(val), acceptsValue(val));
                });
            });
            it('should return true only for a finite number that is not a string (when Number.isFinite() is not available)', () => {
                sinon.stub(Number, 'isFinite').value(undefined);
                sinon.stub(JsuCmn, 'isNumber').callsFake(JsuCmn._getIsNumberImpl());
                values.forEach(function(val) {
                    assert.strictEqual(JsuCmn.isNumber(val), acceptsValue(val));
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
            const acceptsValue = Array.isArray;
            it('should return true only for an array (when Array.isArray() is available)', () => {
                assert.strictEqual(typeof Array.isArray, 'function');
                sinon.stub(JsuCmn, 'isArray').callsFake(JsuCmn._getIsArrayImpl());
                funcParams.forEach(function(val) {
                    assert.strictEqual(JsuCmn.isArray(val), acceptsValue(val));
                });
            });
            it('should return true only for an array (when Array.isArray() is not available)', () => {
                sinon.stub(Array, 'isArray').value(undefined);
                sinon.stub(JsuCmn, 'isArray').callsFake(JsuCmn._getIsArrayImpl());
                funcParams.forEach(function(val) {
                    assert.strictEqual(JsuCmn.isArray(val), acceptsValue(val));
                });
            });
        });
    })();

    (function() {
        describe('isCssColor()', () => {
            it('should return the same value as CSS.supports() if the function is defined, or null otherwise', () => {
                const cssDefs = [undefined, {}, {supports:null}, {supports:sinon.fake(dummy)}];
                cssDefs.forEach(function(def) {
                    sinon.stub(isNode ? global : window, 'CSS').value(def);
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
                    sinon.restore(); // prevent "global leak(s) detected" warning in real browsers
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
        describe('copyPropsNoCheck() & copyPropsAndCheck()', () => {
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
                const testData = [
                  //[param1,                          param2,          expectedResult]
                    ['{0}',                           ['zero'],        'zero'],
                    ['{1}',                           ['zero', 'one'], 'one'],
                    ['{1}',                           ['one'],         '{1}'],
                    ['{0} {1} {0}',                   ['{1}', 'one'],  '{1} one {1}'],
                    ['x={x} y={?} z={z} x^2={x}*{x}', {x:0, y:1},      'x=0 y={?} z={z} x^2=0*0'],
                ];
                testData.forEach(function(arr) {
                    assert.strictEqual(JsuCmn.formatString(arr[0], arr[1]), arr[2]);
                    assert.strictEqual(JsuCmn.formatString(new String(arr[0]), arr[1]), arr[2]);
                });
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
                    const str = '{0}{1}{0}';
                    assert.strictEqual(str.format(...arr), JsuCmn.formatString(str, arr));
                    assert.strictEqual(new String(str).format(...arr), JsuCmn.formatString(str, arr));
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
                ['Wrong', 'Arial'].forEach(function(fontFamily) {
                    [
                        'font-family:'+fontFamily+'; just-ignore-me',
                        'font-family:'+fontFamily+'; ',
                        'font-family:'+fontFamily+';',
                        'font-family:'+fontFamily,
                    ].forEach(function(styleStr) {
                        assert.strictEqual(JsuCmn.parseInlineCssStyle(styleStr).fontFamily, fontFamily);
                        assert.strictEqual(JsuCmn.parseInlineCssStyle(new String(styleStr)).fontFamily, fontFamily);
                    });
                });
                assert.strictEqual(JsuCmn.parseInlineCssStyle('font-size:12px;').fontSize, '12px');
                assert.strictEqual(JsuCmn.parseInlineCssStyle(new String('font-size:12px;')).fontSize, '12px');
                assert.strictEqual(JsuCmn.parseInlineCssStyle('font-size:12').fontSize, '');
                assert.strictEqual(JsuCmn.parseInlineCssStyle(new String('font-size:12')).fontSize, '');
            });
            it('should correctly parse multiple CSS rules', () => {
                const styleStr = 'font-family:Arial; font-size:12px';
                [styleStr, new String(styleStr)].forEach(function(val) {
                    const obj = JsuCmn.parseInlineCssStyle(val);
                    assert.strictEqual(obj.fontFamily, 'Arial');
                    assert.strictEqual(obj.fontSize, '12px');
                });
            });
            it('should correctly parse a short-hand CSS rule', () => {
                // rule is taken from CSS font documentation and should set each of the following
                //     style | variant | weight | stretch | size/line-height | family
                const font = 'italic small-caps bolder condensed 16px/3 cursive';
                const rule = 'font: '+font+';';
                [rule, new String(rule)].forEach(function(val) {
                    const obj = JsuCmn.parseInlineCssStyle(val);
                    assert.strictEqual(obj.fontStyle, 'italic');
                    assert.strictEqual(obj.fontVariant, 'small-caps');
                    assert.strictEqual(obj.fontWeight, 'bolder');
                    assert.strictEqual(obj.fontFamily, 'cursive');
                    // it seems that jsdom sets the following obj properties differently when parseInlineCssStyle() is called
                    //     they are therefore not tested under Node.js
                    if(!isNode) {
                        // tests pass in browsers
                        assert.strictEqual(obj.font, font.replace('16px/3', '16px / 3'));
                        assert.strictEqual(obj.fontStretch, 'condensed');
                        assert.strictEqual(obj.fontSize, '16px');
//                        assert.strictEqual(obj.fontLineHeight, '3'); // fails, probably depends on browser versions
                    }
                });
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
            it('should not loop indefinitely when the pattern is the empty string', () => {
                const arr = ['', dummy()];
                arr.push(...arr.map(x => new String(x)));
                arr.forEach(function(val) {
                    // no assertion here because test case will not continue in case of infinite loop
                    JsuCmn.matchAllAndIndex(val, '');
                    JsuCmn.isolateMatchingData(val, '');
                    JsuCmn.isolateMatchingValues(val, '');
                });
            });

            it('should correctly indicate that no match was found', () => {
                let str = undefined, pattern = undefined, results = undefined;

                str = ''; pattern = '\\w+'; results = [null, [], []];
                [str, new String(str)].forEach(function(val) {
                    assert.deepStrictEqual(JsuCmn.matchAllAndIndex(val, pattern), results[0]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingData(val, pattern), results[1]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingValues(val, pattern), results[2]);
                });

                str = 'no digits'; pattern = '[0-9]'; results = [
                    null,
                    [
                        {value:'n', matched:false, index:0},
                        {value:'o', matched:false, index:1},
                        {value:' ', matched:false, index:2},
                        {value:'d', matched:false, index:3},
                        {value:'i', matched:false, index:4},
                        {value:'g', matched:false, index:5},
                        {value:'i', matched:false, index:6},
                        {value:'t', matched:false, index:7},
                        {value:'s', matched:false, index:8},
                    ],
                    ['n', 'o', ' ', 'd', 'i', 'g', 'i', 't', 's'],
                ];
                [str, new String(str)].forEach(function(val) {
                    assert.deepStrictEqual(JsuCmn.matchAllAndIndex(val, pattern), results[0]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingData(val, pattern), results[1]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingValues(val, pattern), results[2]);
                });
            });

            it('should correctly indicate that matches have been found', () => {
                const str = 'these are words', pattern = '\\w+', results = [
                    {0:'these', 6:'are', 10:'words'},
                    [
                        {value:'these', matched:true, index:0},
                        {value:' ', matched:false, index:5},
                        {value:'are', matched:true, index:6},
                        {value:' ', matched:false, index:9},
                        {value:'words', matched:true, index:10},
                    ],
                    ['these', ' ', 'are', ' ', 'words'],
                ];
                [str, new String(str)].forEach(function(val) {
                    assert.deepStrictEqual(JsuCmn.matchAllAndIndex(val, pattern), results[0]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingData(val, pattern), results[1]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingValues(val, pattern), results[2]);
                });
            });

            it('should correctly handle alternation in a regex pattern', () => {
                const str = 'a12bc z', pattern = '[0-9]+|[a-z]+', results = [
                    {0:'a', 1:'12', 3:'bc', 6:'z'},
                    [
                        {value:'a', matched:true, index:0},
                        {value:'12', matched:true, index:1},
                        {value:'bc', matched:true, index:3},
                        {value:' ', matched:false, index:5},
                        {value:'z', matched:true, index:6},
                    ],
                    ['a', '12', 'bc', ' ', 'z'],
                ];
                [str, new String(str)].forEach(function(val) {
                    assert.deepStrictEqual(JsuCmn.matchAllAndIndex(val, pattern), results[0]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingData(val, pattern), results[1]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingValues(val, pattern), results[2]);
                });
            });

            it('should correctly handle a regex pattern containing capturing groups', () => {
                let str = undefined, pattern = undefined, results = undefined;

                str = 'ab'; pattern = '(a|b)'; results = [
                    {0:'a', 1:'b'},
                    [
                        {value:'a', matched:true, index:0},
                        {value:'b', matched:true, index:1},
                    ],
                    ['a', 'b'],
                ];
                [str, new String(str)].forEach(function(val) {
                    assert.deepStrictEqual(JsuCmn.matchAllAndIndex(val, pattern), results[0]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingData(val, pattern), results[1]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingValues(val, pattern), results[2]);
                });

                str = 'ab'; pattern = '(a)|(b)'; results = [
                    {0:'a', 1:'b'},
                    [
                        {value:'a', matched:true, index:0},
                        {value:'b', matched:true, index:1},
                    ],
                    ['a', 'b'],
                ];
                [str, new String(str)].forEach(function(val) {
                    assert.deepStrictEqual(JsuCmn.matchAllAndIndex(val, pattern), results[0]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingData(val, pattern), results[1]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingValues(val, pattern), results[2]);
                });
            });

            it('should handle case sensitivity correctly', () => {
                let str = undefined, pattern = undefined, results = undefined;

                str = 'abABc'; pattern = '[a-z]'; results = [
                    {0:'a', 1:'b', 4:'c'},
                    [
                        {value:'a', matched:true, index:0},
                        {value:'b', matched:true, index:1},
                        {value:'A', matched:false, index:2},
                        {value:'B', matched:false, index:3},
                        {value:'c', matched:true, index:4},
                    ],
                    ['a', 'b', 'A', 'B', 'c'],
                ];
                [str, new String(str)].forEach(function(val) {
                    assert.deepStrictEqual(JsuCmn.matchAllAndIndex(val, pattern, false), results[0]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingData(val, pattern, false), results[1]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingValues(val, pattern, false), results[2]);
                });

                str = 'abABc'; pattern = '[a-z]'; results = [
                    {0:'a', 1:'b', 2:'A', 3:'B', 4:'c'},
                    [
                        {value:'a', matched:true, index:0},
                        {value:'b', matched:true, index:1},
                        {value:'A', matched:true, index:2},
                        {value:'B', matched:true, index:3},
                        {value:'c', matched:true, index:4},
                    ],
                    ['a', 'b', 'A', 'B', 'c'],
                ];
                [str, new String(str)].forEach(function(val) {
                    assert.deepStrictEqual(JsuCmn.matchAllAndIndex(val, pattern, true), results[0]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingData(val, pattern, true), results[1]);
                    assert.deepStrictEqual(JsuCmn.isolateMatchingValues(val, pattern, true), results[2]);
                });
            });
        });
    })();

    (function() {
        describe('cloneDeep()', () => {
            const clnd = JsuCmn.cloneDeep;

            // returns a custom empty cache according to JsuCmn.cloneDeep()
            const emptyCache = () => ({
                _keys: [],
                _vals: [],
                get: function(key) {
                    const idx = this._keys.indexOf(key);
                    return idx !== -1 ? this._vals[idx] : undefined;
                },
                add: function(key, val) {
                    this._keys.push(key);
                    this._vals.push(val);
                    return val;
                },
            });

            const checkCaching = (val) => {
                const arrList = [
                    ...[undefined, null, emptyCache()].map(
                        x => clnd([val, val], x)
                    ),
                    ...[undefined, null, emptyCache()].map(
                        // we use Object.entries(...).map(...) to create an array from an object
                        x => Object.entries(clnd({a:val, b:val}, x)).map(y => y[1])
                    ),
                ];
                arrList.forEach(function(arrVal) {
                    const firstElt = arrVal[0];
                    assert.strictEqual(arrVal.every(x => x === firstElt || (Number.isNaN(x) && Number.isNaN(firstElt))), true);
                });
            };

            const checkImpl = (val, checker) => {
                // check implementation with several copies of val
                const cloneCustomList = [undefined, sinon.fake.returns(dummy())];
                for(const cloneCustomImpl of cloneCustomList) {
                    const copy = clnd(val, undefined, cloneCustomImpl);
                    checker(copy, cloneCustomImpl);
                }
                // check data caching for val
                checkCaching(val);
            };

            const implParams = funcParams.slice(0); // all types of parameters handled by JsuCmn.cloneDeep()
            implParams.push(new Date());
            implParams.push(new Date('9999-12-31'));
            (function() {
                // check that implParams contains the expected values
                for(const typeVal of ['undefined', 'boolean', 'number', 'bigint', 'string', 'function', 'symbol']) {
                    assert.strictEqual(implParams.some(x => typeof x === typeVal), true);
                }
                assert.strictEqual(implParams.some(x => x === null), true);
                assert.strictEqual(implParams.some(x => x instanceof Boolean), true);
                assert.strictEqual(implParams.some(x => x instanceof Date), true);
                assert.strictEqual(implParams.some(x => x instanceof Number), true);
                assert.strictEqual(implParams.some(x => x instanceof String), true);
                assert.strictEqual(implParams.some(x => Array.isArray(x)), true);
                assert.strictEqual( // check for existence of object literal ({...}) or object created using new Object()
                    implParams.some(x => x !== undefined && x !== null && Object.getPrototypeOf(x) === Object.getPrototypeOf({})),
                    true
                );
            })();

            it('should correctly clone undefined and null', () => {
                [undefined, null].forEach(function(val) {
                    checkImpl(val, function(copy) {
                        assert.strictEqual(copy, val);
                    });
                });
            });

            it('should correctly clone a boolean', () => {
                const bools = [true, false];
                bools.forEach(function(val) {
                    checkImpl(val, function(copy) {
                        assert.strictEqual(copy, val);
                    });
                });
                bools.map(x => new Boolean(x)).forEach(function(val) {
                    checkImpl(val, function(copy) {
                        assert.strictEqual(copy instanceof Boolean, true);
                        assert.strictEqual(copy.valueOf(), val.valueOf());
                        assert.strictEqual(copy !== val, true);
                    });
                });
            });

            it('should correctly clone a number', () => {
                [NaN].forEach(function(val) {
                    checkImpl(val, function(copy) {
                        assert.strictEqual(Number.isNaN(copy) && Number.isNaN(val), true);
                    });
                });
                const numbers = implParams.filter(x => typeof x === 'number' && !Number.isNaN(x));
                numbers.forEach(function(val) {
                    checkImpl(val, function(copy) {
                        assert.strictEqual(copy, val);
                    });
                });
                numbers.map(x => new Number(x)).forEach(function(val) {
                    checkImpl(val, function(copy) {
                        assert.strictEqual(copy instanceof Number, true);
                        assert.strictEqual(copy.valueOf(), val.valueOf());
                        assert.strictEqual(copy !== val, true);
                    });
                });
            });

            it('should correctly clone a bigint', () => {
                implParams.filter(x => typeof x === 'bigint').forEach(function(val) {
                    checkImpl(val, function(copy) {
                        assert.strictEqual(copy, val);
                    });
                });
            });

            it('should correctly clone a string', () => {
                implParams.filter(x => typeof x === 'string').forEach(function(val) {
                    const strings = implParams.filter(x => typeof x === 'string');
                    strings.forEach(function(val) {
                        checkImpl(val, function(copy) {
                            assert.strictEqual(copy, val);
                        });
                    });
                    strings.map(x => new String(x)).forEach(function(val) {
                        checkImpl(val, function(copy) {
                            assert.strictEqual(copy instanceof String, true);
                            assert.strictEqual(copy.valueOf(), val.valueOf());
                            assert.strictEqual(copy !== val, true);
                        });
                    });
                });
            });

            it('should correctly clone a function', () => {
                [sinon.spy()].forEach(function(func) {
                    checkImpl(func, function(copy) {
                        assert.strictEqual(typeof copy, 'function');
                        copy(); copy();
                        assert.strictEqual(func.callCount, 2);
                        func.resetHistory();
                    });
                });
            });

            it('should correctly clone a symbol', () => {
                implParams.filter(x => typeof x === 'symbol').forEach(function(val) {
                    checkImpl(val, function(copy) {
                        assert.strictEqual(typeof copy, 'symbol');
                        assert.strictEqual(copy.description, val.description);
                        assert.strictEqual(copy !== val, true);
                    });
                });
            });

            it('should correctly clone a date', () => {
                implParams.filter(x => x instanceof Date).forEach(function(val) {
                    checkImpl(val, function(copy) {
                        assert.strictEqual(copy instanceof Date, true);
                        assert.strictEqual(copy.valueOf(), val.valueOf());
                        assert.strictEqual(copy !== val, true);
                    });
                });
            });

            it('should correctly clone an array (case 1: clone and original share the same structure)', () => {
                [[], [...implParams]].forEach(function(arr) {
                    checkImpl(arr, function(copy, cloneCustomImpl) {
                        assert.strictEqual(Array.isArray(copy), true);
                        (function() {
                            // compare array elements
                            assert.strictEqual(copy.length, arr.length);
                            if(!cloneCustomImpl) {
                                arr.forEach(function(val, i) {
                                    if(typeof val === 'symbol')
                                        assert.deepStrictEqual(copy[i].description, val.description);
                                    else if(Number.isNaN(val))
                                        assert.strictEqual(Number.isNaN(val), true);
                                    else
                                        assert.deepStrictEqual(copy[i], val);
                                });
                            }
                            else {
                                arr.forEach(function(val, i) {
                                    if(typeof val === 'symbol')
                                        assert.deepStrictEqual(copy[i].description, val.description);
                                    else if(Number.isNaN(val))
                                        assert.strictEqual(Number.isNaN(val), true);
                                    else if(val instanceof Boolean || val instanceof Date || val instanceof Number || val instanceof String)
                                        assert.deepStrictEqual(copy[i], val);
                                    else if(typeof val === 'object' && val !== null && !Array.isArray(val))
                                        assert.deepStrictEqual(copy[i], cloneCustomImpl.getCall(0).returnValue);
                                    else
                                        assert.deepStrictEqual(copy[i], val);
                                });
                            }
                        })();
                        assert.strictEqual(copy !== arr, true);
                    });
                });
            });

            it('should correctly clone an array (case 2: cloning is as deep as necessary)', () => {
                let arr = [dummy()];
                for(let i = 1; i <= 100; i++) {
                    const copy = clnd(arr);
                    arr.push(arr, copy);
                    arr = copy;
                }
                assert.deepStrictEqual(clnd(arr), arr);
            });

            it('should correctly clone other objects (case 1: an object literal having no circular references)', () => {
                const node = {x:dummy(), y:dummy(), parent:{x:dummy(), y:dummy()}};
                checkImpl(node, function(copy, cloneCustomImpl) {
                    if(!cloneCustomImpl) {
                        assert.deepStrictEqual(copy, {
                            x:node.x, y:node.y, parent:{x:node.parent.x, y:node.parent.y},
                        });
                    }
                    else assert.deepStrictEqual(copy, cloneCustomImpl.getCall(0).returnValue);
                });
            });

            it('should correctly clone other objects (case 2: an object literal with circular references)', () => {
                const node = {x:dummy(), y:dummy()};
                node.self = node;
                node.children = [{parent:node}, {parent:node}];
                node.z = dummy();
                checkImpl(node, function(copy, cloneCustomImpl) {
                    if(!cloneCustomImpl) {
                        assert.deepStrictEqual(copy, {
                            x:node.x, y:node.y, self:copy, children:[{parent:copy}, {parent:copy}], z:node.z,
                        });
                    }
                    else assert.deepStrictEqual(copy, cloneCustomImpl.getCall(0).returnValue);
                });
            });

            it('should correctly clone other objects (case 3: an object that is not an object literal)', () => {
                function Rectangle(width, height) {
                    this.width = width;
                    this.height = height;
                    const now = new Date();
                    Object.defineProperty(this, '_createdAt', {
                        get() { return now; },
                        enumerable: false,
                    });
                }
                Rectangle.prototype.area = function() { return this.width * this.height; };
                const obj = new Rectangle(1920, 1080);
                checkImpl(obj, function(copy, cloneCustomImpl) {
                    if(!cloneCustomImpl) {
                        assert.notDeepStrictEqual(copy, obj);
                        assert.deepStrictEqual(copy, {
                            width:obj.width, height:obj.height,
                            // non-enumerable properties (_createdAt) are ignored
                            // inherited properties (area) are ignored
                        });
                        assert.strictEqual(copy === obj, false);
                    }
                    else assert.deepStrictEqual(copy, cloneCustomImpl.getCall(0).returnValue);
                });
            });

            it('should correctly clone other objects (case 4: cloning is as deep as necessary)', () => {
                let obj = {x:dummy()};
                for(let i = 1; i <= 100; i++) {
                    const copy = clnd(obj);
                    obj.self1 = obj;
                    obj.self2 = copy;
                    obj = copy;
                }
                assert.deepStrictEqual(clnd(obj), obj);
            });

            it('should correctly handle the other aspects of cloneCustomImpl (case 1: it is ignored in favor of the default impl. if it returns undefined)', () => {
                const obj = {x:dummy()};
                implParams.filter(x => !Number.isNaN(x)).forEach(function(customClone) {
                    const cloneCustomImpl = sinon.fake.returns(customClone);
                    assert.deepStrictEqual(clnd(obj, undefined, cloneCustomImpl), (function() {
                        return customClone === undefined ? clnd(obj) : customClone;
                    })());
                });
            });

            it('should correctly handle the other aspects of cloneCustomImpl (case 2: it is not called if the value to be cloned is already cached)', () => {
                const propThreshold = 3;
                const obj = (function() {
                    const retVal = {};
                    for(let i = 1; i <= propThreshold; i++) {
                        retVal[dummy()] = {customCloning:true};
                        retVal[dummy()] = {customCloning:false};
                    }
                    return retVal;
                })();
                const cloneCustomImpl = sinon.fake(
                    // return a custom clone (whose value we don't cache) or undefined (so that the default clone algorithm can be used, including caching)
                    (value, cache) => value.customCloning ? 'customCloning-notCached-' + dummy() : undefined
                );
                const checkCalls = () => {
                    // check that cloning obj will not call cloneCustomImpl for already cached values
                    clnd(obj, undefined, cloneCustomImpl);
                    assert.strictEqual(cloneCustomImpl.callCount, 1 + 2 * propThreshold); // one call is for obj itself, the others for its properties
                    cloneCustomImpl.resetHistory();
                };

                checkCalls();

                (function() {
                    obj.self1 = obj.self2 = obj;
                })();
                checkCalls();

                (function() {
                    const data = [];
                    for(const prop in obj) {
                        if(!obj[prop].customCloning) data.push(obj[prop]);
                    }
                    obj.data = data;
                })();
                checkCalls();
            });
        });
    })();
})();
