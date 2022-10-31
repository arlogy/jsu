/*
 https://github.com/arlogy/jsu
 Released under the MIT License (see LICENSE file)
 Copyright (c) 2022 https://github.com/arlogy
*/

// will be `const Jsu = require('jsupack')` when the package is installed with
// `npm install jsupack`
const Jsu = require('../index.js');

const assert = require('assert');

(function() {
    (function() {
        describe('requiring the package', () => {
            it('should only expose the expected properties', () => {
                const expectedProps = ['Common', 'CsvParser', 'Event', 'Latex'];
                const obj = Object.assign({}, Jsu);
                for(const prop of expectedProps) delete obj[prop];
                assert.deepStrictEqual(obj, {});
            });
        });

        describe('requiring scripts more than once from the package', () => {
            it('should always expose the same object', () => {
                const k = 5;

                const JsuCmn = require('../src/jsu_common.js');
                for(let i = 0; i < k; i++) {
                    assert.strictEqual(Jsu.Common, JsuCmn);
                    assert.deepStrictEqual(Jsu.Common, JsuCmn);
                }

                const JsuCsvPsr = require('../src/jsu_csv_parser.js');
                for(let i = 0; i < k; i++) {
                    assert.strictEqual(Jsu.CsvParser, JsuCsvPsr);
                    assert.deepStrictEqual(Jsu.CsvParser, JsuCsvPsr);
                }

                const JsuEvt = require('../src/jsu_event.js');
                for(let i = 0; i < k; i++) {
                    assert.strictEqual(Jsu.Event, JsuEvt);
                    assert.deepStrictEqual(Jsu.Event, JsuEvt);
                }

                const JsuLtx = require('../src/jsu_latex.js');
                for(let i = 0; i < k; i++) {
                    assert.strictEqual(Jsu.Latex, JsuLtx);
                    assert.deepStrictEqual(Jsu.Latex, JsuLtx);
                }
            });
        });
    })();
})();
