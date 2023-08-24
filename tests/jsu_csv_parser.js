/*
 https://github.com/arlogy/jsu
 Released under the MIT License (see LICENSE file)
 Copyright (c) 2022 https://github.com/arlogy
*/

const JsuCsvPsr = require('../src/jsu_csv_parser.js');

const { dummy } = require('./utils_core.js');
const { funcParams } = require('./utils_test_data.js');

const assert = require('assert');
const sinon = require('sinon');
afterEach(() => {
    sinon.restore(); // restore the default sandbox to prevent memory leak
});

const scriptArgs = process.argv.slice(2);
const quickCheck = scriptArgs.includes('--quick-check'); // for local tests; allows faster execution of tests
if(quickCheck) {
    const str = 'Note: quick check is enabled';
    before(() => {
        console.log(str + '\n');
    });
    after(() => {
        console.log(str);
    });
}

(function() {
    const JsuCmn = require('../src/jsu_common.js');

    const dummyStr = () => dummy() + ''; // used to explicitly indicate that what we want is a dummy string

    const DefaultDoNotSkipLine = -1; // this value or any other invalid value will be ignored when it comes to skipping lines
    const validLineSkippingValues = [
        JsuCsvPsr.LineIsReallyEmpty, JsuCsvPsr.LineIsBlank, JsuCsvPsr.LineHasOnlyBlankFields,
    ];
    // the following assertion helps detect values that must be added to or removed from validLineSkippingValues;
    // if it fails:
    //     - update the array below accordingly
    //     - update validLineSkippingValues accordingly (if necessary)
    //     - look for JsuCsvPsr.* expressions to add or remove line skipping options accordingly
    assert.deepStrictEqual(Object.keys(JsuCsvPsr).sort(), [
        'LineHasOnlyBlankFields',
        'LineIsBlank',
        'LineIsReallyEmpty',
        '_getInfo',
        '_getMissingDelimiterInfo',
        '_getUnescapedDelimiterInfo',
    ]);

    const stdLineSeps = ['\r', '\n', '\r\n']; // standard line separators (aka line breaks)
    const escapeRegExp = (str) => { // also see sChars
        return str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    };
    const getConfigFrom = (options) => {
        // read options
        if(options === undefined) options = {};
        let fieldDels = 'fieldDelimiter' in options ? [options.fieldDelimiter] : ['"'];
        let fieldSeps = 'fieldSeparators' in options ? options.fieldSeparators : [','];
        let lineSeps = 'lineSeparators' in options ? options.lineSeparators : ['\n'];
        const smartRegex = 'smartRegex' in options === false || options.smartRegex === true;
        const skipEmptyLinesWhen = 'skipEmptyLinesWhen' in options ? options.skipEmptyLinesWhen : DefaultDoNotSkipLine;
        const skipLinesWithWarnings = 'skipLinesWithWarnings' in options && options.skipLinesWithWarnings === true;

        // convert object strings to primitive strings
        fieldDels = fieldDels.map(x => x instanceof String ? x.toString() : x);
        if(Array.isArray(fieldSeps)) fieldSeps = fieldSeps.map(x => x instanceof String ? x.toString() : x);
        if(Array.isArray(lineSeps)) lineSeps = lineSeps.map(x => x instanceof String ? x.toString() : x);

        // set other options accordingly
        const regexOptimized = smartRegex &&
                               fieldDels.every(x => x.length === 1) &&
                               fieldSeps.every(x => x.length === 1) &&
                               lineSeps.every(x => stdLineSeps.indexOf(x) !== -1); // (1)
        let regexPatterns = [];
        if(regexOptimized) { // (2.1)
            const regexFieldDels = fieldDels.map(x => escapeRegExp(x)).join('');
            const regexFieldSeps = fieldSeps.map(x => escapeRegExp(x)).join('');
            regexPatterns = [
                '[^' + regexFieldDels + regexFieldSeps + '\n\r]+', // the line breaks are characters from stdLineSeps
                '[' + regexFieldDels + regexFieldSeps + ']',
                stdLineSeps.slice(0).sort().reverse().join('|'),
            ];
        }
        else { // (2.2)
            regexPatterns = fieldDels.concat(fieldSeps, lineSeps);
            regexPatterns = regexPatterns.map(x => escapeRegExp(x));
            regexPatterns.sort().reverse();
            regexPatterns.push('.', '\n', '\r');
        }

        return {
            'fieldDelimiter': fieldDels[0],
            'fieldSeparators': fieldSeps,
            'lineSeparators': lineSeps,
            'smartRegex': smartRegex,
            'regexOptimized': regexOptimized,
            'regexPattern': regexPatterns.join('|'),
            'skipEmptyLinesWhen': skipEmptyLinesWhen,
            'skipLinesWithWarnings': skipLinesWithWarnings,
        };
    };
    const sChars = [ // define special characters to test that regular expressions are escaped (using escapeRegExp())
        '.', '*', '+', '-', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\',
    ];
    const optionsForSmartRegex = (smartRegex) => {
        const retVal = [{smartRegex}];
        // separate special characters to avoid duplicates
        const sChars1 = sChars.slice(0, sChars.length/3);
        const sChars2 = sChars.slice(sChars.length/3, 2*sChars.length/3);
        const sChars3 = sChars.slice(2*sChars.length/3);
        // add other options related to smartRegex
        //     - with the initialization of regexOptimized in mind: see (1) above
        for(const fieldDelimiter of ['x', 'xx']) {
            for(const fieldSeparators of [['y'], ['yy'], ['y', 'yy']]) {
                for(const lineSeparators of [stdLineSeps, ['z'], ['zz'], [...stdLineSeps, 'z', 'zz']]) {
                    retVal.push({smartRegex, fieldDelimiter, fieldSeparators, lineSeparators});
                }
            }
        }
        //    - with the use of regexOptimized in mind: see (2.1) and (2.2) above
        const arr = quickCheck ? [
            {sc1:sChars1, sc2:sChars2, sc3:sChars3},
        ] : [
            {sc1:sChars1, sc2:sChars2, sc3:sChars3},
            {sc1:sChars1, sc2:sChars3, sc3:sChars2},
            {sc1:sChars2, sc2:sChars1, sc3:sChars3},
            {sc1:sChars2, sc2:sChars3, sc3:sChars1},
            {sc1:sChars3, sc2:sChars1, sc3:sChars2},
            {sc1:sChars3, sc2:sChars2, sc3:sChars1},
        ];
        for(const {sc1, sc2, sc3} of arr) {
            for(const fieldDelimiter of [...sc1, sc1.join('')]) {
                for(const fieldSeparators of [...sc2.map(x => [x]), [...sc2], [sc2.join('')]]) {
                    for(const lineSeparators of [...sc3.map(x => [x]), [...sc3], [sc3.join('')]]) {
                        retVal.push({smartRegex, fieldDelimiter, fieldSeparators, lineSeparators});
                    }
                }
            }
        }
        return retVal;
    };
    const wSpaces = [ // define whitespaces to test content skipping by option skipEmptyLinesWhen
        ' ', '\f', '\n', '\r', '\t', '\v',
        '\xA0', // non-breaking space
    ];
    assert.strictEqual(wSpaces.every(x => x.trim() === ''), true); // consistency check
    const optionsForSkipEmptyLinesWhen = (skipEmptyLinesWhen) => {
        const retVal = [{skipEmptyLinesWhen}];
        // separate whitespaces to avoid duplicates
        const wSpaces1 = wSpaces.slice(0, wSpaces.length/3);
        const wSpaces2 = wSpaces.slice(wSpaces.length/3, 2*wSpaces.length/3);
        const wSpaces3 = wSpaces.slice(2*wSpaces.length/3);
        // add other options related to skipEmptyLinesWhen
        for(const fieldDelimiter of [dummyStr()]) {
            for(const fieldSeparators of [[dummyStr()]]) {
                for(const lineSeparators of [[dummyStr()]]) {
                    retVal.push({skipEmptyLinesWhen, fieldDelimiter, fieldSeparators, lineSeparators});
                }
            }
        }
        const arr = quickCheck ? [
            {ws1:wSpaces1, ws2:wSpaces2, ws3:wSpaces3},
        ] : [
            {ws1:wSpaces1, ws2:wSpaces2, ws3:wSpaces3},
            {ws1:wSpaces1, ws2:wSpaces3, ws3:wSpaces2},
            {ws1:wSpaces2, ws2:wSpaces1, ws3:wSpaces3},
            {ws1:wSpaces2, ws2:wSpaces3, ws3:wSpaces1},
            {ws1:wSpaces3, ws2:wSpaces1, ws3:wSpaces2},
            {ws1:wSpaces3, ws2:wSpaces2, ws3:wSpaces1},
        ];
        for(const {ws1, ws2, ws3} of arr) {
            for(const fieldDelimiter of [...ws1, ws1.join('')]) {
                for(const fieldSeparators of [...ws2.map(x => [x]), [ws2.join('')]]) {
                    for(const lineSeparators of [...ws3.map(x => [x]), [ws3.join('')]]) {
                        retVal.push({skipEmptyLinesWhen, fieldDelimiter, fieldSeparators, lineSeparators});
                    }
                }
            }
        }
        return retVal;
    };
    const optionsArr1 = [
        undefined, {},
        {fieldDelimiter:dummyStr()},
        {fieldSeparators:[dummyStr()]},
        {lineSeparators:[dummyStr()]},
        ...optionsForSmartRegex(true), ...optionsForSmartRegex(false),
        ...optionsForSkipEmptyLinesWhen(dummy()), ...validLineSkippingValues.map(x => optionsForSkipEmptyLinesWhen(x)).flat(),
        {skipLinesWithWarnings:true}, {skipLinesWithWarnings:false},
    ];
    const optionsArr2 = []; // useful to check that object strings can be used (instead of primary strings in optionsArr1)
    for(let obj of optionsArr1) {
        obj = Object.assign({}, obj); // a shallow copy is sufficient here
        let changed = false;
        for(const prop in obj) {
            const val = obj[prop];
            if(typeof val === 'string') {
                obj[prop] = new String(val);
                changed = true;
            }
        }
        if(changed) optionsArr2.push(obj);
    }
    const validTestOptions = [...optionsArr1, ...optionsArr2];

    (function() {
        describe('new JsuCsvPsr()', () => {
            it('should throw a RangeError when fieldSeparators or lineSeparators is not an array', () => {
                const nonArrays = funcParams.filter(x => !Array.isArray(x));
                for(const val of nonArrays) {
                    const fieldSeparators = val, lineSeparators = val;
                    for(const options of [{fieldSeparators}, {lineSeparators}, {fieldSeparators, lineSeparators}]) {
                        assert.throws(() => new JsuCsvPsr(options), RangeError);
                    }
                }
            });
            it('should throw a RangeError when fieldDelimiter, fieldSeparators or lineSeparators is not a non-empty string or contains values other than such strings', () => {
                const nonStrings = funcParams.filter(x => !JsuCmn.isString(x));
                for(const val of [...nonStrings, '']) {
                    const fieldDelimiter = val, fieldSeparators = [val], lineSeparators = [val];
                    for(const options of [{fieldDelimiter}, {fieldSeparators}, {lineSeparators}, {fieldDelimiter, fieldSeparators, lineSeparators}]) {
                        assert.throws(() => new JsuCsvPsr(options), RangeError);
                    }
                }
            });
            it('should throw a RangeError when fieldSeparators or lineSeparators contains duplicates', () => {
                const val1 = dummyStr(), val2 = dummyStr();
                for(const fieldSeparators of [[val1, val1], [val1, new String(val1)]]) {
                    for(const lineSeparators of [[val2, val2], [val2, new String(val2)]]) {
                        for(const options of [{fieldSeparators}, {lineSeparators}, {fieldSeparators, lineSeparators}, {fieldSeparators, lineSeparators:fieldSeparators}]) {
                            assert.throws(() => new JsuCsvPsr(options), RangeError);
                        }
                    }
                }
            });
            it("should throw a RangeError when fieldDelimiter, fieldSeparators or lineSeparators reuse each other's values", () => {
                const val = dummyStr();
                for(const _val of [val, new String(val)]) {
                    const fieldDelimiter = _val, fieldSeparators = [_val], lineSeparators = [_val];
                    for(const options of [
                        {fieldDelimiter, fieldSeparators}, {fieldDelimiter, lineSeparators}, {fieldSeparators, lineSeparators}, {fieldDelimiter, fieldSeparators, lineSeparators},
                    ]) {
                        assert.throws(() => new JsuCsvPsr(options), RangeError);
                    }
                }
            });
            it('should return a valid object when options is valid', () => {
                for(const options of validTestOptions) {
                    const parser = new JsuCsvPsr(options);
                    assert.deepStrictEqual(parser.getConfig(), getConfigFrom(options));
                    assert.strictEqual(parser.hasPendingData(), false);
                    assert.deepStrictEqual(parser.getRecordsRef(), []);
                    assert.deepStrictEqual(parser.getWarningsRef(), []);
                }
            });
        });
    })();

    (function() {
        describe('getConfig()', () => {
            it('should not reflect changes to the-returned-object on the parser', () => {
                for(const options of validTestOptions) {
                    const parser = new JsuCsvPsr(options);
                    const initialConfig = getConfigFrom(options); // called initialConfig because we already know that it is equal to parser.getConfig()
                    // change the value of each property of parser.getConfig() accordingly
                    (function(config) {
                        for(const prop in config) {
                            const val = config[prop];
                            if(Array.isArray(val)) config[prop].push(dummy());
                            else if(JsuCmn.isString(val)) config[prop] = dummy();
                            else {
                                const tov = typeof val;
                                if(tov === 'boolean' || tov === 'number') config[prop] = dummy();
                                else throw new Error(`'${JSON.stringify(val)}' has an unexpected '${tov}' type`);
                            }
                        }
                    })(parser.getConfig());
                    // check that parser.getConfig() still returns the initial configuration despite the changes made above
                    //     so if the function returned any parser data as-is (i.e. without copying it first), the assertion below would fail
                    assert.deepStrictEqual(parser.getConfig(), initialConfig);
                }
            });
        });
    })();

    (function() {
        const clonePsr = (parser) => { // clones a parser; useful to preserve the parser data for further checks for example
            parser = JsuCmn.cloneDeep(parser);
            Object.setPrototypeOf(parser, JsuCsvPsr.prototype);
            return parser;
        };
        const csvToken = '@';
        const getCsvStr = (fieldDels, fieldSeps, lineSeps) => { // returns an arbitrary string that can be safely used for CSV parsing
            let str = dummyStr();
            // disambiguate str so that it can be used for CSV parsing
            const csvSpecialChars = [...fieldDels, ...fieldSeps, ...lineSeps];
            assert.strictEqual( // prevent unexpected behavior during subsequent str parsing
                csvSpecialChars.every(x => x !== csvToken), true,
                `'${csvToken}' must not be a field or line delimiter/separator as it is used for disambiguation`
            );
            for(const x of csvSpecialChars) {
                str = str.replaceAll(x, csvToken);
            }
            return str;
        };
        const getTestStrsExcluding = (ids, fieldDels, fieldSeps, lineSeps) => { // returns an array of strings excluding those matching the given ids
                                                                                // the returned strings can be safely used for CSV parsing
            let arr = [
                '',
                getCsvStr(fieldDels, fieldSeps, lineSeps),
                ...fieldDels, ...fieldSeps, ...lineSeps,
            ];
            arr = [...new Set(arr)]; // remove (useless) duplicates
            for(const id of ids) {
                switch(id) {
                    case 'fieldDels': arr = arr.filter(x => !fieldDels.includes(x)); break;
                    case 'fieldSeps': arr = arr.filter(x => !fieldSeps.includes(x)); break;
                    case 'lineSeps': arr = arr.filter(x => !lineSeps.includes(x)); break;
                    default: throw new Error('Exclusion ID must be fieldDels, fieldSeps or lineSeps');
                }
            }
            return arr;
        };
        const checkImpl = (checker) => {
            for(const options of validTestOptions) {
                const parser = new JsuCsvPsr(options);
                const {fieldDelimiter, fieldSeparators, lineSeparators, skipEmptyLinesWhen, skipLinesWithWarnings} = parser.getConfig();
                const fieldDels = [fieldDelimiter], fieldSeps = fieldSeparators, lineSeps = lineSeparators; // convenient short names
                const skipEl = skipEmptyLinesWhen, skipLw = skipLinesWithWarnings; // convenient short names
                const strArrBut = (ids) => getTestStrsExcluding(ids, fieldDels, fieldSeps, lineSeps);
                checker({parser, fieldDels, fieldSeps, lineSeps, skipEl, skipLw, strArrBut});
            }
        };
        const checkData = (parser, pending, records, warnings) => {
            assert.strictEqual(parser.hasPendingData(), pending, 'hasPendingData() not matched');
            assert.deepStrictEqual(parser.getRecordsRef(), records, 'getRecordsRef() not matched');
            assert.deepStrictEqual(parser.getWarningsRef(), warnings, 'getWarningsRef() not matched');
        };

        describe('readChunk(A+B) is equivalent to readChunk(A) followed by readChunk(B) when A+B does not introduce a line separator (which is a special CSV string)', () => {
            it('should be verified when fieldDels are read', () => {
                checkImpl(function({parser, fieldDels}) {
                    const parser1 = parser;
                    const parser2 = clonePsr(parser);
                    parser1.readChunk(fieldDels.join(''));
                    for(const fieldDel of fieldDels) parser2.readChunk(fieldDel);
                    checkData(parser1, parser2.hasPendingData(), parser2.getRecordsRef(), parser2.getWarningsRef());
                });
            });
            it('should be verified when fieldSeps are read', () => {
                checkImpl(function({parser, fieldSeps}) {
                    const parser1 = parser;
                    const parser2 = clonePsr(parser);
                    parser1.readChunk(fieldSeps.join(''));
                    for(const fieldSep of fieldSeps) parser2.readChunk(fieldSep);
                    checkData(parser1, parser2.hasPendingData(), parser2.getRecordsRef(), parser2.getWarningsRef());
                });
            });
            it('should be verified when lineSeps are read', () => {
                checkImpl(function({parser, lineSeps}) {
                    const parser1 = parser;
                    const parser2 = clonePsr(parser);
                    parser1.readChunk(lineSeps.join(csvToken));
                    lineSeps.forEach(function(lineSep, i) {
                        if(i !== 0) parser2.readChunk(csvToken);
                        parser2.readChunk(lineSep);
                    });
                    checkData(parser1, parser2.hasPendingData(), parser2.getRecordsRef(), parser2.getWarningsRef());
                });
            });
            it('should be verified when strings other than fieldDels, fieldSeps and lineSeps are read', () => {
                checkImpl(function({parser, strArrBut}) {
                    const parser1 = parser;
                    const parser2 = clonePsr(parser);
                    const arr = strArrBut(['fieldDels', 'fieldSeps', 'lineSeps']);
                    parser1.readChunk(arr.join(csvToken));
                    arr.forEach(function(val, i) {
                        if(i !== 0) parser2.readChunk(csvToken);
                        parser2.readChunk(val);
                    });
                    checkData(parser1, parser2.hasPendingData(), parser2.getRecordsRef(), parser2.getWarningsRef());
                });
            });
        });

        describe('hasPendingData() & getRecordsRef() & getWarningsRef() & flush() & reset(), after readChunk()', () => {
            const checkFlush = (parser, records, warnings) => {
                parser = clonePsr(parser);
                parser.flush();
                checkData(parser, false, records, warnings);
            };
            const checkReset = (parser) => {
                parser = clonePsr(parser);
                parser.reset();
                checkData(parser, false, [], []);
            };
            const emptyLineRecArr = (n) => Array(n).fill(['']); // returns an array of records each describing an empty line
            const recFrom = (n, x) => Array(n).fill(x); // returns a record of a given size containing only a given value
            const processTransition_q0_fieldSep_i_lineSep_j_fieldSep_k_q0 = (i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine) => {
                // read input (fieldSep^i lineSep^j fieldSep^k), i>=1, j>=0, k>=0
                for(let x = 0; x < i; x++) parser.readChunk(fieldSep);
                for(let x = 0; x < j; x++) parser.readChunk(lineSep);
                for(let x = 0; x < k; x++) parser.readChunk(fieldSep);
                // check expectations
                const skipCsvData = skipDataLine(false, fieldSep.trim() === '' && lineSep.trim() === '', true, false);
                if(j === 0) {
                    checkData(parser, true, [], []);
                    if(skipCsvData) {
                        checkFlush(parser, [], []);
                    }
                    else {
                        checkFlush(parser, [recFrom(i + k + 1, '')], []);
                    }
                }
                else {
                    const pending = k !== 0;
                    const records = [];
                    if(!skipCsvData) records.push(recFrom(i + 1, '')); // for the first set of fieldSep and the first following lineSep
                    if(!skipEmptyLine) records.push(...emptyLineRecArr(j - 1)); // for the remaining set of lineSep
                    checkData(parser, pending, records, []);
                    if(pending && !skipCsvData) {
                        checkFlush(parser, [...records, recFrom(k + 1, '')], []);
                    }
                    else {
                        checkFlush(parser, records, []);
                    }
                }
                checkReset(parser);
                // clear read data
                parser.reset();
            };
            const processTransition_q0_lineSep_i_fieldSep_j_lineSep_k_q0 = (i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine) => {
                // read input (lineSep^i fieldSep^j lineSep^k), i>=1, j>=0, k>=0
                for(let x = 0; x < i; x++) parser.readChunk(lineSep);
                for(let x = 0; x < j; x++) parser.readChunk(fieldSep);
                for(let x = 0; x < k; x++) parser.readChunk(lineSep);
                // check expectations
                const skipCsvData = skipDataLine(false, fieldSep.trim() === '' && lineSep.trim() === '', true, false);
                if(k === 0) {
                    const pending = j !== 0;
                    const records = [];
                    if(!skipEmptyLine) records.push(...emptyLineRecArr(i)); // for the first set of lineSep
                    checkData(parser, pending, records, []);
                    if(pending && !skipCsvData) {
                        checkFlush(parser, [...records, recFrom(j + 1, '')], []);
                    }
                    else {
                        checkFlush(parser, records, []);
                    }
                }
                else {
                    const records = [];
                    if(!skipEmptyLine) records.push(...emptyLineRecArr(i)); // for the first set of lineSep
                    if(j === 0) {
                        if(!skipEmptyLine) records.push(...emptyLineRecArr(k)); // for the second set of lineSep
                    }
                    else {
                        if(!skipCsvData) records.push(recFrom(j + 1, '')); // for the first set of fieldSep and the first following lineSep
                        if(!skipEmptyLine) records.push(...emptyLineRecArr(k - 1)); // for the remaining set of lineSep
                    }
                    checkData(parser, false, records, []);
                    checkFlush(parser, records, []);
                }
                checkReset(parser);
                // clear read data
                parser.reset();
            };
            const fsmTransitions = { // object describing key transitions of the internal FSM of JsuCsvPsr: maps a state ID, an input
                                     // and the corresponding destination state ID to an input tester (a function capable of actually
                                     // reading the input and checking it has been read correctly)
                                     //
                                     // please note that understanding of the internal FSM is not necessary to write the unit tests: all
                                     // that matter are the input samples to be tested, but we have designed the tests with the internal
                                     // FSM state names in mind so that it is easier to understand how said input samples (transition
                                     // inputs) are read by the parser (being tested)
                'q0 -> fieldDel -> q2': function({parser, fieldDels, skipDataLine}) {
                    for(const fieldDel of fieldDels) {
                        // read input
                        parser.readChunk(fieldDel);
                        // check expectations
                        const skipCsvData = skipDataLine(false, fieldDel.trim() === '', true, true);
                        checkData(parser, true, [], []);
                        if(skipCsvData) {
                            checkFlush(parser, [], []);
                        }
                        else {
                            checkFlush(parser, [['']], [{
                                context: 'DelimitedField',
                                linePos: 1,
                                message: `Expects field delimiter (${fieldDel}) but no more data to read`,
                                type: 'DelimiterNotTerminated',
                            }]);
                        }
                        checkReset(parser);
                        // clear read data
                        parser.reset();
                    }
                },
                'q0 -> fieldSep -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 1, j = 0, k = 0;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_fieldSep_i_lineSep_j_fieldSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> fieldSep lineSep -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 1, j = 1, k = 0;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_fieldSep_i_lineSep_j_fieldSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> fieldSep lineSep fieldSep -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 1, j = 1, k = 1;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_fieldSep_i_lineSep_j_fieldSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> fieldSep^3 -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 3, j = 0, k = 0;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_fieldSep_i_lineSep_j_fieldSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> fieldSep^3 lineSep -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 3, j = 1, k = 0;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_fieldSep_i_lineSep_j_fieldSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> fieldSep^3 lineSep^3 -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 3, j = 3, k = 0;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_fieldSep_i_lineSep_j_fieldSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> fieldSep^3 lineSep^3 fieldSep -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 3, j = 3, k = 1;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_fieldSep_i_lineSep_j_fieldSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> fieldSep^3 lineSep^3 fieldSep^3 -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 3, j = 3, k = 3;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_fieldSep_i_lineSep_j_fieldSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> lineSep -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 1, j = 0, k = 0;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_lineSep_i_fieldSep_j_lineSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> lineSep fieldSep -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 1, j = 1, k = 0;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_lineSep_i_fieldSep_j_lineSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> lineSep fieldSep lineSep -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 1, j = 1, k = 1;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_lineSep_i_fieldSep_j_lineSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> lineSep^3 -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 3, j = 0, k = 0;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_lineSep_i_fieldSep_j_lineSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> lineSep^3 fieldSep -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 3, j = 1, k = 0;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_lineSep_i_fieldSep_j_lineSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> lineSep^3 fieldSep^3 -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 3, j = 3, k = 0;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_lineSep_i_fieldSep_j_lineSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> lineSep^3 fieldSep^3 lineSep -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 3, j = 3, k = 1;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_lineSep_i_fieldSep_j_lineSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> lineSep^3 fieldSep^3 lineSep^3 -> q0': function({parser, fieldSeps, lineSeps, skipEmptyLine, skipDataLine}) {
                    const i = 3, j = 3, k = 3;
                    for(const fieldSep of fieldSeps) {
                        for(const lineSep of lineSeps) {
                            processTransition_q0_lineSep_i_fieldSep_j_lineSep_k_q0(i, j, k, parser, fieldSep, lineSep, skipEmptyLine, skipDataLine);
                        }
                    }
                },
                'q0 -> not fieldDel, not fieldSep, not lineSep -> q1': function({parser, strArrBut, skipDataLine}) {
                    for(const val of strArrBut(['fieldDels', 'fieldSeps', 'lineSeps'])) {
                        // read input
                        parser.readChunk(val);
                        // check expectations
                        const skipCsvData = skipDataLine(false, val.trim() === '', val.trim() === '', false);
                        const pending = val !== '';
                        checkData(parser, pending, [], []);
                        if(pending && !skipCsvData) {
                            checkFlush(parser, [[val]], []);
                        }
                        else {
                            checkFlush(parser, [], []);
                        }
                        checkReset(parser);
                        // clear read data
                        parser.reset();
                    }
                },
                'q1 -> fieldSep -> q0': function({parser, fieldSeps, strArrBut, skipDataLine}) {
                    for(const moveToStateVal of strArrBut(['fieldDels', 'fieldSeps', 'lineSeps']).filter(x => x !== '')) {
                        for(const fieldSep of fieldSeps) {
                            // read input
                            parser.readChunk(moveToStateVal); // first move from q0 to q1
                            parser.readChunk(fieldSep);
                            // check expectations
                            const skipCsvData = skipDataLine(false, moveToStateVal.trim() === '' && fieldSep.trim() === '', moveToStateVal.trim() === '', false);
                            checkData(parser, true, [], []);
                            if(skipCsvData) {
                                checkFlush(parser, [], []);
                            }
                            else {
                                checkFlush(parser, [[moveToStateVal, '']], []);
                            }
                            checkReset(parser);
                            // clear read data
                            parser.reset();
                        }
                    }
                },
                'q1 -> lineSep -> q0': function({parser, lineSeps, strArrBut, skipDataLine}) {
                    for(const moveToStateVal of strArrBut(['fieldDels', 'fieldSeps', 'lineSeps']).filter(x => x !== '')) {
                        for(const lineSep of lineSeps) {
                            // read input
                            parser.readChunk(moveToStateVal); // first move from q0 to q1
                            parser.readChunk(lineSep);
                            // check expectations
                            const skipCsvData = skipDataLine(false, moveToStateVal.trim() === '', moveToStateVal.trim() === '', false);
                            if(skipCsvData) {
                                checkData(parser, false, [], []);
                                checkFlush(parser, [], []);
                            }
                            else {
                                checkData(parser, false, [[moveToStateVal]], []);
                                checkFlush(parser, [[moveToStateVal]], []);
                            }
                            checkReset(parser);
                            // clear read data
                            parser.reset();
                        }
                    }
                },
                'q1 -> (not fieldSep, not lineSep)^i (i>=1) -> q1': function({parser, strArrBut, skipDataLine}) {
                    const arr = strArrBut(['fieldSeps', 'lineSeps']);
                    for(const moveToStateVal of strArrBut(['fieldDels', 'fieldSeps', 'lineSeps']).filter(x => x !== '')) {
                        for(let entryVal of [...arr, arr]) {
                            // read input
                            parser.readChunk(moveToStateVal); // first move from q0 to q1
                            if(Array.isArray(entryVal)) {
                                for(const x of entryVal) {
                                    parser.readChunk(x);
                                }
                                entryVal = entryVal.join('');
                            }
                            else {
                                parser.readChunk(entryVal);
                            }
                            // check expectations
                            const skipCsvData = skipDataLine(false, moveToStateVal.trim() === '' && entryVal.trim() === '', moveToStateVal.trim() === '' && entryVal.trim() === '', false);
                            checkData(parser, true, [], []);
                            if(skipCsvData) {
                                checkFlush(parser, [], []);
                            }
                            else {
                                checkFlush(parser, [[moveToStateVal + entryVal]], []);
                            }
                            checkReset(parser);
                            // clear read data
                            parser.reset();
                        }
                    }
                },
                'q2 -> fieldDel -> q3': function({parser, fieldDels, skipDataLine}) {
                    for(const moveToStateVal of fieldDels) {
                        for(const fieldDel of fieldDels) {
                            // read input
                            parser.readChunk(moveToStateVal); // first move from q0 to q2
                            parser.readChunk(fieldDel);
                            // check expectations
                            const skipCsvData = skipDataLine(false, moveToStateVal.trim() == '' && fieldDel.trim() === '', true, false);
                            checkData(parser, true, [], []);
                            if(skipCsvData) {
                                checkFlush(parser, [], []);
                            }
                            else {
                                checkFlush(parser, [['']], []);
                            }
                            checkReset(parser);
                            // clear read data
                            parser.reset();
                        }
                    }
                },
                'q2 -> (not fieldDel)^i (i>=1) -> q2': function({parser, fieldDels, strArrBut, skipDataLine}) {
                    const arr = strArrBut(['fieldDels']);
                    for(const moveToStateVal of fieldDels) {
                        for(let entryVal of [...arr, arr]) {
                            // read input
                            parser.readChunk(moveToStateVal); // first move from q0 to q2
                            if(Array.isArray(entryVal)) {
                                for(const x of entryVal) {
                                    parser.readChunk(x);
                                }
                                entryVal = entryVal.join('');
                            }
                            else {
                                parser.readChunk(entryVal);
                            }
                            // check expectations
                            const skipCsvData = skipDataLine(false, moveToStateVal.trim() === '' && entryVal.trim() === '', entryVal.trim() === '', true);
                            checkData(parser, true, [], []);
                            if(skipCsvData) {
                                checkFlush(parser, [], []);
                            }
                            else {
                                checkFlush(parser, [[entryVal]], [{
                                    context: 'DelimitedField',
                                    linePos: 1,
                                    message: `Expects field delimiter (${moveToStateVal}) but no more data to read`,
                                    type: 'DelimiterNotTerminated',
                                }]);
                            }
                            checkReset(parser);
                            // clear read data
                            parser.reset();
                        }
                    }
                },
                'q3 -> fieldDel -> q2': function({parser, fieldDels, skipDataLine}) {
                    for(const moveToStateVal of fieldDels) {
                        // read input
                        parser.readChunk(moveToStateVal); // first move from q0 to q2
                        parser.readChunk(moveToStateVal); // then  move from q2 to q3
                        parser.readChunk(moveToStateVal);
                        // check expectations
                        const skipCsvData = skipDataLine(false, moveToStateVal.trim() === '', moveToStateVal.trim() === '', true);
                        checkData(parser, true, [], []);
                        if(skipCsvData) {
                            checkFlush(parser, [], []);
                        }
                        else {
                            checkFlush(parser, [[moveToStateVal]], [{
                                context: 'DelimitedField',
                                linePos: 1,
                                message: `Expects field delimiter (${moveToStateVal}) but no more data to read`,
                                type: 'DelimiterNotTerminated',
                            }]);
                        }
                        checkReset(parser);
                        // clear read data
                        parser.reset();
                    }
                },
                'q3 -> fieldSep -> q0': function({parser, fieldDels, fieldSeps, skipDataLine}) {
                    for(const moveToStateVal of fieldDels) {
                        for(const fieldSep of fieldSeps) {
                            // read input
                            parser.readChunk(moveToStateVal); // first move from q0 to q2
                            parser.readChunk(moveToStateVal); // then  move from q2 to q3
                            parser.readChunk(fieldSep);
                            // check expectations
                            const skipCsvData = skipDataLine(false, moveToStateVal.trim() === '' && fieldSep.trim() === '', true, false);
                            checkData(parser, true, [], []);
                            if(skipCsvData) {
                                checkFlush(parser, [], []);
                            }
                            else {
                                checkFlush(parser, [recFrom(2, '')], []);
                            }
                            checkReset(parser);
                            // clear read data
                            parser.reset();
                        }
                    }
                },
                'q3 -> lineSep -> q0': function({parser, fieldDels, lineSeps, skipDataLine}) {
                    for(const moveToStateVal of fieldDels) {
                        for(const lineSep of lineSeps) {
                            // read input
                            parser.readChunk(moveToStateVal); // first move from q0 to q2
                            parser.readChunk(moveToStateVal); // then  move from q2 to q3
                            parser.readChunk(lineSep);
                            // check expectations
                            const skipCsvData = skipDataLine(false, moveToStateVal.trim() === '' && lineSep.trim() === '', true, false);
                            if(skipCsvData) {
                                checkData(parser, false, [], []);
                                checkFlush(parser, [], []);
                            }
                            else {
                                const records = [recFrom(1, '')];
                                checkData(parser, false, records, []);
                                checkFlush(parser, records, []);
                            }
                            checkReset(parser);
                            // clear read data
                            parser.reset();
                        }
                    }
                },
                'q3 -> not fieldDel, not fieldSep, not lineSep -> q2': function({parser, fieldDels, strArrBut, skipDataLine}) {
                    const arr = strArrBut(['fieldDels', 'fieldSeps', 'lineSeps']);
                    for(const moveToStateVal of fieldDels) {
                        for(const entryVal of arr) {
                            // read input
                            parser.readChunk(moveToStateVal); // first move from q0 to q2
                            parser.readChunk(moveToStateVal); // then  move from q2 to q3
                            parser.readChunk(entryVal);
                            // check expectations
                            const entryMatched = entryVal.length !== 0;
                            const hasWarnings = entryMatched;
                            const skipCsvData = skipDataLine(false, moveToStateVal.trim() === '' && entryVal.trim() === '', entryVal.trim() === '', hasWarnings);
                            const warnings = [];
                            if(hasWarnings) {
                                warnings.push({
                                    context: 'DelimitedField',
                                    linePos: 1,
                                    message: `Expects field delimiter (${moveToStateVal}) but got character ${entryVal[0]}`,
                                    type: 'DelimiterNotEscaped',
                                });
                            }
                            checkData(parser, true, [], warnings);
                            if(skipCsvData) {
                                checkFlush(parser, [], []);
                            }
                            else {
                                if(entryMatched) {
                                    const records = [];
                                    records.push([moveToStateVal + entryVal]);
                                    warnings.push({
                                        context: 'DelimitedField',
                                        linePos: 1,
                                        message: `Expects field delimiter (${moveToStateVal}) but no more data to read`,
                                        type: 'DelimiterNotTerminated',
                                    });
                                    checkFlush(parser, records, warnings);
                                }
                                else {
                                    checkFlush(parser, emptyLineRecArr(1), warnings);
                                }
                            }
                            checkReset(parser);
                            // clear read data
                            parser.reset();
                        }
                    }
                },
            };
            (function() {
                const nbTrans = Object.keys(fsmTransitions).length, k = 27;
                assert.strictEqual( // mainly to detect duplicate transition IDs
                    nbTrans, k,
                    `fsmTransitions contains ${nbTrans} transitions but ${k} expected (i.e. new transitions found, existing removed or duplicates exist)`
                );
            })();
            for(const transitionId in fsmTransitions) {
                const inputTester = fsmTransitions[transitionId];
                it(`should return the expected value on transition ${transitionId}`, function() {
                    this.timeout(5000); // set timeout limit for the test case (the value used is chosen to suit all test cases)
                    checkImpl(function({parser, fieldDels, fieldSeps, lineSeps, skipEl, skipLw, strArrBut}) {
                        const skipEmptyLine =
                            // indicates whether the empty line ('') would be skipped when read by the parser
                            skipEl === JsuCsvPsr.LineIsReallyEmpty || skipEl === JsuCsvPsr.LineIsBlank || skipEl === JsuCsvPsr.LineHasOnlyBlankFields
                        ;
                        const skipDataLine = (isReallyEmpty, isBlank, hasOnlyBlankFields, hasWarnings) => {
                            // returns whether a line containing data (e.g. after one/several parser.readChunk(...)) would be skipped when read by the parser;
                            // the parameters of the function describe the line read
                            let retVal = false;
                            switch(skipEl) {
                                case JsuCsvPsr.LineIsReallyEmpty: retVal = (isReallyEmpty === true); break;
                                case JsuCsvPsr.LineIsBlank: retVal = (isBlank === true); break;
                                case JsuCsvPsr.LineHasOnlyBlankFields: retVal = (hasOnlyBlankFields === true); break;
                                default: break;
                            }
                            if(skipLw && hasWarnings) {
                                retVal = true;
                            }
                            return retVal;
                        };
                        inputTester({
                            parser, fieldDels, fieldSeps, lineSeps, strArrBut,
                            skipEmptyLine, skipDataLine,
                        });
                    });
                });
            }
        });
    })();

    (function() {
        describe('getRecordsCopy()', () => {
            it('should return a copy of getRecordsRef()', () => {
                const parser = new JsuCsvPsr();
                const getRecordsRef = sinon.stub(parser, 'getRecordsRef').returns([
                    // array expected for each element
                    [{x:dummy(), y:dummy()}], [{x:dummy(), y:dummy()}],
                ]);
                const retVal = parser.getRecordsCopy();
                assert.strictEqual(getRecordsRef.calledOnceWithExactly(), true);
                assert.deepStrictEqual(retVal, getRecordsRef.getCall(0).returnValue);
                assert.strictEqual(retVal !== getRecordsRef.getCall(0).returnValue, true);
            });
        });
    })();

    (function() {
        describe('getWarningsCopy()', () => {
            it('should return a copy of getWarningsRef()', () => {
                const parser = new JsuCsvPsr();
                const getWarningsRef = sinon.stub(parser, 'getWarningsRef').returns([
                    {x:dummy(), y:dummy()}, {x:dummy(), y:dummy()},
                ]);
                const retVal = parser.getWarningsCopy();
                assert.strictEqual(getWarningsRef.calledOnceWithExactly(), true);
                assert.deepStrictEqual(retVal, getWarningsRef.getCall(0).returnValue);
                assert.strictEqual(retVal !== getWarningsRef.getCall(0).returnValue, true);
            });
        });
    })();
})();
