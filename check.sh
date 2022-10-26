#!/bin/bash

# Runs the jshint command installed as an npm package and makes sure that only
# allowed errors are found. Note that instead of the actual error messages, it
# is the number of errors that is checked, which is sufficient.
process_npm_jshint_output() {
    echo Processing jshint output...
    local cmd='./node_modules/jshint/bin/jshint ./src'
    if ! $cmd | tail -1 | grep -Fq '3 errors';
    then
        echo Found unexpected jshint errors \(too many or too few\)
        echo Please run: $cmd
        exit 1
    fi
    echo jshint processed!
}

# Runs tests via npm.
run_npm_tests() {
    npm run test
}

echo -e '[checking] Started!\n' &&\
process_npm_jshint_output &&\
run_npm_tests &&\
echo -e '\n[checking] Done!'
