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
                [
                  //[param1,                          param2,          expectedResult]
                    ['{0}',                           ['zero'],        'zero'],
                    ['{1}',                           ['zero', 'one'], 'one'],
                    ['{1}',                           ['one'],         '{1}'],
                    ['{0} {1} {0}',                   ['{1}', 'one'],  '{1} one {1}'],
                    ['x={x} y={?} z={z} x^2={x}*{x}', {x:0, y:1},      'x=0 y={?} z={z} x^2=0*0'],
                ].forEach(function(arr) {
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
                    //     they are therefore commented in the test case
//                    assert.strictEqual(obj.font.split(' ').sort().join(' '), font.split(' ').sort().join(' '));
//                    assert.strictEqual(obj.fontStretch, 'condensed');
//                    assert.strictEqual(obj.fontSize, '16px');
//                    assert.strictEqual(obj.fontLineHeight, '3');
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

            // helps create objects that contain more than one reference to a given object
            const cloneRefs = (obj) => [
                clnd([obj, obj]),
                Object.entries(clnd({a:obj, b:obj})).map(x => x[1]),
            ];

            it('should correctly clone undefined and null', () => {
                [undefined, null].forEach(function(val) {
                    assert.strictEqual(clnd(val), val);
                });
            });

            it('should correctly clone a boolean', () => {
                [true, false].forEach(function(val) {
                    assert.strictEqual(clnd(val), val);
                    const obj = new Boolean(val);
                    assert.strictEqual(clnd(obj) instanceof Boolean, true);
                    assert.strictEqual(clnd(obj).valueOf(), val);
                    assert.strictEqual(clnd(obj) !== obj, true);
                    cloneRefs(obj).forEach(function(arr) {
                        assert.strictEqual(arr.every(x => x === arr[0]), true);
                    });
                });
            });

            it('should correctly clone a number', () => {
                funcParams.filter(x => typeof x === 'number').forEach(function(val) {
                    assert.strictEqual(clnd(val), val);
                    const obj = new Number(val);
                    assert.strictEqual(clnd(obj) instanceof Number, true);
                    assert.strictEqual(clnd(obj).valueOf(), val);
                    assert.strictEqual(clnd(obj) !== obj, true);
                    cloneRefs(obj).forEach(function(arr) {
                        assert.strictEqual(arr.every(x => x === arr[0]), true);
                    });
                });
            });

            it('should correctly clone a bigint', () => {
                funcParams.filter(x => typeof x === 'bigint').forEach(function(val) {
                    assert.strictEqual(clnd(val), val);
                });
            });

            it('should correctly clone a string', () => {
                funcParams.filter(x => typeof x === 'string').forEach(function(val) {
                    assert.strictEqual(clnd(val), val);
                    const obj = new String(val);
                    assert.strictEqual(clnd(obj) instanceof String, true);
                    assert.strictEqual(clnd(obj).valueOf(), val);
                    assert.strictEqual(clnd(obj) !== obj, true);
                    cloneRefs(obj).forEach(function(arr) {
                        assert.strictEqual(arr.every(x => x === arr[0]), true);
                    });
                });
            });

            it('should correctly clone a function', () => {
                [sinon.spy()].forEach(function(func) {
                    assert.strictEqual(typeof clnd(func), 'function');
                    clnd(func)();
                    clnd(func)();
                    assert.strictEqual(func.calledTwice, true);
                });
            });

            it('should correctly clone a symbol', () => {
                funcParams.filter(x => typeof x === 'symbol').forEach(function(val) {
                    assert.strictEqual(typeof clnd(val), 'symbol');
                    assert.strictEqual(clnd(val).description, val.description);
                    assert.strictEqual(clnd(val) !== val, true);
                });
            });

            it('should correctly clone a date', () => {
                [new Date(), new Date('9999-12-31')].forEach(function(obj) {
                    assert.strictEqual(clnd(obj) instanceof Date, true);
                    assert.strictEqual(clnd(obj).valueOf(), obj.valueOf());
                    assert.strictEqual(clnd(obj) !== obj, true);
                    cloneRefs(obj).forEach(function(arr) {
                        assert.strictEqual(arr.every(x => x === arr[0]), true);
                    });
                });
            });

            it('should correctly clone an array', () => {
                const strictlyComparableValues = funcParams.filter(
                    x => x === null || !['object', 'symbol'].includes(typeof x)
                );
                assert.strictEqual(strictlyComparableValues.length !== 0, true);
                [[], ...strictlyComparableValues.map(x => [x])].forEach(function(arr) {
                    assert.strictEqual(Array.isArray(clnd(arr)), true);
                    assert.deepStrictEqual(clnd(arr), arr);
                    assert.strictEqual(clnd(arr) !== arr, true);
                });

                const diff = funcParams.filter(x => !strictlyComparableValues.includes(x));
                assert.strictEqual(diff.length !== 0, true);
                diff.map(x => [x]).forEach(function(arr) {
                    assert.strictEqual(Array.isArray(clnd(arr)), true);
                    assert.deepStrictEqual(clnd(arr).every((x, i) => {
                        // you can console.log(x) here if changes to funcParams cause tests to fail
                        if(x instanceof Boolean || x instanceof Number || x instanceof String)
                            return x.valueOf() === arr[i].valueOf();
                        if(typeof x === 'symbol')
                            return x.description === arr[i].description;
                        if(
                            Object.getPrototypeOf(x) === Object.prototype // plain object: literal ({...}) or new Object() for example
                         || Array.isArray(x)
                        )
                            return JSON.stringify(x) === JSON.stringify(arr[i]);
                        return false; // failure
                    }), true);
                    assert.strictEqual(clnd(arr) !== arr, true);
                });
            });

            it('should correctly clone an object literal (having circular references)', () => {
                const node = {x:dummy(), y:dummy()};
                node.self = node;
                node.children = [{parent:node}, {parent:node}];
                node.z = dummy();
                const nodeClone = clnd(node);
                assert.deepStrictEqual(nodeClone, {
                    x:node.x, y:node.y, self:nodeClone, children:[{parent:nodeClone}, {parent:nodeClone}], z:node.z,
                });
            });

            it('should partially clone an arbitrary object', () => {
                function Rectangle(width, height, depth) {
                    this.width = width;
                    this.height = height;
                    const now = new Date();
                    Object.defineProperty(this, '_createdAt', {
                        get() { return now; },
                        enumerable: false,
                    });
                }
                Rectangle.prototype.area = function() { return this.height * this.width; };
                const source = new Rectangle(1920, 1080);
                const target = clnd(source);
                assert.strictEqual(target !== source, true);
                assert.strictEqual('area' in target, false); // inherited properties are ignored
                assert.strictEqual('_createdAt' in target, false); // non-enumerable properties are ignored
                assert.notDeepStrictEqual(target, source);
                assert.strictEqual(Object.getPrototypeOf(target), Object.getPrototypeOf({}));
                Object.setPrototypeOf(target, Rectangle.prototype);
                assert.deepStrictEqual(target, source);
            });
        });
    })();
})();
