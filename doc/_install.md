# Install/Use Jsu

Each Jsu script stands alone and does not require any other script.

## HTML & JavaScript

Download the Jsu scripts you need and embed them as follows.

```html
<script src="path_to/jsu_common.js"></script>
<script src="path_to/jsu_csv_parser.js"></script>
<script src="path_to/jsu_event.js"></script>
<script>
    // you can use the global Jsu object here; it is defined because at least
    // one script has been loaded; new scripts add new properties to the object

    // these short names are used throughout the documentation
    const JsuCmn = Jsu.Common; // utility object: JsuCmn.funcName();
    const JsuEvt = Jsu.Event; // utility object: JsuEvt.funcName();
    const JsuCsvPsr = Jsu.CsvParser; // class type: new JsuCsvPsr();
</script>
```

## Node.js

```bash
npm install jsupack
```

```javascript
// get a simple object from the package; no Jsu script is loaded when the
// package is require()d; later each script can be require()d separately by
// accessing the appropriate property on the object
const Jsu = require('jsupack');

// these short names are used throughout the documentation
const JsuCmn = Jsu.Common; // utility object: JsuCmn.funcName();
const JsuEvt = Jsu.Event; // utility object: JsuEvt.funcName();
const JsuCsvPsr = Jsu.CsvParser; // class type: new JsuCsvPsr();
```
