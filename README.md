# jsu

jsu (read JSU) stands for and provides JavaScript Utilities. It targets older
browser versions first unless there is a security risk, missing functionality
or poor performance in newer browsers. Support for Internet Explorer is not an
option as Microsoft Edge is its successor.

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

Documentation and examples are available [here](doc).

Version changelog is [here](CHANGELOG.md), with each version corresponding to a
[tag](https://github.com/arlogy/jsu/tags).

## Tests

```bash
git clone <project_git_uri>
cd <project_dir>/
npm install
npm run test # run all tests
    # each test file can be run standalone and will not share memory (the global
    # object for example) with other test files; this explains the multiple
    # entries of the `scripts` object in `package.json`, instead of a single
    # entry as follows for example:
    #     `"test": "echo Running tests... && mocha ./tests/_index.js ./tests/jsu*.js && echo Finished!"`
```

We use the following Node.js packages which were all installed using `npm install <package> --save-dev`.
- mocha for unit testing.
- sinon for spies, stubs and mocks.
- jsdom to imitate in a Node.js environment the behavior of a browser.
