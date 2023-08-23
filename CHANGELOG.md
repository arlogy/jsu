# Changelog

## 1.5.1 - 2023/05/06

- Fix internal typo affecting the behavior of the parser. For example, given the
CSV line `"a"b,c` where `"` is the field delimiter and `,` the field separator,
parsing now yields one column `['a"b,c']` instead of two `['a"b', 'c']`. Indeed,
the opening field delimiter should be considered unclosed because the second one
cannot be a closing delimiter (due to `b` being the next character to read).

## 1.5.0 - 2023/02/08

- Update `JsuCsvPsr.getConfig()`: the returned object has a new `regexOptimized`
property simplifying the initialization of `smartRegex` (which now only reflects
the option of the same name passed to the constructor).
- Make sure empty lines are ignored in case `skipEmptyLinesWhen` is set to `JsuCsvPsr.LineIsReallyEmpty`
when creating a parser.
- Make sure line breaks are matched in case `regexOptimized` is `false` (e.g.
when `smartRegex` is `false`) when creating a parser.

## 1.4.0 - 2022/10/10

- Update `JsuCmn.cloneDeep(value)` to `JsuCmn.cloneDeep(value, cache, cloneCustomImpl)`.
The new parameters of the function are optional.

## 1.3.0 - 2022/09/18

- Add LaTeX features under `const JsuLtx = Jsu.Latex;`.

## 1.2.0 - 2022/09/02

- Add `JsuCmn.cloneDeep(value)` for convenient deep cloning.

## 1.1.0 - 2022/07/22

- Add `JsuCmn.isCssColorOrString(value)`: returns `JsuCmn.isCssColor(value)` if
not null, or `JsuCmn.isString(value)` otherwise.
- Update `JsuCmn.isCssColor(value)`: returns `null` if `CSS.supports()` is not
available, a boolean value otherwise.

## 1.0.0 - 2022/07/18

- First release.
