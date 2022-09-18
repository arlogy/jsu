# jsu_latex

- Data Provider
    - [getGreekLetterNames()](#jsultxgetgreekletternames)
    - [getLatexShortcutData()](#jsultxgetlatexshortcutdata)
    - [getSafetyPadding()](#jsultxgetsafetypadding)
- Matcher
    - [findLatexShortcutSpecialCharsAndIndex()](#jsultxfindlatexshortcutspecialcharsandindexstr)
    - [isolateLatexShortcutData()](#jsultxisolatelatexshortcutdatastr)
    - [isolateLatexShortcutValues()](#jsultxisolatelatexshortcutvaluesstr)
- Converter
    - [convertLatexShortcuts()](#jsultxconvertlatexshortcutsstr)
    - [replaceSpecialCharsInLatexShortcuts()](#jsultxreplacespecialcharsinlatexshortcutsstr-options)
    - [combineLatexSubscripts()](#jsultxcombinelatexsubscriptsstr)
    - [rewriteLatexCommands()](#jsultxrewritelatexcommandsstr-pattern)
    - [rewriteKnownLatexCommands()](#jsultxrewriteknownlatexcommandsstr-pattern)
    - [toLatex()](#jsultxtolatexstr-mode)
- Others
    - [insertString()](#jsultxinsertstringstrtoupdate-cursorpos-strtoinsert)
    - [deleteOne()](#jsultxdeleteonestrtoupdate-cursorpos)

## JsuLtx.getGreekLetterNames()

*Changes to this function will not affect any implemented feature as it is not
called internally. Always returns the same data (not the same reference), so it
should not be called more than once to avoid unnecessary calculations.*

Returns an array containing the names of the Greek letters used internally.

## JsuLtx.getLatexShortcutData()

*Changes to this function will not affect any implemented feature as it is not
called internally. Always returns the same data (not the same reference), so it
should not be called more than once to avoid unnecessary calculations.*

Returns an object providing the regular expression patterns used internally for
LaTeX shortcuts, including useful additional data. This object is described
below.

```javascript
{
    'greekLetter': {
        'pattern': {
            'value': ..., // the regular expression pattern for Greek letters
            'list': ..., // an array from which the regular expression pattern can be built
            'specialChar': ..., // the regular expression pattern for the special character of Greek letter shortcuts
        },
        'extra': {
            'specialChar': ..., // the special character of Greek letter shortcuts
            'shortcuts': ..., // Greek letter shortcuts
        },
    },
    'subscript': {
        ... // all properties share the same meaning with greekLetter but target subscripts
    },
}
```

## JsuLtx.getSafetyPadding()

*Changes to this function will not affect any implemented feature as it is not
called internally. Always returns the same data (not the same reference), so it
should not be called more than once to avoid unnecessary calculations.*

Returns a non-empty safety string used internally during `JsuLtx.replaceSpecialCharsInLatexShortcuts()`.
The returned value is called *safe* because it will never introduce a LaTeX
shortcut if added before and/or after any string. For example, `a` is not safe
for `\alph`, neither is `_` for `0` or `0` for `_` because `\alpha` and `_0`
are LaTeX shortcuts.

## JsuLtx.findLatexShortcutSpecialCharsAndIndex(str)

Finds all LaTeX shortcut special characters in a string and returns an object
mapping the start index of each special character in the string to its value, or
`null` if no special characters are found. Note that the special characters are
matched regardless of the presence or absence of LaTeX shortcuts in the string.
- `str`: the string containing the special characters to find.

```javascript
// Example
(function() {
    // the function returns the same data type as JsuCmn.matchAllAndIndex()
    console.log(JsuLtx.findLatexShortcutSpecialCharsAndIndex('alpha'));
    console.log(JsuLtx.findLatexShortcutSpecialCharsAndIndex('\\ _'));
    console.log(JsuLtx.findLatexShortcutSpecialCharsAndIndex('\\alpha\\_0_'));
})();
```

## JsuLtx.isolateLatexShortcutData(str)

Finds all LaTeX shortcuts in a string and returns an array reflecting the
structure of the string and the LaTeX shortcuts found if any. The returned array
is similar in structure to the value returned by `JsuLtx.convertLatexShortcuts()`:
they have the same length and comparable content.
- `str`: the string containing the shortcuts to find.

```javascript
// Example
(function() {
    // the function returns the same data type as JsuCmn.isolateMatchingData()
    const str = '\\alpha alpha _0_';
    console.log(JsuLtx.convertLatexShortcuts(str));
    console.log(JsuLtx.isolateLatexShortcutData(str));
})();
```

## JsuLtx.isolateLatexShortcutValues(str)

Finds all LaTeX shortcuts in a string the same way as `JsuLtx.isolateLatexShortcutData()`
but returns simplified data (i.e. the values of the LaTeX shortcuts).
- `str`: the string containing the shortcuts to find.

```javascript
// Example
(function() {
    // the function returns the same data type as JsuCmn.isolateMatchingValues()
    const str = '\\alpha alpha _0_';
    console.log(JsuLtx.convertLatexShortcuts(str));
    console.log(JsuLtx.isolateLatexShortcutValues(str));
})();
```

## JsuLtx.convertLatexShortcuts(str)

Converts all LaTeX shortcuts in a string to actual string representation and
returns the modified string.
- `str`: the string containing the shortcuts to convert; see some examples
below.
    - Converted: `\Beta`, `\beta`, `\Pi`, `\pi`, `_0`, `_0_9`.
    - Not converted because not LaTeX shortcuts: `\BeTa`, `\pI`, `_a`.
    - Note: `\` must be escaped with another `\` in source code, but not when
    typed directly in a text editor for example.

```javascript
// Example
(function() {
    console.log(JsuLtx.convertLatexShortcuts('\\alpha a_09 a_0_9'));
})();
```

Besides, keep in mind that `JsuLtx.convertLatexShortcuts(s1 + s2)` might be
different from `JsuLtx.convertLatexShortcuts(s1) + JsuLtx.convertLatexShortcuts(s2)`.
So one is not necessarily a valid substitute for the other in all contexts. Here
are some sample values for comparison:
- `s1 = '\\alph'` and `s2 = 'a'` (comparison will fail with these values).
- `s1 = 'ab_'` and `s2 = '0'` (comparison will fail with these values).
- `s1 = '\\alpha'` and `s2 = 'bet'` (comparison will succeed with these values).
- in any case, the comparison fails only if `s1 + s2` introduces a new LaTeX
shortcut.

## JsuLtx.replaceSpecialCharsInLatexShortcuts(str, options)

Replaces all LaTeX shortcut special characters from the LaTeX shortcuts in a
string and returns the modified string. In other words, special characters that
are not part of a LaTeX shortcut are ignored.
- `str`: the string containing the special characters to replace.
- `options`: optional object that can have the following optional properties.
    - `greekLetterRepl`: the replacement value for the special character of
    Greek letter shortcuts; ignored if unset, `undefined` or `null` (i.e. no
    replacement takes place).
    - `subscriptRepl`: the replacement value for the special character of
    subscript shortcuts (aka subscripts); ignored if unset, `undefined` or `null`
    (i.e. no replacement takes place).
    - `paddingEnabled`: indicates whether safety padding must be added when
    replacing the special characters; ignored if unset or falsy (i.e. safety
    padding is not added).

Note: this function was introduced because LaTeX shortcuts contain special
characters that could also be special characters in other contexts and thus
would require special handling as performed by `JsuLtx.toLatex()` for example.
So this function can be used to hide said special characters from the shortcuts
so that they are not processed during said special handling.

```javascript
// Real use case example (learn more about the function in the other example)
(function() {
    const data = JsuLtx.getLatexShortcutData();

    const str = '\\alpha q_0 \\_+ \\alpha q_0';
    console.log(str);

    // we want to convert all LaTeX shortcut special characters in str to  specific values
    // while keeping the LaTeX shortcuts unchanged
    //
    const tmpId_ = new Date().toISOString(); // or use any other hard-to-guess ID of your choice
    const tmpId1 = 'TMP1-' + tmpId_;
    const tmpId2 = 'TMP2-' + tmpId_;
    //
    console.log(
        // first replace all special characters in LaTeX shortcuts with temporary values
        // that must not contain said special characters
        JsuLtx.replaceSpecialCharsInLatexShortcuts(str, {greekLetterRepl:tmpId1, subscriptRepl:tmpId2})
        // apply a special conversion to the remaining special characters
       .replace(/\\/g, '{backslash}')
       .replace(/_/g, '{underscore}')
        // restore the previously replaced special characters
       .replace(new RegExp(tmpId1, 'g'), data.greekLetter.extra.specialChar)
       .replace(new RegExp(tmpId2, 'g'), data.subscript.extra.specialChar)
    );
})();
```

```javascript
// Example to understand the function step by step
(function() {
    const func = JsuLtx.replaceSpecialCharsInLatexShortcuts;

    let str = '\\alpha q_0 \\_+ \\alpha q_0 \\beta';
    console.log(str);
    console.log('\n');

    // how it works
    console.log(func(str, {
        greekLetterRepl:'xxx', subscriptRepl:'yyy',
    }));
    console.log(func(str, { // will add safety padding to the replacement values
        greekLetterRepl:'xxx', subscriptRepl:'yyy', paddingEnabled:true,
    }));
    console.log('\n');

    // why would you need to set paddingEnabled to true?
    console.log('\\alph' + func(str, { // will implicitly introduce the LaTeX shortcut \alpha
        greekLetterRepl:'axx',
    }));
    console.log('\\alph' + func(str, { // will not implicitly introduce a LaTeX shortcut
        greekLetterRepl:'axx', paddingEnabled:true,
    }));
    console.log('\n');

    // cancelling replacements
    str = '\\alpha q_0 q_0 \\alpha';
    const data = JsuLtx.getLatexShortcutData();
    const sc1 = data.greekLetter.extra.specialChar;
    const sc2 = data.subscript.extra.specialChar;
    console.log(func(str, {greekLetterRepl:'xx', subscriptRepl:'yy'})
               .replace(/xx/g, sc1).replace(/yy/g, sc2)
                ===
                str); // true
    const padding = JsuLtx.getSafetyPadding();
    console.log(func(str, {greekLetterRepl:'xx', subscriptRepl:'yy', paddingEnabled:true})
               .replace(/xx/g, sc1).replace(/yy/g, sc2)
                ===
                str); // false (because the safety padding is not replaced)
    const xx = new RegExp(padding + 'xx' + padding, 'g');
    const yy = new RegExp(padding + 'yy' + padding, 'g');
    console.log(func(str, {greekLetterRepl:'xx', subscriptRepl:'yy', paddingEnabled:true})
               .replace(xx, sc1).replace(yy, sc2)
                ===
                str); // true (because the safety padding is now replaced)
})();
```

## JsuLtx.combineLatexSubscripts(str)

Combines the (LaTeX) subscripts next to each other in a string into a single
subscript and returns the modified string. This is required to avoid the *double
subscript* error in a LaTeX document.
- `str`: the string containing the subscripts to combine; see some examples
below.
    - `_0_1_0` converted to `_{010}`.
    - `_0` not converted because it is not necessary to do so.

```javascript
// Example
(function() {
    console.log(JsuLtx.combineLatexSubscripts('_0 _0_1_0 \\alpha'));
})();
```

## JsuLtx.rewriteLatexCommands(str, pattern)

Rewrites the LaTeX commands in a string if needed to avoid the *undefined
control sequence* error in a LaTeX document. Indeed, if we assume that `\cmd` is
a valid LaTeX command name, then `\cmd` can be used in a LaTeX document, but
this is not necessarily the case for `\cmd<letter>` where `<letter>` matches
`[a-zA-Z]`. So, one might want to separate `<letter>` from `\cmd` so that a
LaTeX interpreter doesn't see an unexpected command, and that's exactly what
this function does.
- `str`: the string containing the commands to rewrite; see some examples below
assuming `\cmd` is the command we want to rewrite.
    - `\cmdabc` converted to `\cmd{}abc`.
    - `\cmd` or `\cmd2` not converted because it is not necessary to do so.
- `pattern`: the regular expression pattern to match the LaTeX commands to
rewrite; e.g. `\oneCommand|\anotherCommand`; bound to the same rule as for
`JsuCmn.isolateMatchingData()`.

```javascript
// Example
(function() {
    console.log(JsuLtx.rewriteLatexCommands('\\cmdabc \\cmd \\cmd2 \\cmd2b \\cmd3b', '\\\\cmd'));
    console.log(JsuLtx.rewriteLatexCommands('\\cmdabc \\cmd \\cmd2 \\cmd2b \\cmd3b', '\\\\cmd3|\\\\cmd'));
})();
```

Besides and for your information, you can search *latex command syntax* on the
internet to find out what LaTeX command names are made of, then pass a desired
command pattern to this function. Also note that `\cmd2` and `\cmd{2}` are
correct ways to pass a single digit (i.e. `2`) as parameter to `\cmd` if it
expects any parameter, and that explains why this function will not convert `\cmd2`
to `\cmd{}2` when `\cmd` is the command to rewrite; this also probably explains
why numbers are not allowed by default in LaTeX command names.

## JsuLtx.rewriteKnownLatexCommands(str, pattern)

Rewrites known/internal LaTeX commands using `JsuLtx.rewriteLatexCommands()`.
These commands are currently only composed of Greek letter commands (see
`JsuLtx.getLatexShortcutData().greekLetter.pattern.list`).
- `str`: the string containing the commands to rewrite.
- `patterns`: optional; an array of regular expression pattern to match
additional LaTeX commands to rewrite; in any case, the final regular expression
pattern used internally is passed to `JsuLtx.rewriteLatexCommands()`.

```javascript
// Typical example
(function() {
    console.log(JsuLtx.rewriteKnownLatexCommands('\\alpha \\alphabcd'));
    console.log(JsuLtx.rewriteKnownLatexCommands('\\alpha \\alphabcd \\cmdef', ['\\\\cmd']));
    console.log(JsuLtx.rewriteKnownLatexCommands('\\cmdef \\alpha \\alphabcd', ['\\\\cmd']));
})();
```

```javascript
// Example using a substring of a known pattern in the given additional pattern
(function() {
    // compare the outputs below
    const patterns = ['\\\\alphaz', '\\\\al'];
    const str = '\\alx \\alphazx \\alphax';
    console.log(JsuLtx.rewriteLatexCommands(str, patterns.join('|'))); // see (1) below
    console.log(JsuLtx.rewriteKnownLatexCommands(str, patterns)); // see (2) below

    // (1) only entries in pattern will be matched
    // (2) entries in pattern will be matched; \\\\alpha (see the properties of JsuLtx.getLatexShortcutData()
    //     mentioned in the documentation) will also be correctly matched even if its substrings are in pattern;
    //     indeed, all patterns are sorted internally in descending order using String.prototype.localeCompare()
})();
```

## JsuLtx.toLatex(str, mode)

Converts a string for use in a LaTeX document, escaping special characters if
any, and returns the converted string.
- `str`: the string to convert; LaTeX shortcuts in the string (those that could
be converted using `JsuLtx.convertLatexShortcuts()`) must be passed as is
(i.e. not converted by any means) so that this function can transform them if
necessary.
- `mode`: the LaTeX writing mode to consider; either `'text'` or `'math'`,
otherwise `str` is returned as is (i.e. no conversion takes place). For your
information, you can search *latex math mode* on the internet.

This function also calls `JsuLtx.combineLatexSubscripts()` and `JsuLtx.rewriteKnownLatexCommands()`
during conversion.

```javascript
// Example
(function() {
    const latexSpecialCharsStr = '\\^ ~${}&#%_';
    const sampleStr = '\\alpha\\alphax\\ _01_0_1_';
    for(const mode of [null, 'text', 'math']) {
        console.log('\nmode:', mode);
        console.log(JsuLtx.toLatex(latexSpecialCharsStr, mode));
        console.log(JsuLtx.toLatex(sampleStr, mode));
    }
})();
```

## JsuLtx.insertString(strToUpdate, cursorPos, strToInsert)

Inserts a string into a target string at a given position while treating each
LaTeX shortcut as a single character.
- `strToUpdate`: the string to update.
- `cursorPos`: an integer between `0` and `L` inclusive where `L` is either
`JsuLtx.convertLatexShortcuts(strToUpdate).length` or equivalently
`JsuLtx.isolateLatexShortcutValues(strToUpdate).length`; must not be a
non-integer number (e.g. `1.5`) as the rule for converting/casting to integer is
not guaranteed. This parameter can be seen as the position of a cursor in a text
editor where each LaTeX shortcut must be treated as a single character when
moving the cursor; it is the number of characters before said cursor.
- `strToInsert`: the string to insert.

Returns `null` if `cursorPos` is out of range, an object with the following
properties otherwise.
- `newStr`: the string obtained after insertion.
- `newPos`: the position of the cursor after insertion.

```javascript
// Example
(function() {
    console.log(JsuLtx.insertString('\\alph', 5, '?'));
    console.log(JsuLtx.insertString('\\alph', 5, 'a'));
    console.log(JsuLtx.insertString('alpha', 0, '\\'));
    console.log(JsuLtx.insertString('_0\\alha\\beta', 4, 'p'));
})();
```

## JsuLtx.deleteOne(strToUpdate, cursorPos)

Deletes one character from a target string at a given position while treating
each LaTeX shortcut as a single character.
- `strToUpdate`: the string to update.
- `cursorPos`: an integer between `1` and `L` inclusive where `L` is either
`JsuLtx.convertLatexShortcuts(strToUpdate).length` or equivalently
`JsuLtx.isolateLatexShortcutValues(strToUpdate).length`; must not be a
non-integer number (e.g. `1.5`) as the rule for converting/casting to integer is
not guaranteed. This parameter can be seen as the position of a cursor in a text
editor where each LaTeX shortcut must be treated as a single character when
moving the cursor; it is the number of characters before said cursor.

Returns `null` if `cursorPos` is out of range, an object with the following
properties otherwise.
- `newStr`: the string obtained after deletion.
- `newPos`: the position of the cursor after deletion.

```javascript
// Example
(function() {
    console.log(JsuLtx.deleteOne('\\alph', 5));
    console.log(JsuLtx.deleteOne('\\beta', 5));
    console.log(JsuLtx.deleteOne('\\beta', 1));
    console.log(JsuLtx.deleteOne('\\alupha\\beta', 4));
})();
```
