# jsu_common

- Local Storage
    - [setLocalStorageItem()](#jsucmnsetlocalstorageitemkey-value)
    - [getLocalStorageItem()](#jsucmngetlocalstorageitemkey)
- CSS Visibility
    - [setEltVisible()](#jsucmnseteltvisibleelt-vis-dsp)
    - [isEltVisible()](#jsucmniseltvisibleelt)
    - [switchEltVisibility()](#jsucmnswitcheltvisibilityelt-dsp)
- Type Checker
    - [isBoolean()](#jsucmnisbooleanvalue)
    - [isNumber()](#jsucmnisnumbervalue)
    - [isNumberAlike()](#jsucmnisnumberalikevalue)
    - [isString()](#jsucmnisstringvalue)
    - [isArray()](#jsucmnisarrayvalue)
    - [isCssColor()](#jsucmniscsscolorvalue)
    - [isCssColorOrString()](#jsucmniscsscolororstringvalue)
- Property Accessor/Modifier
    - [copyPropsNoCheck()](#jsucmncopypropsnocheckpropnames-fromobj-toobj)
    - [copyPropsAndCheck()](#jsucmncopypropsandcheckpropnames-fromobj-toobj-checker)
- Formatter
    - [formatString()](#jsucmnformatstringstr-fmt)
    - [setStringPrototypeFormat()](#jsucmnsetstringprototypeformat)
- Parser
    - [parseInlineCssStyle()](#jsucmnparseinlinecssstylestylestr)
    - [parseSuffixedValue()](#jsucmnparsesuffixedvaluevalue)
    - [parseSpaceAsPerJsonStringify()](#jsucmnparsespaceasperjsonstringifyspace)
    - [matchAllAndIndex()](#jsucmnmatchallandindexstr-pattern-ignorecase)
    - [isolateMatchingData()](#jsucmnisolatematchingdatastr-pattern-ignorecase)
    - [isolateMatchingValues()](#jsucmnisolatematchingvaluesstr-pattern-ignorecase)
- Others
    - [cloneDeep()](#jsucmnclonedeepvalue-cache-clonecustomimpl)

## JsuCmn.setLocalStorageItem(key, value)

Sets storage item and returns a boolean success/failure flag.
- `key`: the key to use for the item in storage; converted to string if not
already a string, so it is better to pass a string to avoid conversion from
`null` to `'null'` for example.
- `value`: the value to save in storage; can be retrieved on success using `key`
with `JsuCmn.getLocalStorageItem()`; converted to string if not already a
string, so a number or a boolean is acceptable, but not an object or `null` for
example because `{}` will become `'[object Object]'`.

## JsuCmn.getLocalStorageItem(key)

Returns the value (string) of a storage item if any or `null`.
- `key`: the key of the item in storage; see `JsuCmn.setLocalStorageItem()`.

## JsuCmn.setEltVisible(elt, vis, dsp)

*Use this function only in rare cases where third-party libraries such as jQuery
are not an option.*

Sets the visibility of an HTML element.
- `elt`: the HTML element whose visibility is to be set; could be the result of
`document.getElementById()` for example.
- `vis`: indicates whether `elt` must be visible or not.
    - If `vis` is falsy, `'none'` is used as display style for `elt`.
    - Otherwise the value of `dsp` is used as display style unless `dsp` is
    falsy or `'none'`, in which case `'revert'` is used instead.
    - You don't have to worry about these specifications unless a specific `dsp`
    should be passed for some HTML element when setting its visibility in a
    given context.
- `dsp`: optional display style; possible values are those of the display CSS
property (e.g. `'inline'`, `'block'`, etc.).

## JsuCmn.isEltVisible(elt)

*Use this function only in rare cases where third-party libraries such as jQuery
are not an option.*

Returns whether an HTML element is visible, comparing its display style to
`'none'`. The HTML element is considered visible if and only if its display
style is not `'none'`.
- elt: the element whose visibility state is to be returned; could be the result
of `document.getElementById()` for example.

## JsuCmn.switchEltVisibility(elt, dsp)

*Use this function only in rare cases where third-party libraries such as jQuery
are not an option.*

Toggles the visibility of an HTML element.
- `elt`: the HTML element whose visibility is to be toggled; could be the result
of `document.getElementById()` for example.
- `dsp`: optional display style; see `JsuCmn.setEltVisible()` because this
function actually does `JsuCmn.setEltVisible(elt, !JsuCmn.isEltVisible(elt), dsp)`.

## JsuCmn.isBoolean(value)

Returns whether a value is a primitive boolean (i.e. exactly `true` or `false`).

## JsuCmn.isNumber(value)

Returns whether a value is a finite number that is not a string.

## JsuCmn.isNumberAlike(value)

Returns whether a value is a finite number or a primitive string convertible to
such a number.

## JsuCmn.isString(value)

Returns whether a value is a primitive string or an object string.

## JsuCmn.isArray(value)

Returns whether a value is an array.

## JsuCmn.isCssColor(value)

Returns `CSS.supports('color', value)` if `CSS.supports` is set, or `null`
otherwise. Note that this function returns a boolean value only when CSS color
checking is available, otherwise it returns `null`. For this reason, sometimes
you might want to use `JsuCmn.isCssColorOrString()` instead, so that `value` is
not rejected just because color checking is not available.

## JsuCmn.isCssColorOrString(value)

Returns `JsuCmn.isCssColor(value)` if not null, or `JsuCmn.isString(value)`
otherwise.

## JsuCmn.copyPropsNoCheck(propNames, fromObj, toObj)

```javascript
// Example
(function() {
    const fromObj = {'posX': 10};
    const toObj = {'posX': 0};
    JsuCmn.copyPropsNoCheck(['posX', 'posY'], fromObj, toObj);
    console.log(toObj);
})();
```

## JsuCmn.copyPropsAndCheck(propNames, fromObj, toObj, checker)

```javascript
// Example
(function() {
    const fromObj = {'bgColor': 'black', 'textColor': null};
    const toObj = {'textColor': 'white'};
    JsuCmn.copyPropsAndCheck(['bgColor', 'textColor'], fromObj, toObj, JsuCmn.isCssColorOrString);
    console.log(toObj);
})();
```

## JsuCmn.formatString(str, fmt)

*ECMAScript 6 (2015) supports template literals which allows the use of
placeholders in a string, as in `sum is ${a + b}` for example. In this case, it
is not necessary to use this function.*

Formats a string according to a format definition and returns a new string. Each
occurrence of `{key}` in the input string (where `key` matches `\w+` aka `[A-Za-z0-9_]+`)
is replaced by the value corresponding to the property/index `key` if it exists
in the format definition.
- `str`: the string to format.
- `fmt`: the format definition to use; must allow key checks using the `in`
operator; e.g. array, object, `arguments` for variadic functions, etc.

```javascript
// Example
(function() {
    const format = JsuCmn.formatString;
    console.log( format('{0}', ['zero']) ); // zero
    console.log( format('{1}', ['zero', 'one']) ); // one
    console.log( format('{1}', ['one']) ); // {1}
    console.log( format('{0} {1} {0}', ['{1}', 'one']) ); // {1} one {1}
    console.log( format('x={x} y={?} z={z} x^2={x}*{x}', {x:0, y:1}) ); // x=0 y={?} z={z} x^2=0*0
})();
```

## JsuCmn.setStringPrototypeFormat()

Sets `String.prototype.format` to allow syntactic sugar:
- `myString.format()` instead of `JsuCmn.formatString(myString, [])` (even
though these statements are useless as no formatting will take place).
- `myString.format(a)` instead of `JsuCmn.formatString(myString, [a])`.
- `myString.format(a, b)` instead of `JsuCmn.formatString(myString, [a, b])`.
- and so on and so forth.

Succeeds (and returns `true`) if `String.prototype.format` is `undefined` or was
previously set using `JsuCmn.setStringPrototypeFormat()`; fails (and returns
`false`) otherwise.

## JsuCmn.parseInlineCssStyle(styleStr)

Parses an inline CSS style declaration and returns a `CSSStyleDeclaration`
object whose properties are initialized according to the parsed CSS rules.
- `styleStr`: the CSS style string to parse.

```javascript
// Example
(function() {
    [
        'font-family: Arial; font-size: 12px;',
        'font-family: Arial; font-size: 12;', // font-size is invalid
        // note that shorthand properties like 'font' can set several properties at once: 'font-family', 'font'size', ...
    ].forEach(function(styleStr) {
        const obj = JsuCmn.parseInlineCssStyle(styleStr);
        console.log(obj);
        console.log(obj.fontFamily, obj.fontSize);
    });
})();
```

## JsuCmn.parseSuffixedValue(value)

Parses a value (number/string) to capture its numeric part and suffix string if
any. Returns null if parsing fails, an object with two properties (`number` and
`suffix`) otherwise.
- `value`: the value to parse.

Only digits and optional minus/period signs are allowed in the numeric part
(e.g. 0, 0.5, -1, -0.5). When such a numeric is matched, it is converted to a
number using the JavaScript `parseFloat()` function and the suffix substring is
also captured if any. Whitespaces before and after the numeric are ignored, as
are those after the suffix string.

```javascript
// Example
(function() {
    console.log(JsuCmn.parseSuffixedValue(' 20 ')); // captures 20 and ''
    console.log(JsuCmn.parseSuffixedValue('-20 px ')); // captures -20 and 'px'
    console.log(JsuCmn.parseSuffixedValue('-20 px units ')); // captures -20 and 'px units'
})();
```

## JsuCmn.parseSpaceAsPerJsonStringify(space)

Parses a space according to the space parameter of the JavaScript `JSON.stringify()`
function and returns the parsed value (a string). Can be used when implementing
export features allowing content indentation for example.
- `space`: the space to parse.

```javascript
// Example
(function() {
    for(let indents of [undefined, null, 2, ' '.repeat(4)]) {
        indents = JsuCmn.parseSpaceAsPerJsonStringify(indents);
        console.log(`\n<div>\n${indents}<span>...</span>\n</div>`);
    }
})();
```

## JsuCmn.matchAllAndIndex(str, pattern, ignoreCase)

Matches a string against a regular expression and returns an object mapping the
start index of each match in the string to the value of the match (a string), or
`null` if no matches are found.
- `str`: the string to match.
- `pattern`: the pattern to use for the regular expression; it is processed by
the JavaScript `RegExp()` constructor.
- `ignoreCase`: optional; indicates whether case sensitivity must be ignored
when matching `str`; defaults to `false`.

```javascript
// Example
(function() {
    const obj = JsuCmn.matchAllAndIndex('these are words', '\\w+');
    console.log(obj); // { '0': 'these', '6': 'are', '10': 'words' }
    for(prop in obj) console.log(prop, typeof prop); // `typeof prop` will be 'string' as coerced by JavaScript
    console.log(obj[0], obj['0']); // both properties are valid for obj
})();
```

Notes on the `pattern` parameter.
- Be aware that regular expression patterns such as `''`, `'.*'` or others will
lead to infinite matches (thus infinite loop). However, the empty string pattern
is ignored to allow codes like this:
    ```javascript
    let pattern = ''; // pattern is empty by default
    if(false /* suggesting that a condition has failed */) pattern = '\\w+';
    JsuCmn.matchAllAndIndex('these are words', pattern); // will not lead to an implicit infinite loop (and no matches are found)
    ```
- When using alternation (OR) in a regular expression pattern, one should use
`'abc|a'` instead of `'a|abc'` for example, otherwise the `'abc'` part of the
pattern might not get a chance to match.

## JsuCmn.isolateMatchingData(str, pattern, ignoreCase)

Finds all matches in a string using `JsuCmn.matchAllAndIndex()` and returns an
array reflecting the structure of the string and the matches. The returned array
and the input string have comparable content but their length might be different
(for example when the entire string is the only match).
- `str`: see `JsuCmn.matchAllAndIndex()`.
- `pattern`: see `JsuCmn.matchAllAndIndex()`.
- `ignoreCase`: see `JsuCmn.matchAllAndIndex()`.

```javascript
// Example
(function() {
    const str = 'these are words', pattern = '\\w+';
    console.log(JsuCmn.matchAllAndIndex(str, pattern)); // { '0': 'these', '6': 'are', '10': 'words' }
    console.log(JsuCmn.isolateMatchingData(str, pattern));
    // [
    //     { value: 'these', matched: true,  index: 0 },
    //     { value: ' ',     matched: false, index: 5 },
    //     { value: 'are',   matched: true,  index: 6 },
    //     { value: ' ',     matched: false, index: 9 },
    //     { value: 'words', matched: true,  index: 10 }
    // ]
})();
```

## JsuCmn.isolateMatchingValues(str, pattern, ignoreCase)

Same as `JsuCmn.isolateMatchingData()` but returns simplified data (i.e. the
values of the matches).
- `str`: see `JsuCmn.isolateMatchingData()`.
- `pattern`: see `JsuCmn.isolateMatchingData()`.
- `ignoreCase`: see `JsuCmn.isolateMatchingData()`.

```javascript
// Example
(function() {
    const str = 'these are words', pattern = '\\w+';
    console.log(JsuCmn.matchAllAndIndex(str, pattern)); // { '0': 'these', '6': 'are', '10': 'words' }
    console.log(JsuCmn.isolateMatchingData(str, pattern));
    // [
    //     { value: 'these', matched: true,  index: 0 },
    //     { value: ' ',     matched: false, index: 5 },
    //     { value: 'are',   matched: true,  index: 6 },
    //     { value: ' ',     matched: false, index: 9 },
    //     { value: 'words', matched: true,  index: 10 }
    // ]
    console.log(JsuCmn.isolateMatchingValues(str, pattern)); // [ 'these', ' ', 'are', ' ', 'words' ]
})();
```

## JsuCmn.cloneDeep(value, cache, cloneCustomImpl)

Clones a value recursively and handles circular references correctly. Can be
extended to clone custom values in a specific way.

### Default implementation

- If `typeof value` is `'undefined'`, `'boolean'`, `'number'`, `'bigint'`,
`'string'` or `'function'`: returns `value`.
- If `typeof value` is `'symbol'`: returns `Symbol(value.description)`; see
*caching* below.
- Otherwise, i.e. if `typeof value` is `'object'`.
    - If `value` is `null`: returns `value`.
    - If `value instanceof X` where `X` is one of `Boolean`, `Date`, `Number` or
    `String`: returns `new X(value.valueOf())`; see *caching* below.
    - If `value` is an array: returns a new array `[...]` whose elements are
    deep clones of those in `value`; see *caching* below.
    - If `cloneCustomImpl` is truthy and `const copy = cloneCustomImpl(value, cache);`
    is not `undefined`: returns `copy`; note that the function will not be
    called if a copy already exists in the cache for `value`; see the section on
    extending the default cloning algorithm for more information on `cache` and
    `cloneCustomImpl`.
    - Otherwise (fallback behavior): `value` is deep cloned considering only the
    properties returned by `Object.keys(value)` (this is a deliberate limitation
    for simplicity), i.e. inherited and non-enumerable properties are ignored;
    the returned value is an object literal `{...}`; see *caching* below.

Caching: the returned value is cached and will be returned when the same
reference to `value` is cloned again.

```javascript
// Example
(function() {
    const node = {x:0, y:0}; node.self = node; node.children = [{parent:node}, {parent:node}];
    const clone = JsuCmn.cloneDeep(node); clone.y = 10;
    console.log(clone);
    console.log(
        // object references are different
        clone !== node, // true
        // values are the same unless changed for the cloned version
        clone.x === node.x && clone.y !== node.y, // true
        // object references are cached accordingly
        clone.self === clone && node.self === node, // true
        clone.children.every(x => x.parent === clone) && node.children.every(x => x.parent === node) // true
    );
})();
```

### Limitations of the default implementation (for accessor properties)

Accessor properties are those defined using the `get`/`set` syntax. First, let's
see how they are cloned.

```javascript
// Example
(function() {
    const obj1 = {
        _xx:0,
        get xx() { return this._xx; }, set xx(v) { this._xx = 2 * v; },
    };
    console.log(obj1, obj1.xx);
    obj1.xx = 1;
    console.log(obj1, obj1.xx);
    console.log('---');

    // cloning obj1 will not preserve its get/set behaviors; only the value
    // returned by the getter is kept
    const obj2 = JsuCmn.cloneDeep(obj1);
    console.log(obj2, obj2.xx);
    obj2.xx = 0; // no setter will be triggered...
    console.log(obj2, obj2.xx);
    console.log('---');

    // of course, changes made to one object will not affect the other
    obj1.xx = 10;
    console.log(obj2, obj2.xx);
    obj2.xx = -10;
    console.log(obj1, obj1.xx);
})();
```

Note that this function is not intended to preserve the behavior of the accessor
properties of an object; see why below if you are interested.

```javascript
// Reason 1: the accessor properties of an object which is an instance of a
// class are not on the object itself but on its prototype, and this also
// requires checking whether the object is a class instance or not
(function() {
    const obj1 = { get xx() { return 'xx getter called'; } };
    console.log(obj1.xx);
    console.log(Object.getOwnPropertyDescriptor(obj1, 'xx')); // property descriptor found

    const Clazz = class { get xx() { return 'xx getter called'; } };
    const obj2 = new Clazz();
    console.log(obj2.xx);
    console.log(Object.getOwnPropertyDescriptor(obj2, 'xx')); // property descriptor NOT found
    const obj2P = Object.getPrototypeOf(obj2);
    console.log(Object.getOwnPropertyDescriptor(obj2P, 'xx')); // property descriptor NOW found, but it is
                                                               // on the prototype, not on the object itself
})();

console.log('---');

// Reason 2 (stronger than reason 1): setting an accessor property on a clone
// of an object MAY change the value of the property on the original object
(function() {
    const obj1 = (function() {
        let xx = 0;
        return {
            get xx() { return xx; }, set xx(v) { xx = v; }, // accessor property
            yy:undefined, // data property
        };
    })();

    // create a clone of obj1, including property descriptors if any
    const obj2 = (function() {
        const retVal = {};
        // use a copy of the descriptor of accessor properties
        Object.defineProperty(retVal, 'xx', Object.getOwnPropertyDescriptor(obj1, 'xx'));
        // use the value of data properties
        retVal.yy = obj1.yy; // note that a generic cloning algorithm should deep clone obj1.yy
                             // instead of using its value, but that's not necessary here
        return retVal;
    })();

    console.log(obj1, obj1.xx, obj1.yy);
    console.log(obj2, obj2.xx, obj2.yy);
    obj2.xx = obj2.yy = 1; // 'xx' will also change for obj1 because the property is bound to
                           // a local variable in the function that created obj1
    console.log(obj1, obj1.xx, obj1.yy);
    console.log(obj2, obj2.xx, obj2.yy);
})();
```

So if the accessor properties of an object should be cloned, the default deep
cloning implementation can be extended accordingly.

### Extending the default implementation

`cache` is optional and defaults to an internal object value. It applies from
the first call to `JsuCmn.cloneDeep()` to recursive calls if there are any, as
for an array for example.

`cloneCustomImpl` is optional and the most important parameter when creating
custom clones.

Learn more about custom cloning with the example below.

```javascript
// Example
(function() {
    const cloneDeep = JsuCmn.cloneDeep;
    function Person(firstName, lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }
    Person.prototype.fullName = function() { return this.firstName + ' ' + this.lastName; };
    let obj = new Person('fname', 'lname');
    obj = {a:obj, b:obj}; // has several references to obj for explanatory purposes

    console.log('--- ignore custom cloning');
    (function() {
        console.log(cloneDeep(obj)); // no custom cloning
        console.log(cloneDeep(obj, undefined, (value, cache) => {
            return undefined; // skip custom cloning
        }));
    })();

    console.log('--- learn custom cloning');
    (function() {
        let i = undefined;
        i = 0;
        console.log(cloneDeep(obj, undefined, (value, cache) => {
            return ++i;
        }));
        i = 0;
        console.log(cloneDeep(obj, undefined, (value, cache) => {
            if(value instanceof Person) return ++i;
            return undefined; // skip custom cloning
        }));
        i = 0;
        console.log(cloneDeep(obj, undefined, (value, cache) => {
            // this example shows how to use the cache:
            //     - cache.add(key, value) maps a key to a value in the cache
            //     - cache.get(key) returns the value corresponding to a key in the cache, or undefined otherwise;
            //       thus, a key must not be mapped to undefined;
            //       cache.get() must also be checked before using cache.add() to avoid duplicate keys in the cache
            //     - when a value is cached, the entry in the cache will be used, and this function will not be called
            if(value instanceof Person) {
                console.log('custom cloning once due to caching...');
                // return an already cached copy or a newly cached copy
                const copy = cache.get(value);
                return copy !== undefined ? copy : cache.add(value, ++i);
            }
            return undefined; // skip custom cloning
        }));
    })();

    console.log('--- implement custom cloning');
    (function() {
        console.log(cloneDeep(obj, undefined, (value, cache) => {
            if(value instanceof Person) {
                const copy = cache.get(value);
                return copy !== undefined ? copy : cache.add(value, new Person(value.firstName, value.lastName));
            }
            return undefined; // skip custom cloning
        }));
    })();

    console.log('--- handle recursion during custom cloning');
    (function() {
        const cloneCustomImpl = (value, cache) => { // implemented for explanatory purposes only
            const copy = {};
            cache.add(value, copy); // cache data before the recursive cloneDeep() calls below
            for(const prop in value) { // possible way to iterate over properties...
                copy[prop] = cloneDeep(value[prop], cache, cloneCustomImpl);
            }
            return copy;
        };
        const tmp1 = {x:0}; tmp1.self1 = tmp1.self2 = tmp1.self3 = tmp1;
        const tmp2 = cloneDeep(tmp1, undefined, cloneCustomImpl);
        console.log(tmp2);
        console.log(tmp2 === tmp2.self1 && tmp2.self1 === tmp2.self2 && tmp2.self2 === tmp2.self3); // true
    })();
})();
```

### Other deep cloning implementations

In Node.js environments, you can use the lodash [`cloneDeep()`](https://lodash.com/docs/#cloneDeep)
function for example, which supports more data types compared to the default
implementation of `JsuCmn.cloneDeep()`.

```javascript
// Example after `npm install lodash`
(function() {
    const {cloneDeep} = require('lodash');
    const node = {x:0}; node.prev = node; node.next = node; node.self = node;
    console.log(cloneDeep(node));
})();
```
