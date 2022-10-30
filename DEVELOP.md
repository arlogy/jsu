# Development

## CLI & Automation

### Tests

```bash
git clone <project_git_uri>
cd <project_dir>/
npm install
npm run test # run all tests
    # each test file can be run standalone and will not share memory (the `global`
    # object for example) with other test files; this explains the multiple `test:...`
    # entries of the `scripts` object in `package.json`, instead of a single
    # entry as follows for example:
    #     `"test": "echo Running tests... && mocha ./tests/_index.js ./tests/jsu*.js && echo Finished!"`
```

### Advanced checks

After `npm install`, the following commands can be considered, the most
important being labeled "key".

Browser-specific tests
- `npm run browser:gen-tests`: generate browser-specific tests from CLI-oriented
ones; the tests are generated in a dedicated directory and can be run in a web
browser via `tests_browserified/index.html`.
- `npm run browser:check-tests`: check browser-specific tests from the CLI,
assuming they have already been generated.
- `npm run browser:run-tests`: execute the above browser-specific commands.

More checks
- `npm run code:validate-sources`: validate source code; e.g. check that the
correct version of ECMAScript is targeted.
- `npm run code:coverage-excluding-browser`: run tests excluding
browser-specific ones to generate informative code coverage in the `coverage`
directory.
- `npm run code:check-state` (**key**): validate source code and run all tests,
including code coverage generation; this is the command to use in GitLab CI/CD
continuous integration for example.

## Dependencies

We use the following Node.js packages which were all installed using `npm install <package> --save-dev`.

### Tests

- mocha for testing.
- sinon for spies, stubs and mocks.
- jsdom to imitate in a Node.js environment the behavior of a browser.
- nyc to generate code coverage from tests; outputs to `.nycoutput` and `coverage`
by default.
- browser-or-node to trigger different test routines for Node.js and web
browsers for example.
- browserify to generate browser-specific versions of test scripts.
- karma to run browser-specific tests from the CLI, and some karma-xxx plugins
installed as npm packages.

### Others

- jshint for assurance on supported ECMAScript specifications; implicitly uses
the linting options defined in `.jshintrc`.
