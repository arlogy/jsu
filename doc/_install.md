# Install/Use Jsu

## HTML & JavaScript

Download the Jsu scripts you need and embed them as follows.

```html
<script src="path_to/jsu_common.js"></script>
<script src="path_to/jsu_csv_parser.js"></script>
<script src="path_to/jsu_event.js"></script>
<script src="path_to/jsu_latex.js"></script>
<script>
    // you can use the global Jsu object here; it is defined because at least
    // one script has been loaded; new scripts add new properties to the object

    // these short names are used throughout the documentation
    const JsuCmn = Jsu.Common; // utility object: JsuCmn.funcName();
    const JsuCsvPsr = Jsu.CsvParser; // class type: new JsuCsvPsr();
    const JsuEvt = Jsu.Event; // utility object: JsuEvt.funcName();
    const JsuLtx = Jsu.Latex; // utility object: JsuLtx.funcName(); requires
        // that Jsu.Common has been defined (i.e. the corresponding script has
        // been loaded first)
</script>
```

## Node.js

Install the package.

```bash
npm install jsupack
```

Use the package.

```javascript
// require the package to get an object; no Jsu script is loaded when the
// package is required; later each script can be loaded separately by accessing
// the appropriate property on the object
const Jsu = require('jsupack');

// these short names are used throughout the documentation
const JsuCmn = Jsu.Common; // utility object: JsuCmn.funcName();
const JsuCsvPsr = Jsu.CsvParser; // class type: new JsuCsvPsr();
const JsuEvt = Jsu.Event; // utility object: JsuEvt.funcName();
const JsuLtx = Jsu.Latex; // utility object: JsuLtx.funcName(); requires and
    // automatically loads the script corresponding to JsuCmn
```
