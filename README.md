# jsu

*JavaScript utility library for ECMAScript 5.1 (or higher, due to backwards
compatibility). See the list of browsers supporting ES5 [here](https://caniuse.com/es5).*

jsu (read JSU) stands for and provides JavaScript Utilities. It targets older
browser versions first unless there is a security risk, missing functionality
or poor performance in newer browsers. Explicit support (dedicated code) is not
planned for Internet Explorer as Microsoft Edge is its successor.

The features provided by jsu were originally part of the [nvc](https://github.com/arlogy/nvc)
project. Some of these features, such as type checking or timer events can be
found in other utility libraries. In case you find these libraries too large as
a dependency, or if they require too new JavaScript technologies, among other
disadvantages, you can use jsu as a possible fallback. For example, [jsu_event.js](src/jsu_event.js)
supports generic and timer events in just a few lines of code. Also note that
type checking is need-specific, i.e. not all use cases will accept a boolean
object as a boolean, or a numeric string or an infinite number as a number; so
even jsu implementation might not be of any help in checking data types.

Overall, jsu is not a substitute for libraries such as jQuery or others with
convenient functions like [isEqual()](https://underscorejs.org/#isEqual)
performing deep comparison of arbitrary objects.

## How-To

Documentation and examples are available [here](doc). Version changelog is
[here](CHANGELOG.md).

See this [file](DEVELOP.md) for development and maintenance notes.
