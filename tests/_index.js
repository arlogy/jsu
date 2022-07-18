/*
 https://github.com/arlogy/jsu
 Released under the MIT License (see LICENSE file)
 Copyright (c) 2022 https://github.com/arlogy
*/

// will be `require('jsupack')` when the package is installed with
// `npm install jsupack`
const Jsu = require('../index.js');

const { objectHasOnlyProperties } = require('./utils_core.js');
const assert = require('assert');

(function() {
    (function() {
        describe('requiring the package', () => {
            it('should only expose the expected properties', () => {
                const expectedProps = ['Common', 'CsvParser', 'Event'];
                assert.strictEqual(objectHasOnlyProperties(Jsu, expectedProps), true);
            });
        });

        describe('requiring scripts more than once from the package', () => {
            it('should succeed', () => {
                const common = require('../src/jsu_common.js');
                assert.deepStrictEqual(Jsu.Common, common);
                assert.deepStrictEqual(Jsu.Common, common);

                const csv_parser = require('../src/jsu_csv_parser.js');
                assert.deepStrictEqual(Jsu.CsvParser, csv_parser);
                assert.deepStrictEqual(Jsu.CsvParser, csv_parser);

                const event = require('../src/jsu_event.js');
                assert.deepStrictEqual(Jsu.Event, event);
                assert.deepStrictEqual(Jsu.Event, event);
            });
        });
    })();
})();
