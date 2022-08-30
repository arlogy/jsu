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
                const expectedProps = ['Common', 'CsvParser', 'Event'];
                const obj = Object.assign({}, Jsu);
                for(const prop of expectedProps) delete obj[prop];
                assert.deepStrictEqual(obj, {});
            });
        });

        describe('requiring scripts more than once from the package', () => {
            it('should always expose the same object', () => {
                const common = require('../src/jsu_common.js');
                for(let i = 0; i < 5; i++) {
                    assert.strictEqual(Jsu.Common, common);
                    assert.deepStrictEqual(Jsu.Common, common);
                }

                const csv_parser = require('../src/jsu_csv_parser.js');
                for(let i = 0; i < 5; i++) {
                    assert.strictEqual(Jsu.CsvParser, csv_parser);
                    assert.deepStrictEqual(Jsu.CsvParser, csv_parser);
                }

                const event = require('../src/jsu_event.js');
                for(let i = 0; i < 5; i++) {
                    assert.strictEqual(Jsu.Event, event);
                    assert.deepStrictEqual(Jsu.Event, event);
                }
            });
        });
    })();
})();
