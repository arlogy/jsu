# Jsu

Jsu (read JSU) stands for and provides JavaScript Utilities. It targets older
browser versions first unless there is a security risk, missing functionality
or poor performance in newer browsers. Support for Internet Explorer is not an
option as Microsoft Edge is its successor.

The features provided by Jsu were originally part of the [nvc](https://github.com/arlogy/nvc)
project. Most of these features, such as type checking or timer events can be
found in other utility libraries. In case you find these libraries too large as
a dependency, or if they require too new JavaScript technologies, among other
disadvantages, you can use Jsu as a possible fallback. For example,
[jsu_event.js](https://github.com/arlogy/jsu/blob/main/src/jsu_event.js)
supports generic and timer events in just a few lines of code.

Overall, Jsu is not a substitute for libraries such as jQuery or others with
convenient functions like [isEqual()](https://underscorejs.org/#isEqual)
performing deep comparison of arbitrary objects.

## How-To

Documentation and examples are available [here](https://github.com/arlogy/jsu/tree/main/doc).

## Tests

```bash
git clone <project_git_uri>
cd <project_dir>/
npm install
npm run test # run tests
```

We use the following Node.js packages which were all installed using `npm install <package> --save-dev`.
- Mocha for unit testing.
- jsdom to imitate in a Node.js environment the behavior of a browser.
