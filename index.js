/*
 https://github.com/arlogy/jsu
 Released under the MIT License (see LICENSE file)
 Copyright (c) 2022 https://github.com/arlogy
*/

function requireScript(scriptId) {
    switch(scriptId) {
        case 'common': return require('./src/jsu_common.js');
        case 'csv-parser': return require('./src/jsu_csv_parser.js');
        case 'event': return require('./src/jsu_event.js');
    }
    throw new Error('Failed to load script id: ' + scriptId);
}

// expose the same interface as when using <script> tags to embed each script;
// however, a script is only loaded when requested by accessing the
// corresponding property on the returned object; this avoids unnecessary
// loading of scripts
module.exports = {
    get Common() { return requireScript('common'); },
    get CsvParser() { return requireScript('csv-parser'); },
    get Event() { return requireScript('event'); },
};
