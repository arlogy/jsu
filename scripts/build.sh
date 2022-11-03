#!/bin/bash
# https://github.com/arlogy/jsu
# Released under the MIT License (see LICENSE file)
# Copyright (c) 2022 https://github.com/arlogy

# Get the absolute path to the root of the git project containing this script.
# This allows for better control of resource or script paths.
SCRIPT_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT_PATH=$(cd "$SCRIPT_PATH" && git rev-parse --show-toplevel)
if [[ ! -d "$ROOT_PATH" ]]; then
    echo "Failed to get git root directory" && exit 1
fi

source "$ROOT_PATH/scripts/defs.sh" || exit 1

if [ "$#" -ne 1 ]; then
    echo "Invalid number of parameters: 1 expected, $# found" && exit 1
fi

if [ "$1" == "browserify-tests" ]; then
    browserify_tests "$ROOT_PATH/tests" "$ROOT_PATH/tests_browserified" || exit 1
elif [ "$1" == "validate-sources" ]; then
    validate_sources "$ROOT_PATH/src" || exit 1
else
    echo "Parameter must be one of: browserify-tests, validate-sources" && exit 1
fi
