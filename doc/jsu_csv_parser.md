# jsu_csv_parser

*The following implementation of a CSV parser conforms to RFC 4180 and is based
on [this](https://github.com/arlogy/devnotes/blob/master/data/csv_parsing_for_the_developer.md)
instructional document. It is designed in such a way that it can be easily
translated into other programming languages.*

- Object-Oriented Functions
    - [JsuCsvPsr()](#jsucsvpsroptions)
    - [getConfig()](#thisgetconfig)
    - [readChunk()](#thisreadchunkstr)
    - [flush()](#thisflush)
    - [hasPendingData()](#thishaspendingdata)
    - [getRecordsRef()](#thisgetrecordsref)
    - [getRecordsCopy()](#thisgetrecordscopy)
    - [getWarningsRef()](#thisgetwarningsref)
    - [getWarningsCopy()](#thisgetwarningscopy)
    - [reset()](#thisreset)
- Examples
    - [Parsing smaller parts of a larger CSV string](#parsing-smaller-parts-of-a-larger-csv-string)

## JsuCsvPsr(options)

Creates a new instance of RFC 4180 compliant CSV parser. The parser can be used
to read CSV strings and create records (one per line and containing field
values) based on configured options.
- `options`: optional object that can have the following optional properties.
    - `fieldDelimiter`: the field delimiter; must be a string, not empty, and
    not match any other delimiter or separator, otherwise a `RangeError` is
    thrown; defaults to `'"'` if unset.
    - `fieldSeparators`: the field separators; must be an array and not contain
    duplicates; each separator must be a string, not empty, and not match any
    other delimiter or separator; a `RangeError` is thrown if all conditions
    are not met; defaults to `[',']` if unset.
    - `lineSeparators`: the line separators; this option shares the same rules
    as `fieldSeparators` but defaults to `['\n']`.
    - `smartRegex`: indicates whether the most appropriate regular expression
    must be used to match delimiters and separators; defaults to `true` if
    unset. This option should always be enabled, except for testing or
    benchmarking for example: here's why if you're interested.
        - Let's say we want to match a string against a regular expression and
        process the matches as we read double quotes or not. Possible
        implementations using arbitrary syntax are as follows.
            ```javascript
                // approach 1: match '"' or any other character as many times as possible in myString
                while(myString matches /[".]/g) {
                    switch(matchValue) { ... }
                }

                // approach 2: match '"' or any string not containing '"' as many times as possible in myString
                while(myString matches /"|[^"]+/g) {
                    switch(matchValue) { ... }
                }
            ```
        - Both approaches are functionally equivalent, but the second is better
        because it will run faster when the string to match is long enough and
        contains a large number of characters that are not double quotes.
        This is because `.` only matches one character unlike `[^"]+`; so the
        `while` loop will be entered less often in the second approach.
        Therefore, it's best to let this parser choose the regular expression
        *intelligently*.
    - `skipEmptyLinesWhen`: sets the type of empty lines that must be ignored
    during parsing, the line separators configured for this parser indicating
    what is a line and what is not. Defaults to `-1` (invalid) and invalid
    values are ignored. Valid values are one of the following integers.
        - `JsuCsvPsr.LineIsReallyEmpty`: skip a line only if it is the empty
        string (`''`).
        - `JsuCsvPsr.LineIsBlank`: skip a line if it is the empty string or
        contains only whitespace characters (`' '`, `'\t'`, `'\r'`, `'\n'`,
        ...).
        - `JsuCsvPsr.LineHasOnlyBlankFields`: skip a line if it contains only
        blank fields, including when it is blank. This option is different from
        `JsuCsvParser.LineIsBlank` because if we assume `','` is a field
        separator for example, then the line `'   '` is blank and has only one
        field (a blank one), while `', ,, '` is not blank but has only blank
        fields. Similarly, if `'\t'` was a field separator, then the line
        `'\t '` is both blank and has only blank fields (before and after the
        field separator).
    - `skipLinesWithWarnings`: indicates whether lines that contain inconsistent
    CSV strings must be ignored; defaults to `false`. See `getWarningsRef()`.

## this.getConfig()

Returns a configuration object containing the options set for this parser upon
construction. Changes made to the object will not affect the parser.

## this.readChunk(str)

Parses a CSV string.
- `str`: the string to parse; can be a substring of a larger CSV string, thus
allowing for a single line or field to be parsed across multiple calls to the
function (i.e. until an appropriate line or field separator is read).

```javascript
// Example
parser.readChunk('1,'); // first field read followed by a field separator announcing a new field
parser.readChunk('abc'); // second field read
parser.readChunk('d'); // continue reading for the previous field
parser.readChunk('ef'); // continue reading for the previous field
parser.readChunk(',3'); // third field read after the field separator
parser.readChunk('\n'); // all three fields are now part of a line
```

Here is what to know about parsing, which is implemented from the requirements
of RFC 4180.
- Field separators are used to distinguish fields.
    - E.g. `field1,field2,,field4`
- Line separators are used to distinguish lines and create records.
    - E.g. `field1,field2,,field4\n...`
- Field delimiters can be used to enclose a field.
    - E.g. `"field correctly enclosed"`, `"field enclosed but missing closing delimiter`
- When a field is enclosed with delimiters, it can contain field delimiters,
field separators and line separators which lose their special role, including
that two consecutive field delimiters are considered an escape sequence (e.g.
assuming `"` is the field delimiter, `"a""b"` is interpreted as `a"b`).
- `flush()` must be called after reading a CSV file for example; see its
documentation.
- `getWarningsRef()` and `getRecordsRef()` are other useful functions.

## this.flush()

Saves as a new record, pending data if any that were not saved after previous
calls to `readChunk()`: see `hasPendingData()`.

Indeed, a CSV parser is unable to detect the end of a line or field unless it
reads an appropriate line separator or field separator, or it reaches the end of
a file. In the latter case, i.e. when the end of a file is reached, this parser
cannot detect it because it only parses strings using `readChunk()` and is not
aware of their source (a file or an array among others).

As a result (and for example), if the last line of a CSV file does not end with
a line separator, or if that line contains an unclosed delimited field (as in
`"...` where the closing delimiter is missing), no record will be created for
that line unless this function is called. So it's safer to always call this
function after parsing the last line of a CSV file; calling it anywhere else
when parsing the file is not necessary because only the last line of a CSV file
is allowed to not have an ending line separator.

## this.hasPendingData()

Returns whether this parser contains data that were not saved after previous
calls to `readChunk()`. This function is called during `flush()`; so you
shouldn't need to call it for parsing purposes.

## this.getRecordsRef()

Returns the records found by this parser if any during readChunk(). It is an
array of arrays with each sub-array corresponding to the fields on a line.

Note that internal objects are returned for better performance and should not be
modified. If necessary, use `getRecordsCopy()` instead.

## this.getRecordsCopy()

Returns a copy of the value that would have been returned by `getRecordsRef()`.

## this.getWarningsRef()

Returns the inconsistencies found by this parser if any during `readChunk()`.
Inconsistencies only indicate that strings that do not comply with RFC 4180 have
been parsed, not that they are necessarily invalid CSV strings. So they can be
ignored as preferred.

Each inconsistency is a warning object providing several properties.
- `context`: the context in which the warning occurred; the only possible value
is `'DelimitedField'` (referring to a field enclosed with delimiters).
- `type`: the type of warning; possible values are `'DelimiterNotEscaped'` (as
in `"a"..."` instead of `"a""..."`) and `'DelimiterNotTerminated'` (as in
`"a...` or `"a""...` instead of `"a..."` or `"a""..."`).
- `message`: a description of the warning.
- `linePos`: the line where the warning occurred; the smallest value is 1.

Note that internal objects are returned for better performance and should not be
modified. If necessary, use `getWarningsCopy()` instead.

## this.getWarningsCopy()

Returns a copy of the value that would have been returned by `getWarningsRef()`.

## this.reset()

Resets any property of this parser that might be updated during `readChunk()`.
Useful for parsing unrelated CSV content with a single parser.

## Parsing smaller parts of a larger CSV string

```javascript
// Example
(function() {
    // you can adapt this example to read from a file or other sources
    // let's say we want to parse a very long CSV string
    // we can parse it incrementally by reading smaller substrings of arbitrary length
    // '-' is the field separator and '\n' the line separator
    const csvData = [
        'line1:-field2-field3-field4-field5\nline2:-field2-field3-field4-field5',
        '\n',
        'line3:-', 'field2', '-field', '3-', 'fiel', 'd', '4', '-field5\n',
        'line4:-', 'field2-field3-field4-', 'field5', '\n',
        '...\n', // fields can have a different length
        'lineN:-', 'field2', '-', 'field3', '-field4-', 'field5', // no line separator at the end of the last line
    ];

    const parser = new JsuCsvPsr({'fieldSeparators': ['-']});
    for(const data of csvData)
        parser.readChunk(data);
    parser.flush(); // this is necessary because the last line in csvData does not end with a line separator
    console.log(parser.getRecordsRef()); // you can ignore the first line if it is a header line for example
})();
```
