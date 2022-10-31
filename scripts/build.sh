#!/bin/bash
# https://github.com/arlogy/jsu
# Released under the MIT License (see LICENSE file)
# Copyright (c) 2022 https://github.com/arlogy

# get the absolute path to the root of the git project containing this script;
# this allows the script to be moved or run from anywhere
SCRIPT_PATH=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$SCRIPT_PATH" && git rev-parse --show-toplevel)
if [[ ! -d "$ROOT" ]]; then
    echo "Failed to get git root directory" && exit 1
fi

source "$ROOT/scripts/utils.sh"

# Converts CLI-oriented test files to browser-specific equivalents using the npm
# browserify package and creates an index.html page for running the tests.
browserify_tests() {
    local base_dir="$1"
    local src_dir="$base_dir/tests"
    local dst_dir="$base_dir/tests_browserified"
    local dst_html="$dst_dir/index.html"
    echo "Remove and recreate $dst_dir" && rm -rf "$dst_dir" && mkdir -p "$dst_dir"
    read_from_to_files "$src_dir/_browser.template.part1.html" "$dst_html"
    local fpath
    for fpath in "$src_dir"/*.js; do # we consider all *.js files for simplicity
        local fname=$(basename "$fpath")
        local cmd="npx browserify \"$fpath\" --outfile \"$dst_dir/$fname\""
        echo "$cmd" && bash -c "$cmd"
        echo "        <script src=\"./$fname\"></script>" >> "$dst_html"
    done
    read_from_to_files "$src_dir/_browser.template.part2.html" "$dst_html"
    echo "HTML test file generated at $dst_html"
}

# Validates source code against the rules established for the jshint npm
# package: essentially checks that the correct version of ECMAScript is
# targeted.
validate_sources() {
    # run the jshint command and make sure that only allowed errors are found;
    # note that it is the number of errors that is checked instead of the actual
    # error messages, which is sufficient
    echo "Validating sources..."
    local base_dir="$1"
    local cmd="npx jshint \"$base_dir/src\""
    if ! bash -c "$cmd" | tail -1 | grep -Fq "3 errors"; then
        echo "Failed to execute command or found unexpected jshint errors (too many or too few)"
        echo "The command: $cmd"
        exit 1
    fi
    echo "Sources validated!"
}

if [ "$#" -ne 1 ]; then
    echo "Invalid number of parameters: 1 expected, $# found" && exit 1
fi

if [ $1 == "browserify-tests" ]; then
    browserify_tests "$ROOT"
elif [ $1 == "validate-sources" ]; then
    validate_sources "$ROOT"
else
    echo "Parameter must be any of: browserify-tests, validate-sources" && exit 1
fi
