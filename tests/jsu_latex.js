/*
 https://github.com/arlogy/jsu
 Released under the MIT License (see LICENSE file)
 Copyright (c) 2022 https://github.com/arlogy
*/

const JsuLtx = require('../src/jsu_latex.js');

const { dummy, objectHasOnlyProperties } = require('./utils_core.js');

const assert = require('assert');
const sinon = require('sinon');
afterEach(() => {
    sinon.restore(); // restore the default sandbox to prevent memory leak
});

(function() {
    const JsuCmn = require('../src/jsu_common.js');

    // helps verify that each distinct LaTeX shortcut data is considered during a test case
    // will fail if new properties not in props are added
    const checkShortcutData = (props) => {
        assert.deepStrictEqual(
            objectHasOnlyProperties(JsuLtx.getLatexShortcutData(), props),
            true
        );
    };

    (function() {
        describe('getGreekLetterNames()', () => {
            it('should return the expected array', () => {
                assert.deepStrictEqual(JsuLtx.getGreekLetterNames(), [
                    'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta',
                    'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu',
                    'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon',
                    'Phi', 'Chi', 'Psi', 'Omega',
                ]);
            });
            it('should return distinct references for multiple calls', () => {
                const func = JsuLtx.getGreekLetterNames;
                const a = func(), b = func(), c = func();
                assert.strictEqual(a === b, false);
                assert.strictEqual(b === c, false);
                assert.strictEqual(a === c, false);
            });
        });
    })();

    (function() {
        describe('getLatexShortcutData()', () => {
            it('should return the expected object', () => {
                assert.deepStrictEqual(JsuLtx.getLatexShortcutData(), (function() {
                    const greekLetterNames = JsuLtx.getGreekLetterNames();
                    let greekPatterns = greekLetterNames.map(function(name) {
                        return ['\\\\' + name, '\\\\' + name.toLowerCase()];
                    });
                    greekPatterns = greekPatterns.flat();
                    return {
                        'greekLetter': {
                            'pattern': {
                                'value': greekPatterns.join('|'),
                                'list': greekPatterns,
                                'specialChar': '\\\\',
                            },
                            'extra': {
                                'specialChar': '\\',
                                'shortcuts': greekPatterns.map(x => x.substring(1)),
                            },
                        },
                        'subscript': {
                            'pattern': {
                                'value': '_[0-9]',
                                'list': ['_0', '_1', '_2', '_3', '_4', '_5', '_6', '_7', '_8', '_9'],
                                'specialChar': '_',
                            },
                            'extra': {
                                'specialChar': '_',
                                'shortcuts': ['_0', '_1', '_2', '_3', '_4', '_5', '_6', '_7', '_8', '_9'],
                            },
                        },
                    };
                })());
            });
            it('should return distinct references for multiple calls', () => {
                const func = JsuLtx.getLatexShortcutData;
                const a = func(), b = func(), c = func();
                assert.strictEqual(a === b, false);
                assert.strictEqual(b === c, false);
                assert.strictEqual(a === c, false);
            });
        });
    })();

    (function() {
        describe('getSafetyPadding()', () => {
            it('should return a non-empty primitive string', () => {
                const safetyPadding = JsuLtx.getSafetyPadding();
                assert.strictEqual(typeof safetyPadding, 'string');
                assert.strictEqual(safetyPadding.length !== 0, true);
            });
            it('should not introduce a LaTeX shortcut if added before and/or after a substring of a LaTeX shortcut', () => {
                const padding = JsuLtx.getSafetyPadding();
                const shortcuts = (function() {
                    const retVal = [];
                    const latexShortcutData = JsuLtx.getLatexShortcutData();
                    for(const prop in latexShortcutData) {
                        retVal.push(...latexShortcutData[prop].extra.shortcuts);
                    }
                    return retVal;
                })();
                assert.strictEqual(JsuLtx.convertLatexShortcuts(padding), padding);
                for(const shortcut of shortcuts) {
                    let acc = '';
                    for(const charac of [...shortcut]) {
                        acc += charac;
                        for(const str of [acc, new String(acc)]) {
                            assert.strictEqual(JsuLtx.convertLatexShortcuts(str + padding), JsuLtx.convertLatexShortcuts(str) + padding);
                            assert.strictEqual(JsuLtx.convertLatexShortcuts(padding + str), padding + JsuLtx.convertLatexShortcuts(str));
                            assert.strictEqual(JsuLtx.convertLatexShortcuts(padding + str + padding), padding + JsuLtx.convertLatexShortcuts(str) + padding);
                        }
                    }
                }
            });
        });
    })();

    (function() {
        describe('findLatexShortcutSpecialCharsAndIndex()', () => {
            it('should bahave as expected', () => {
                const param = dummy();
                const matchAllAndIndex = sinon.stub(JsuCmn, 'matchAllAndIndex').returns(dummy());
                const retVal = JsuLtx.findLatexShortcutSpecialCharsAndIndex(param);
                assert.strictEqual(matchAllAndIndex.calledOnce, true);
                assert.strictEqual(matchAllAndIndex.getCall(0).args.length, 2);
                assert.strictEqual(matchAllAndIndex.getCall(0).args[0], param);
                assert.strictEqual(typeof matchAllAndIndex.getCall(0).args[1], 'string');
                assert.strictEqual(retVal, matchAllAndIndex.getCall(0).returnValue);
            });
        });
    })();

    (function() {
        describe('isolateLatexShortcutData()', () => {
            it('should bahave as expected', () => {
                const param = dummy();
                const isolateMatchingData = sinon.stub(JsuCmn, 'isolateMatchingData').returns(dummy());
                const retVal = JsuLtx.isolateLatexShortcutData(param);
                assert.strictEqual(isolateMatchingData.calledOnce, true);
                assert.strictEqual(isolateMatchingData.getCall(0).args.length, 2);
                assert.strictEqual(isolateMatchingData.getCall(0).args[0], param);
                assert.strictEqual(typeof isolateMatchingData.getCall(0).args[1], 'string');
                assert.strictEqual(retVal, isolateMatchingData.getCall(0).returnValue);
            });
        });
    })();

    (function() {
        describe('isolateLatexShortcutValues()', () => {
            it('should bahave as expected', () => {
                const param = dummy();
                const isolateMatchingValues = sinon.stub(JsuCmn, 'isolateMatchingValues').returns(dummy());
                const retVal = JsuLtx.isolateLatexShortcutValues(param);
                assert.strictEqual(isolateMatchingValues.calledOnce, true);
                assert.strictEqual(isolateMatchingValues.getCall(0).args.length, 2);
                assert.strictEqual(isolateMatchingValues.getCall(0).args[0], param);
                assert.strictEqual(typeof isolateMatchingValues.getCall(0).args[1], 'string');
                assert.strictEqual(retVal, isolateMatchingValues.getCall(0).returnValue);
            });
        });
    })();

    (function() {
        describe('convertLatexShortcuts()', () => {
            const greekLetterNames = JsuLtx.getGreekLetterNames();
            const latexShortcutData = JsuLtx.getLatexShortcutData();
            const subscriptDigits = latexShortcutData.subscript.pattern.list.map(x => parseInt(x[1], 10));
            assert.deepStrictEqual(subscriptDigits, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); // just for understanding
            const checkData = (shortcut, conversion) => {
                for(const str of [shortcut, new String(shortcut)]) {
                    const retVal = JsuLtx.convertLatexShortcuts(str);
                    assert.strictEqual(retVal, conversion);
                    assert.strictEqual(retVal.length, JsuLtx.isolateLatexShortcutData(str).length); // see (1) below
                    // (1) check that the values returned by JsuLtx.convertLatexShortcuts() and
                    //     JsuLtx.isolateLatexShortcutData() have the same length, which is stated
                    //     in the documentation of JsuLtx.isolateLatexShortcutData() (and assumed in
                    //     the documentation and implementation of JsuLtx.insertString() for example)
                }
            };
            // rules from the properties of JsuLtx.getLatexShortcutData() are duplicated below for readability
            //     using \ and _ instead of the corresponding property names for example
            it('should correctly convert one shortcut at a time', () => {
                for(let i = 0; i < greekLetterNames.length; i++) {
                    const name = greekLetterNames[i];
                    checkData('\\' + name, String.fromCharCode(913 + i + (i > 16)));
                    checkData('\\' + name.toLowerCase(), String.fromCharCode(945 + i + (i > 16)));
                }
                for(let i = 0; i < subscriptDigits.length; i++) {
                    const shortcut = '_' + i;
                    const conversion = String.fromCharCode(8320 + i);
                    checkData(shortcut, conversion);
                    // check that only one digit is taken into account if more than one follow the special character '_' in shortcut
                    for(let j = 0; j < subscriptDigits.length; j++) {
                        checkData(shortcut + j, conversion + j);
                    }
                }
            });
            it('should correctly convert several shortcuts at a time', () => {
                let shortcuts = [];
                shortcuts.push(...greekLetterNames.map(function(name) {
                    return '\\' + name + '\\' + name.toLowerCase();
                }));
                shortcuts.push(...subscriptDigits.map(function(digit) {
                    return '_' + digit;
                }));
                shortcuts.push('again', ...shortcuts);
                shortcuts = shortcuts.join(' ');
                let conversions = [];
                conversions.push(...greekLetterNames.map(function(name, i) {
                    return String.fromCharCode(913 + i + (i > 16)) + String.fromCharCode(945 + i + (i > 16));
                }));
                conversions.push(...subscriptDigits.map(function(digit, i) {
                    return String.fromCharCode(8320 + i);
                }));
                conversions.push('again', ...conversions);
                conversions = conversions.join(' ');
                checkData(shortcuts, conversions);
            });
            it('should correctly convert a stable value (unchanged after conversion)', () => {
                const entries = ['', '0', ' ', 'text text', '\\', '_'];
                for(const val of entries) {
                    checkData(val, val);
                }
            });
        });
    })();

    (function() {
        describe('replaceSpecialCharsInLatexShortcuts()', () => {
            const options = [undefined, null, {}];
            for(const greekLetterRepl of [undefined, null, 'xxx']) {
                for(const subscriptRepl of [undefined, null, 'yyy']) {
                    for(const paddingEnabled of [undefined, null, true, false]) {
                        options.push({greekLetterRepl, subscriptRepl, paddingEnabled});
                    }
                }
            }
            const latexShortcutData = JsuLtx.getLatexShortcutData();
            const specialChars = [], shortcuts = [];
            for(const prop in latexShortcutData) {
                specialChars.push(latexShortcutData[prop].extra.specialChar);
                shortcuts.push(...latexShortcutData[prop].extra.shortcuts);
            }
            const safetyPadding = JsuLtx.getSafetyPadding();
            specialChars.push(...specialChars.map(x => x + safetyPadding + x)); // account for multiple occurrences
            shortcuts.push(...shortcuts.map(x => x + safetyPadding + x)); // same here
            it('should not replace special characters that are not part of a LaTeX shortcut', () => {
                for(const opt of options) {
                    for(const sc of specialChars) {
                        assert.strictEqual(JsuLtx.replaceSpecialCharsInLatexShortcuts(sc, opt), sc);
                        assert.strictEqual(JsuLtx.replaceSpecialCharsInLatexShortcuts(new String(sc), opt), sc);
                    }
                    let sc = specialChars.join('');
                    assert.strictEqual(JsuLtx.replaceSpecialCharsInLatexShortcuts(sc, opt), sc);
                    assert.strictEqual(JsuLtx.replaceSpecialCharsInLatexShortcuts(new String(sc), opt), sc);
                }
            });
            it('should replace characters that are part of a LaTeX shortcut (and only those) accordingly', () => {
                const replaceAllSpecialChars = (str, opt) => {
                    // this function replaces all special characters, not just those in LaTeX shortcuts
                    // so it is different from JsuLtx.replaceSpecialCharsInLatexShortcuts()
                    //     which ignores special characters that are not part of a LaTeX shortcut
                    if(!opt) opt = {};
                    const greekLetterRepl = opt.greekLetterRepl;
                    const subscriptRepl = opt.subscriptRepl;
                    const padding = opt.paddingEnabled ? safetyPadding : '';
                    if(greekLetterRepl !== undefined && greekLetterRepl !== null) {
                        str = str.replace(new RegExp(latexShortcutData.greekLetter.pattern.specialChar, 'g'), padding + greekLetterRepl + padding);
                    }
                    if(subscriptRepl !== undefined && subscriptRepl !== null) {
                        str = str.replace(new RegExp(latexShortcutData.subscript.pattern.specialChar, 'g'), padding + subscriptRepl + padding);
                    }
                    return str;
                };
                const ss = specialChars.join(''); // stable string (a string that should not be converted after conversion)
                for(const opt of options) {
                    let res1 = undefined, res2 = undefined;
                    for(let sc of shortcuts) {
                        assert.strictEqual(JsuLtx.replaceSpecialCharsInLatexShortcuts(sc, opt), res1 = replaceAllSpecialChars(sc, opt));
                        assert.strictEqual(JsuLtx.replaceSpecialCharsInLatexShortcuts(new String(sc), opt), res1);
                        assert.strictEqual(JsuLtx.replaceSpecialCharsInLatexShortcuts(ss + sc + ss, opt), res2 = ss + replaceAllSpecialChars(sc, opt) + ss);
                        assert.strictEqual(JsuLtx.replaceSpecialCharsInLatexShortcuts(new String(ss + sc + ss), opt), res2);
                    }
                    let sc = shortcuts.join('');
                    assert.strictEqual(JsuLtx.replaceSpecialCharsInLatexShortcuts(sc, opt), res1 = replaceAllSpecialChars(sc, opt));
                    assert.strictEqual(JsuLtx.replaceSpecialCharsInLatexShortcuts(new String(sc), opt), res1);
                    assert.strictEqual(JsuLtx.replaceSpecialCharsInLatexShortcuts(ss + sc + ss, opt), res2 = ss + replaceAllSpecialChars(sc, opt) + ss);
                    assert.strictEqual(JsuLtx.replaceSpecialCharsInLatexShortcuts(new String(ss + sc + ss), opt), res2);
                }
            });
        });
    })();

    (function() {
        describe('combineLatexSubscripts()', () => {
            const subscripts = JsuLtx.getLatexShortcutData().subscript.extra.shortcuts;
            it('should not combine subscripts that are not next to each other', () => {
                for(let sc of subscripts) {
                    assert.strictEqual(JsuLtx.combineLatexSubscripts(sc), sc);
                    assert.strictEqual(JsuLtx.combineLatexSubscripts(new String(sc)), sc);
                    sc = sc + ' ' + sc;
                    assert.strictEqual(JsuLtx.combineLatexSubscripts(sc), sc);
                    assert.strictEqual(JsuLtx.combineLatexSubscripts(new String(sc)), sc);
                }
            });
            it('should combine subscripts that are next to each other', () => {
                assert.strictEqual(JsuLtx.combineLatexSubscripts(subscripts.join('')), '_{0123456789}');
                for(let sc1 of subscripts) {
                    for(let sc2 of subscripts) {
                        let res = undefined;
                        assert.strictEqual(JsuLtx.combineLatexSubscripts(sc1 + sc2 + sc1), res = '_{' + sc1[1] + sc2[1] + sc1[1] + '}');
                        assert.strictEqual(JsuLtx.combineLatexSubscripts(new String(sc1 + sc2 + sc1)), res);
                    }
                }
            });
        });
    })();

    (function() {
        describe('rewriteLatexCommands()', () => {
            it('should handle the pattern according to JsuCmn.isolateMatchingData()', () => {
                // this test case ensures that the pattern parameter will be correctly processed to avoid an infinite loop for example
                //     see the test cases of JsuCmn.isolateMatchingData()
                const join = sinon.fake.returns(dummy());
                const map = () => ({join});
                const isolateMatchingData = sinon.stub(JsuCmn, 'isolateMatchingData').returns({map});
                const str = dummy(), pattern = dummy();
                const retVal = JsuLtx.rewriteLatexCommands(str, pattern);
                assert.strictEqual(isolateMatchingData.calledOnceWithExactly(str, pattern), true);
                assert.strictEqual(join.calledOnce, true);
                assert.strictEqual(retVal, join.getCall(0).returnValue);
            });
            it('should correctly rewrite a LaTeX command', () => {
                const testData = [
                  //[str,                                                pattern,             expectedResult],
                            // invariants
                    ['\\cmd',                                            '\\\\cmd',           '\\cmd'],
                    ['\\cmd0',                                           '\\\\cmd',           '\\cmd0'],
                    ['\\cmd1bc',                                         '\\\\cmd',           '\\cmd1bc'],
                    ['\\cmd123',                                         '\\\\cmd',           '\\cmd123'],
                    ['\\cmd ',                                           '\\\\cmd',           '\\cmd '],
                            // non-invariants (single entry)
                    ['\\cmda',                                           '\\\\cmd',           '\\cmd{}a'],
                    ['\\Cmda',                                           '\\\\cmd',           '\\Cmda'], // voluntarily kept here (as non-invariants)
                    ['\\cmdAbc',                                         '\\\\cmd',           '\\cmd{}Abc'],
                    ['\\CmdAbc',                                         '\\\\cmd',           '\\CmdAbc'], // voluntarily kept here (as non-invariants)
                            // non-invariants (multiple entries)
                    ['\\cmd \\cmd1 \\cmd \\cmd1 \\cmdabc \\cmd2 \\cmdc', '\\\\cmd',           '\\cmd \\cmd1 \\cmd \\cmd1 \\cmd{}abc \\cmd2 \\cmd{}c'],
                    ['\\cmd1a \\cmd2b \\cmd3c',                          '\\\\cmd1|\\\\cmd3', '\\cmd1{}a \\cmd2b \\cmd3{}c'],
                ];
                for(const arr of testData) {
                    assert.strictEqual(JsuLtx.rewriteLatexCommands(arr[0], arr[1]), arr[2]);
                    assert.strictEqual(JsuLtx.rewriteLatexCommands(new String(arr[0]), arr[1]), arr[2]);
                }
            });
        });
    })();

    (function() {
        describe('rewriteKnownLatexCommands()', () => {
            it('should correctly rewrite LaTeX commands', () => {
                const latexShortcutData = JsuLtx.getLatexShortcutData();
                const joinAll = (patterns) => {
                    if(!patterns) patterns = [];
                    patterns = patterns.slice(0);
                    patterns.push(...latexShortcutData.greekLetter.pattern.list);
                    patterns.sort(function (a, b) { return b.localeCompare(a); });
                    return patterns.join('|');
                };
                const str = dummy();
                for(const patterns of [undefined, null, [], [dummy()], [dummy(), dummy()]]) {
                    const rewriteLatexCommands = sinon.stub(JsuLtx, 'rewriteLatexCommands').returns(dummy());
                    const initialPatterns = JsuCmn.cloneDeep(patterns);
                    const retVal = JsuLtx.rewriteKnownLatexCommands(str, patterns);
                    assert.deepStrictEqual(patterns, initialPatterns); // patterns is unchanged
                    assert.strictEqual(rewriteLatexCommands.calledOnceWithExactly(str, joinAll(patterns)), true);
                    assert.strictEqual(retVal, rewriteLatexCommands.getCall(0).returnValue);
                    rewriteLatexCommands.restore();
                }
            });
        });
    })();

    (function() {
        describe('toLatex()', () => {
            const sep = '---'; // content separator; must be set to a value that will not be converted when passed to toLatex()
            const latexSpecialCharsStr = '\\^ ~${}&#%_';
            const basicStr = (() => { // basic string to understand what to expect from toLatex()
                const latexSubscriptsToPossiblyCombineStr = '_0_1_0/_0/_a_0_1'; // see (1) below
                const latexCommandsToPossiblyRewriteStr = '\\alphab\\alpha2\\cmdb\\cmd2'; // see (2) below
                return [
                    latexSpecialCharsStr,
                    latexSubscriptsToPossiblyCombineStr,
                    latexCommandsToPossiblyRewriteStr,
                ].join(sep);
                // (1) '_a' is not a LaTeX subscript, so it will not be combined and '_' will be considered as a LaTeX special character
                // (2) '\cmd' is not a LaTeX command, so it will not be rewritten and '\' will be considered as a LaTeX special character
            })();
            const advancedStr = (() => { // advanced string
                const latexShortcutData = JsuLtx.getLatexShortcutData();
                const latexCommands = latexShortcutData.greekLetter.extra.shortcuts;
                latexCommands.push('\\xyz');
                const latexSubscripts = latexShortcutData.subscript.extra.shortcuts;
                latexSubscripts.push('_xyz');
                checkShortcutData(['greekLetter', 'subscript']);
                return [
                    // special characters
                    latexSpecialCharsStr,
                    // subscripts that might be combined or not
                    latexSubscripts.join('/'),
                    latexSubscripts.map(x => x + x).join('/'),
                    latexSubscripts.map(x => x + ' ' + x + '_9').join('/'),
                    // commands that might be rewritten or not
                    latexCommands.join('/'),
                    latexCommands.map(x => x + 'abc').join('/'),
                    latexCommands.map(x => x + 123).join('/'),
                ].join(sep)
            })();
            it('should not convert the text when the mode is invalid', () => {
                for(const input of [basicStr, advancedStr]) {
                    for(const mode of [undefined, null, dummy()]) {
                        assert.strictEqual(JsuLtx.toLatex(input, mode), input);
                        assert.strictEqual(JsuLtx.toLatex(new String(input), mode), input);
                    }
                }
            });
            it('should convert the text correctly otherwise (mode = text)', () => {
                (function() {
                    const str1 = '\\textbackslash\\textasciicircum \\textasciitilde\\$\\{\\}\\&\\#\\%\\_';
                    const str2 = '_{010}/_0/\\_a_{01}';
                    const str3 = '\\alpha{}b\\alpha2\\textbackslash{}cmdb\\textbackslash{}cmd2';
                    for(const input of [basicStr, new String(basicStr)]) {
                        const retVal = JsuLtx.toLatex(input, 'text');
                        assert.deepStrictEqual(retVal.split(sep), [str1, str2, str3]);
                        assert.strictEqual(typeof retVal, 'string');
                    }
                })();
                (function() {
                    const str1 = '\\textbackslash\\textasciicircum \\textasciitilde\\$\\{\\}\\&\\#\\%\\_';
                    const str2 = '_0/_1/_2/_3/_4/_5/_6/_7/_8/_9/\\_xyz';
                    const str3 = '_{00}/_{11}/_{22}/_{33}/_{44}/_{55}/_{66}/_{77}/_{88}/_{99}/\\_xyz\\_xyz';
                    const str4 = '_0 _{09}/_1 _{19}/_2 _{29}/_3 _{39}/_4 _{49}/_5 _{59}/_6 _{69}/_7 _{79}/_8 _{89}/_9 _{99}/\\_xyz \\_xyz_9';
                    const str5 = '\\Alpha/\\alpha/\\Beta/\\beta/\\Gamma/\\gamma/\\Delta/\\delta/\\Epsilon/\\epsilon/\\Zeta/\\zeta/\\Eta/\\eta/\\Theta/\\theta/\\Iota/\\iota/\\Kappa/\\kappa/\\Lambda/\\lambda/\\Mu/\\mu/\\Nu/\\nu/\\Xi/\\xi/\\Omicron/\\omicron/\\Pi/\\pi/\\Rho/\\rho/\\Sigma/\\sigma/\\Tau/\\tau/\\Upsilon/\\upsilon/\\Phi/\\phi/\\Chi/\\chi/\\Psi/\\psi/\\Omega/\\omega/\\textbackslash{}xyz';
                    const str6 = '\\Alpha{}abc/\\alpha{}abc/\\Beta{}abc/\\beta{}abc/\\Gamma{}abc/\\gamma{}abc/\\Delta{}abc/\\delta{}abc/\\Epsilon{}abc/\\epsilon{}abc/\\Zeta{}abc/\\zeta{}abc/\\Eta{}abc/\\eta{}abc/\\Theta{}abc/\\theta{}abc/\\Iota{}abc/\\iota{}abc/\\Kappa{}abc/\\kappa{}abc/\\Lambda{}abc/\\lambda{}abc/\\Mu{}abc/\\mu{}abc/\\Nu{}abc/\\nu{}abc/\\Xi{}abc/\\xi{}abc/\\Omicron{}abc/\\omicron{}abc/\\Pi{}abc/\\pi{}abc/\\Rho{}abc/\\rho{}abc/\\Sigma{}abc/\\sigma{}abc/\\Tau{}abc/\\tau{}abc/\\Upsilon{}abc/\\upsilon{}abc/\\Phi{}abc/\\phi{}abc/\\Chi{}abc/\\chi{}abc/\\Psi{}abc/\\psi{}abc/\\Omega{}abc/\\omega{}abc/\\textbackslash{}xyzabc';
                    const str7 = '\\Alpha123/\\alpha123/\\Beta123/\\beta123/\\Gamma123/\\gamma123/\\Delta123/\\delta123/\\Epsilon123/\\epsilon123/\\Zeta123/\\zeta123/\\Eta123/\\eta123/\\Theta123/\\theta123/\\Iota123/\\iota123/\\Kappa123/\\kappa123/\\Lambda123/\\lambda123/\\Mu123/\\mu123/\\Nu123/\\nu123/\\Xi123/\\xi123/\\Omicron123/\\omicron123/\\Pi123/\\pi123/\\Rho123/\\rho123/\\Sigma123/\\sigma123/\\Tau123/\\tau123/\\Upsilon123/\\upsilon123/\\Phi123/\\phi123/\\Chi123/\\chi123/\\Psi123/\\psi123/\\Omega123/\\omega123/\\textbackslash{}xyz123';
                    for(const input of [advancedStr, new String(advancedStr)]) {
                        const retVal = JsuLtx.toLatex(input, 'text');
                        assert.deepStrictEqual(retVal.split(sep), [str1, str2, str3, str4, str5, str6, str7]);
                        assert.strictEqual(typeof retVal, 'string');
                    }
                })();
            });
            it('should convert the text correctly otherwise (mode = math)', () => {
                (function() {
                    const str1 = '\\backslash\\hat\\mbox{ }\\sim\\$\\{\\}\\&\\#\\%\\_';
                    const str2 = '_{010}/_0/\\_a_{01}';
                    const str3 = '\\alpha{}b\\alpha2\\backslash{}cmdb\\backslash{}cmd2';
                    for(const input of [basicStr, new String(basicStr)]) {
                        const retVal = JsuLtx.toLatex(input, 'math');
                        assert.deepStrictEqual(retVal.split(sep), [str1, str2, str3]);
                        assert.strictEqual(typeof retVal, 'string');
                    }
                })();
                (function() {
                    const str1 = '\\backslash\\hat\\mbox{ }\\sim\\$\\{\\}\\&\\#\\%\\_';
                    const str2 = '_0/_1/_2/_3/_4/_5/_6/_7/_8/_9/\\_xyz';
                    const str3 = '_{00}/_{11}/_{22}/_{33}/_{44}/_{55}/_{66}/_{77}/_{88}/_{99}/\\_xyz\\_xyz';
                    const str4 = '_0\\mbox{ }_{09}/_1\\mbox{ }_{19}/_2\\mbox{ }_{29}/_3\\mbox{ }_{39}/_4\\mbox{ }_{49}/_5\\mbox{ }_{59}/_6\\mbox{ }_{69}/_7\\mbox{ }_{79}/_8\\mbox{ }_{89}/_9\\mbox{ }_{99}/\\_xyz\\mbox{ }\\_xyz_9';
                    const str5 = '\\Alpha/\\alpha/\\Beta/\\beta/\\Gamma/\\gamma/\\Delta/\\delta/\\Epsilon/\\epsilon/\\Zeta/\\zeta/\\Eta/\\eta/\\Theta/\\theta/\\Iota/\\iota/\\Kappa/\\kappa/\\Lambda/\\lambda/\\Mu/\\mu/\\Nu/\\nu/\\Xi/\\xi/\\Omicron/\\omicron/\\Pi/\\pi/\\Rho/\\rho/\\Sigma/\\sigma/\\Tau/\\tau/\\Upsilon/\\upsilon/\\Phi/\\phi/\\Chi/\\chi/\\Psi/\\psi/\\Omega/\\omega/\\backslash{}xyz';
                    const str6 = '\\Alpha{}abc/\\alpha{}abc/\\Beta{}abc/\\beta{}abc/\\Gamma{}abc/\\gamma{}abc/\\Delta{}abc/\\delta{}abc/\\Epsilon{}abc/\\epsilon{}abc/\\Zeta{}abc/\\zeta{}abc/\\Eta{}abc/\\eta{}abc/\\Theta{}abc/\\theta{}abc/\\Iota{}abc/\\iota{}abc/\\Kappa{}abc/\\kappa{}abc/\\Lambda{}abc/\\lambda{}abc/\\Mu{}abc/\\mu{}abc/\\Nu{}abc/\\nu{}abc/\\Xi{}abc/\\xi{}abc/\\Omicron{}abc/\\omicron{}abc/\\Pi{}abc/\\pi{}abc/\\Rho{}abc/\\rho{}abc/\\Sigma{}abc/\\sigma{}abc/\\Tau{}abc/\\tau{}abc/\\Upsilon{}abc/\\upsilon{}abc/\\Phi{}abc/\\phi{}abc/\\Chi{}abc/\\chi{}abc/\\Psi{}abc/\\psi{}abc/\\Omega{}abc/\\omega{}abc/\\backslash{}xyzabc';
                    const str7 = '\\Alpha123/\\alpha123/\\Beta123/\\beta123/\\Gamma123/\\gamma123/\\Delta123/\\delta123/\\Epsilon123/\\epsilon123/\\Zeta123/\\zeta123/\\Eta123/\\eta123/\\Theta123/\\theta123/\\Iota123/\\iota123/\\Kappa123/\\kappa123/\\Lambda123/\\lambda123/\\Mu123/\\mu123/\\Nu123/\\nu123/\\Xi123/\\xi123/\\Omicron123/\\omicron123/\\Pi123/\\pi123/\\Rho123/\\rho123/\\Sigma123/\\sigma123/\\Tau123/\\tau123/\\Upsilon123/\\upsilon123/\\Phi123/\\phi123/\\Chi123/\\chi123/\\Psi123/\\psi123/\\Omega123/\\omega123/\\backslash{}xyz123';
                    for(const input of [advancedStr, new String(advancedStr)]) {
                        const retVal = JsuLtx.toLatex(input, 'math');
                        assert.deepStrictEqual(retVal.split(sep), [str1, str2, str3, str4, str5, str6, str7]);
                        assert.strictEqual(typeof retVal, 'string');
                    }
                })();
            });
        });
    })();

    (function() {
        const latexShortcutData = JsuLtx.getLatexShortcutData();
        const shortcuts = [];
        for(const prop in latexShortcutData) {
            shortcuts.push(...latexShortcutData[prop].extra.shortcuts.slice(0, 4)); // select a sub-array to reduce test execution time
            shortcuts.push(latexShortcutData[prop].extra.specialChar); // added on purpose for maximum test coverage
        }
        const safetyPadding = JsuLtx.getSafetyPadding();
        shortcuts.push(...shortcuts.map(x => x + safetyPadding + x)); // account for multiple occurrences

        const strArrToUpdate = shortcuts.slice(0);
        const strArrToInsert = shortcuts.slice(0);
        strArrToInsert.push(dummy());

        describe('insertString()', () => {
            const checkTestData = (testData) => {
                for(const arr of testData) {
                    const cursorPos = arr[1], expectedResult = arr[3];
                    for(const strToUpdate of [arr[0], new String(arr[0])]) {
                        for(const strToInsert of [arr[2], new String(arr[2])]) {
                            assert.deepStrictEqual(JsuLtx.insertString(strToUpdate, cursorPos, strToInsert), expectedResult);
                        }
                    }
                }
            };
            it('should behave as expected when a shortcut is not implicitly introduced after insertion', function() {
                this.timeout(5000); // set timeout limit for the test case
                const testData = (function() {
                    const retVal = [];
                    for(const strToUpdate of strArrToUpdate) {
                        const minPos = 0, maxPos = JsuLtx.convertLatexShortcuts(strToUpdate).length;
                        const vals = JsuLtx.isolateLatexShortcutValues(strToUpdate);
                        for(const strToInsert of strArrToInsert) {
                            retVal.push([strToUpdate, minPos - 1, strToInsert, null]);
                            retVal.push([strToUpdate, maxPos + 1, strToInsert, null]);
                            for(const cursorPos of [minPos, Math.floor((minPos + maxPos)/2), maxPos]) {
                                retVal.push([strToUpdate, cursorPos, strToInsert, (function() {
                                    const nextStrBeforeCursor = vals.slice(0, cursorPos).join('') + strToInsert;
                                    const strAfterCursor = vals.slice(cursorPos).join('');
                                    return {
                                        newStr: nextStrBeforeCursor + strAfterCursor,
                                        newPos: JsuLtx.convertLatexShortcuts(nextStrBeforeCursor).length,
                                    };
                                })()]);
                            }
                        }
                    }
                    return retVal;
                })();
                checkTestData(testData);
            });
            it('should behave as expected when a shortcut is implicitly introduced after insertion', () => {
                checkShortcutData(['greekLetter', 'subscript']);
                const testData = [
                            // shortcut implicitly inserted at the beginning
                    ['alpha',                        0,         '\\',                  {newStr:'\\alpha', newPos:1}],
                    ['pha',                          0,         '\\al',                {newStr:'\\alpha', newPos:1}],
                    ['phaxy',                        0,         'yx\\al',              {newStr:'yx\\alphaxy', newPos:3}],
                    ['pha\\alpha\\betaxy',           0,         'yx\\beta\\alpha\\al', {newStr:'yx\\beta\\alpha\\alpha\\alpha\\betaxy', newPos:5}],
                    ['0',                            0,         '_',                   {newStr:'_0', newPos:1}],
                    ['0_',                           0,         '_',                   {newStr:'_0_', newPos:1}],
                    ['0_xy',                         0,         'yx_',                 {newStr:'yx_0_xy', newPos:3}],
                    ['0_1_2_xy',                     0,         'yx_2_1_',             {newStr:'yx_2_1_0_1_2_xy', newPos:5}],
                            // shortcut implicitly inserted elsewhere
                    ['\\alph',                       5,         'a',                   {newStr:'\\alpha', newPos:1}],
                    ['\\ala',                        3,         'ph',                  {newStr:'\\alpha', newPos:1}],
                    ['xx\\alayy',                    5,         'ph',                  {newStr:'xx\\alphayy', newPos:3}],
                    ['xx\\alpha\\beta\\ala\\betayy', 7,         'ph',                  {newStr:'xx\\alpha\\beta\\alpha\\betayy', newPos:5}],
                    ['_',                            1,         '0',                   {newStr:'_0', newPos:1}],
                    ['_',                            1,         '0_',                  {newStr:'_0_', newPos:2}],
                    ['xx_yy',                        3,         '0',                   {newStr:'xx_0yy', newPos:3}],
                    ['xx_0_1__1yy',                  5,         '0',                   {newStr:'xx_0_1_0_1yy', newPos:5}],
                ];
                checkTestData(testData);
            });
        });

        describe('deleteOne()', () => {
            const checkTestData = (testData) => {
                for(const arr of testData) {
                    const cursorPos = arr[1], expectedResult = arr[2];
                    for(const strToUpdate of [arr[0], new String(arr[0])]) {
                        assert.deepStrictEqual(JsuLtx.deleteOne(strToUpdate, cursorPos), expectedResult);
                    }
                }
            };
            it('should behave as expected when a shortcut is not implicitly introduced after deletion', () => {
                const testData = (function() {
                    const retVal = [];
                    for(const strToUpdate of strArrToUpdate) {
                        const minPos = 1, maxPos = JsuLtx.convertLatexShortcuts(strToUpdate).length;
                        const vals = JsuLtx.isolateLatexShortcutValues(strToUpdate);
                        retVal.push([strToUpdate, minPos - 1, null]);
                        retVal.push([strToUpdate, maxPos + 1, null]);
                        for(const cursorPos of [minPos, Math.floor((minPos + maxPos)/2), maxPos]) {
                            retVal.push([strToUpdate, cursorPos, (function() {
                                const nextCursorPos = cursorPos - 1;
                                const nextStrBeforeCursor = vals.slice(0, nextCursorPos).join('');
                                return {
                                    newStr: nextStrBeforeCursor + vals.slice(cursorPos).join(''),
                                    newPos: nextCursorPos,
                                };
                            })()]);
                        }
                    }
                    return retVal;
                })();
                checkTestData(testData);
            });
            it('should behave as expected when a shortcut is implicitly introduced after deletion', () => {
                checkShortcutData(['greekLetter', 'subscript']);
                const testData1 = [
                    ['\\aalpha',                        2, {newStr:'\\alpha', newPos:1}],
                    ['xx\\aalphayy',                    4, {newStr:'xx\\alphayy', newPos:3}],
                    ['xx\\alpha\\beta\\aalpha\\betayy', 6, {newStr:'xx\\alpha\\beta\\alpha\\betayy', newPos:5}],
                ];
                testData1.push(...testData1.map(x => [x[0], x[1] + 1, x[2]]));
                const testData2 = [
                    ['_a0',                            2, {newStr:'_0', newPos:1}],
                    ['xx_a0yy',                        4, {newStr:'xx_0yy', newPos:3}],
                    ['xx_0_1_a0_1yy',                  6, {newStr:'xx_0_1_0_1yy', newPos:5}],
                ];
                checkTestData([...testData1, ...testData2]);
            });
        });
    })();
})();
