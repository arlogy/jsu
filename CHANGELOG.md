# Changelog

## 1.5.0 - Next version

- Update `JsuCsvPsr.getConfig()`: the returned object has a new `regexOptimized`
property simplifying the initialization of `smartRegex` (which now only reflects
the option of the same name passed to the constructor).

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
