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
        case 'latex': return require('./src/jsu_latex.js');
    }
    throw new RangeError('Unable to load script with ID "' + scriptId + '"');
}

// expose the same interface as when using <script> tags to embed each script;
// however, a script is only loaded when requested by accessing the
// corresponding property on the returned object; this avoids unnecessary
// loading of scripts
module.exports = {
    get Common() { return requireScript('common'); },
    get CsvParser() { return requireScript('csv-parser'); },
    get Event() { return requireScript('event'); },
    get Latex() { return requireScript('latex'); },
};
