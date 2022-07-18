# jsu_common

- Local Storage
    - [setLocalStorageItem()](#jsucmnsetlocalstorageitemkey-value)
    - [getLocalStorageItem()](#jsucmngetlocalstorageitemkey)
- UI
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

## JsuCmn.setLocalStorageItem(key, value)

Sets storage item and returns a boolean success/failure flag.
- `key`: the key to use for the item in storage; converted to string if not
already a string, so it is better to pass a string to avoid conversion from
`null` to `'null'` for example.
- `value`: the value to save in storage; can be retrieved on success using `key`
with `JsuCmn.getLocalStorageItem()`; converted to string if not already a
string, so a number or a boolean is acceptable, but not an object or null for
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
`'none'`. Note that an HTML element is considered visible if and only if its
display style is not `'none'`.
- elt: the element whose visibility state is to be returned; could be the result
of `document.getElementById()` for example.

## JsuCmn.switchEltVisibility(elt, dsp)

*Use this function only in rare cases where third-party libraries such as jQuery
are not an option.*

Toggles the visibility of an HTML element.
- `elt`: the HTML element whose visibility is to be toggled; could be the result
of `document.getElementById()` for example.
- `dsp`: optional display style; see `JsuCmn.setEltVisible()`.

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

Returns `CSS.supports('color', value)` if `CSS.supports` is set, or `false`
otherwise. Note that this function returns `false` in two cases: CSS color
checking is not available or `value` is not a CSS color. For this reason,
sometimes you might want to use `JsuCmn.isCssColorOrString()` instead, so that
`value` is not rejected just because color checking is not available.

## JsuCmn.isCssColorOrString(value)

Returns `JsuCmn.isCssColor(value) || JsuCmn.isString(value)`.

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
// Examples
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

Sets `String.prototype.format` to allow syntactic sugar.
    - `myString.format()` instead of `JsuCmn.formatString(myString, [])` (even
    though these are useless as no formatting will take place)
    - `myString.format(a)` instead of `JsuCmn.formatString(myString, [a])`
    - `myString.format(a, b)` instead of `JsuCmn.formatString(myString, [a, b])`
    - and so on and so forth

Succeeds (and returns `true`) if `String.prototype.format` is `undefined` or was
previously set using `JsuCmn.setStringPrototypeFormat()`; fails (and returns
`false`) otherwise.

## JsuCmn.parseInlineCssStyle(styleStr)

Parses an inline CSS style declaration and returns a `CSSStyleDeclaration`
object whose properties are initialized according to the parsed CSS rules.
- `styleStr`: the CSS style string to parse.

```javascript
// Examples
(function() {
    [
        'font-family: Arial; font-size: 12px;',
        'font-family: Arial; font-size: 12;', // font-size is invalid
        // note that shorthand properties like 'font' can set several properties at once: 'font-family', 'font'size', ...
    ].forEach(function(styleStr) {
        const obj = JsuCmn.parseInlineCssStyle(styleStr);
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

Examples:
    - `' 20 '` yields `20` and `''`.
    - `'-20 px '` yields `-20` and `'px'`.
    - `'-20 px units '` yields `-20` and `'px units'`.

## JsuCmn.parseSpaceAsPerJsonStringify(space)

Parses a space according to the space parameter of the JavaScript `JSON.stringify()`
function and returns the parsed value (a string). Can be used when implementing
export features allowing content indentation for example.
- `space`: the space to parse.

## JsuCmn.matchAllAndIndex(str, pattern, ignoreCase)

Matches a string against a regular expression and returns an object mapping the
start index of each match in the string to the value of the match (a string), or
`null` if no matches are found.
- `str`: the string to match.
- `pattern`: the pattern to use for the regular expression; it is processed by
the JavaScript `RegExp()` constructor.
- `ignoreCase`: optional; indicates whether case sensitivity must be ignored
when matching `str`; defaults to `false`.

For example, try `JsuCmn.matchAllAndIndex('these are words', '\\w+')`.

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

For example, try `JsuCmn.isolateMatchingData('these are words', '\\w+')`.

## JsuCmn.isolateMatchingValues(str, pattern, ignoreCase)

Same as `JsuCmn.isolateMatchingData()` but returns simplified data (i.e. the
values of the matches).
- `str`: see `JsuCmn.isolateMatchingData()`.
- `pattern`: see `JsuCmn.isolateMatchingData()`.
- `ignoreCase`: see `JsuCmn.isolateMatchingData()`.

For example, try `JsuCmn.isolateMatchingValues('these are words', '\\w+')`.
