# Changelog

## 1.1.0 - 2022/07/22

- `JsuCmn.isCssColor(value)` returns `null` if `CSS.supports()` is not
available, a boolean value otherwise.
- `JsuCmn.isCssColorOrString(value)` returns `JsuCmn.isCssColor(value)` if not
null, or `JsuCmn.isString(value)` otherwise.

## 1.0.0 - 2022/07/18

- First release.
