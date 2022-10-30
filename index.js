/*
 https://github.com/arlogy/jsu
 Released under the MIT License (see LICENSE file)
 Copyright (c) 2022 https://github.com/arlogy
*/

// expose the same interface as when using <script> tags to embed each script;
// however, a script is only loaded when requested by accessing the
// corresponding property on the returned object; this avoids unnecessary
// loading of scripts
module.exports = {
    get Common() { return require('./src/jsu_common.js'); },
    get CsvParser() { return require('./src/jsu_csv_parser.js'); },
    get Event() { return require('./src/jsu_event.js'); },
    get Latex() { return require('./src/jsu_latex.js'); },
};
