#!/bin/bash
# https://github.com/arlogy/jsu
# Released under the MIT License (see LICENSE file)
# Copyright (c) 2022 https://github.com/arlogy

# Get the absolute path to the root of the git repository containing this
# script. This allows for better control of resource or script paths.
SCRIPT_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT_PATH=$(cd "$SCRIPT_PATH" && git rev-parse --show-toplevel)
if [[ ! -d "$ROOT_PATH" ]]; then
    echo "Unable to get the root directory of the git repository containing this script" && exit 1
fi

source "$ROOT_PATH/scripts/defs.sh" || exit 1

TMP_DIR=$(mktemp -d)
on_exit() {
    rm -rf "$TMP_DIR"
}

TEST_DIR="$TMP_DIR/word 1/word 2" # directory name can contain spaces and tests should succeed
mkdir -p "$TEST_DIR" || exit 1

test_read_from_to_files() {
    local rnd a b c d
    rnd="$RANDOM"
    a="$TEST_DIR/a" b="$TEST_DIR/b" c="$TEST_DIR/c" d="$TEST_DIR/d"

    echo_tcm "should fail when called with less than two parameters (0)"
    read_from_to_files 1>/dev/null 2>&1
    if [[ "$?" -ne 1 ]]; then
        echo_tcf "incorrect return status" && return 1
    fi

    echo_tcm "should fail when called with less than two parameters (1)"
    read_from_to_files "$a" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 || -f "$a" ]]; then
        echo_tcf "incorrect return status, or unexpected file created" && return 1
    fi

    echo_tcm "should fail when called with more than two parameters (3)"
    read_from_to_files "$a" "$b" "$c" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 || -f "$a" || -f "$b" || -f "$c" ]]; then
        echo_tcf "incorrect return status, or unexpected file created" && return 1
    fi

    echo_tcm "should fail when called with more than two parameters (4)"
    read_from_to_files "$a" "$b" "$c" "$d" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 || -f "$a" || -f "$b" || -f "$c" || -f "$d" ]]; then
        echo_tcf "incorrect return status, or unexpected file created" && return 1
    fi

    echo_tcm "should fail when called with exactly two parameters (both are not files)"
    read_from_to_files "$a" "$b" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 || -f "$a" || -f "$b"  ]]; then
        echo_tcf "incorrect return status, or unexpected file created" && return 1
    fi

    echo_tcm "should fail when called with exactly two parameters (only the first is a file)"
    echo "$rnd" > "$TEST_DIR/file1.txt"
    read_from_to_files "$TEST_DIR/file1.txt" "$b" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 || ! -f "$TEST_DIR/file1.txt" || $(check_fc "$TEST_DIR/file1.txt" "$rnd") != "" || -f "$b" ]]; then
        echo_tcf "incorrect return status, or source file deleted/changed unexpectedly, or destination file created unexpectedly" && return 1
    fi

    echo_tcm "should fail when called with exactly two parameters (only the second is a file)"
    echo "$rnd" > "$TEST_DIR/file2.txt"
    read_from_to_files "$a" "$TEST_DIR/file2.txt" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 || -f "$a" || ! -f "$TEST_DIR/file2.txt" || $(check_fc "$TEST_DIR/file2.txt" "$rnd") != "" ]]; then
        echo_tcf "incorrect return status, or source file created unexpectedly, or destination file deleted/changed unexpectedly" && return 1
    fi

    echo_tcm "should succeed when called with exactly two parameters (both are files)"
    # initialize data with the following in mind: leading/trailing spaces in the source file must be preserved,
    # backslashes in the source file must not be interpreted, and the initial content of the destination file
    # must not be lost (i.e. new content is appended)
    local src_line1 src_line2 dst_line1
    src_line1="    \tligne1\nligne1 $rnd    " src_line2="ligne2 content $rnd" dst_line1=" initial content preserved $rnd "
    echo "$src_line1" > "$TEST_DIR/file1.txt" && echo "$src_line2" >> "$TEST_DIR/file1.txt"
    echo "$dst_line1" > "$TEST_DIR/file2.txt"
    # test function
    read_from_to_files "$TEST_DIR/file1.txt" "$TEST_DIR/file2.txt" 1>/dev/null 2>&1
    if [[ "$?" -ne 0 || $(check_fc "$TEST_DIR/file1.txt" "$src_line1" "$src_line2") != "" ||\
                        $(check_fc "$TEST_DIR/file2.txt" "$dst_line1" "$src_line1" "$src_line2") != "" ]]; then
        echo_tcf "incorrect return status, or source file changed unexpectedly, or destination file incorrectly updated" && return 1
    fi
}

test_browserify_tests() {
    local a b c d
    a="$TEST_DIR/a" b="$TEST_DIR/b" c="$TEST_DIR/c" d="$TEST_DIR/d"

    echo_tcm "should fail when called with less than two parameters (0)"
    browserify_tests 1>/dev/null 2>&1
    if [[ "$?" -ne 1 ]]; then
        echo_tcf "incorrect return status" && return 1
    fi

    echo_tcm "should fail when called with less than two parameters (1)"
    browserify_tests "$a" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 || -d "$a" ]]; then
        echo_tcf "incorrect return status, or unexpected directory created" && return 1
    fi

    echo_tcm "should fail when called with more than two parameters (3)"
    browserify_tests "$a" "$b" "$c" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 || -d "$a" || -d "$b" || -d "$c" ]]; then
        echo_tcf "incorrect return status, or unexpected directory created" && return 1
    fi

    echo_tcm "should fail when called with more than two parameters (4)"
    browserify_tests "$a" "$b" "$c" "$d" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 || -d "$a" || -d "$b" || -d "$c" || -d "$d" ]]; then
        echo_tcf "incorrect return status, or unexpected directory created" && return 1
    fi

    echo_tcm "should fail when called with exactly two parameters (both are not directories)"
    browserify_tests "$a" "$b" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 || -d "$a" || -d "$b" ]]; then
        echo_tcf "incorrect return status, or unexpected directory created" && return 1
    fi

    echo_tcm "should fail when called with exactly two parameters (only the second is a directory)"
    mkdir -p "$TEST_DIR/dir1"
    browserify_tests "$a" "$TEST_DIR/dir1" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 || -d "$a" || ! -d "$TEST_DIR/dir1" || $(ls -A "$TEST_DIR/dir1") != "" ]]; then # using ls to check that the directory is still empty
        echo_tcf "incorrect return status, or source directory created unexpectedly, or destination directory deleted/changed unexpectedly" && return 1
    fi

    echo_tcm "should behave as expected when called with exactly two parameters (only the first is a directory, and there are no files to browserify)"
    rm -rf "$TEST_DIR/dir1" "$TEST_DIR/dir2" && mkdir -p "$TEST_DIR/dir1"
    test_browserify_tests_possibleSuccessBehavior true "$TEST_DIR/dir1" "$TEST_DIR/dir2" || return 1

    echo_tcm "should behave as expected when called with exactly two parameters (only the first is a directory, and there are files to browserify)"
    rm -rf "$TEST_DIR/dir1" "$TEST_DIR/dir2" && mkdir -p "$TEST_DIR/dir1"
    test_browserify_tests_possibleSuccessBehavior false "$TEST_DIR/dir1" "$TEST_DIR/dir2" || return 1

    echo_tcm "should behave as expected when called with exactly two parameters (both are directories, and there are no files to browserify)"
    rm -rf "$TEST_DIR/dir1" "$TEST_DIR/dir2" && mkdir -p "$TEST_DIR/dir1" "$TEST_DIR/dir2"
    test_browserify_tests_possibleSuccessBehavior true "$TEST_DIR/dir1" "$TEST_DIR/dir2" || return 1

    echo_tcm "should behave as expected when called with exactly two parameters (both are directories, and there are files to browserify)"
    rm -rf "$TEST_DIR/dir1" "$TEST_DIR/dir2" && mkdir -p "$TEST_DIR/dir1" "$TEST_DIR/dir2"
    test_browserify_tests_possibleSuccessBehavior false "$TEST_DIR/dir1" "$TEST_DIR/dir2" || return 1
}

# Starts with the failure cases and gradually creates the configuration required
# for the success case; hence the name of the function.
test_browserify_tests_possibleSuccessBehavior() {
    local nftb src_dir dst_dir rnd part1 part2
    nftb="$1" # no files to browserify? (true/false, indicates whether files should not be created for browserification)
    src_dir="$2" # will be cleared and initialized according to nftb; so it should be empty
    dst_dir="$3"
    rnd="$RANDOM"
    part1="$rnd Part1"
    part2="$rnd Part2"

    rm -rf "$src_dir" && mkdir -p "$src_dir"
    if [[ "$nftb" == true ]]; then
        touch "$src_dir/initial_content.txt"
    else
        # create the files to browserify with the following in mind: only *.js files are matched;
        # files in subfolders are not matched
        mkdir -p "$src_dir/sub/sub"
        touch "$src_dir/a.js" "$src_dir/b.txt" "$src_dir/c.js" # so only the two JS files created here will be matched
        touch "$src_dir/sub/a.js" "$src_dir/sub/b.txt" "$src_dir/sub/c.js"
        touch "$src_dir/sub/sub/a.js" "$src_dir/sub/sub/b.txt" "$src_dir/sub/sub/c.js"
    fi
    # print a JS comment (//...) in each file as initial content; we will use it to check that $src_dir hasn't changed
    # note that a valid JS statement (here a comment) is only required for files that will be browserified
    #     so that an exception is not thrown during browserification
    find "$src_dir" -type f -exec bash -c "echo //$rnd \"{}\" > \"{}\"" \;

    browserify_tests "$src_dir" "$dst_dir" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 ]]; then
        echo_tcf "incorrect return status - failure expected here because a file is missing (created next)" && return 1
    fi

    echo "$part1" > "$src_dir/_browser.template.part1.html" # create the missing file
    browserify_tests "$src_dir" "$dst_dir" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 ]]; then
        echo_tcf "incorrect return status - failure expected here because a file is missing (created next)" && return 1
    fi

    echo "$part2" > "$src_dir/_browser.template.part2.html" # create the missing file
    mkdir -p "$dst_dir/this_directory_will_be_lost"
    browserify_tests "$src_dir" "$dst_dir" 1>/dev/null 2>&1
    if [[ "$?" -ne 0 || -d "$dst_dir/this_directory_will_be_lost" || ! -d "$dst_dir" ]]; then
        echo_tcf "incorrect return status, or destination directory not deleted/recreated" && return 1
    fi

    if [[ "$nftb" == true ]]; then
        if [[ ! -f "$dst_dir/index.html" || $(check_fc "$dst_dir/index.html" "$part1" "$part2") != "" ]]; then
            echo_tcf "index.html file missing or incorrectly initialized in destination directory" && return 1
        fi
        if [[ $(ls -I "index.html" "$dst_dir") != "" ]]; then
            echo_tcf "destination directory has content other than index.html" && return 1
        fi
        # check the source directory which should not have changed (after all introduced content has been removed)
        rm -rf "$src_dir/_browser.template.part1.html" "$src_dir/_browser.template.part2.html" "$src_dir/index.html"
        if [[ ! -d "$src_dir" ||\
              #
              $(ls -I "initial_content.txt" "$src_dir") != "" ||\
              #
              ! -f "$src_dir/initial_content.txt" ||\
              #
              $(check_fc "$src_dir/initial_content.txt" "//$rnd $src_dir/initial_content.txt") != "" ]]; then
            echo_tcf "source directory changed unexpectedly" && return 1
        fi
    else
        if [[ ! -f "$dst_dir/index.html" || $(check_fc "$dst_dir/index.html"\
                                                       "$part1"\
                                                       "        <script src=\"file://$dst_dir/a.js\"></script>"\
                                                       "        <script src=\"file://$dst_dir/c.js\"></script>"\
                                                       "$part2") != "" ]]; then
            echo_tcf "index.html file missing or incorrectly initialized in destination directory" && return 1
        fi
        if [[ $(ls -I "index.html" -I "a.js" -I "c.js" "$dst_dir") != "" ]]; then
            echo_tcf "destination directory has content other than index.html and expected *.js files" && return 1
        fi
        # check the source directory which should not have changed (after all introduced content has been removed)
        rm -rf "$src_dir/_browser.template.part1.html" "$src_dir/_browser.template.part2.html" "$src_dir/index.html"
        if [[ ! -d "$src_dir/sub/sub" ||\
              #
              $(ls -I "a.js" -I "b.txt" -I "c.js" "$src_dir") != "sub" ||\
              $(ls -I "a.js" -I "b.txt" -I "c.js" "$src_dir/sub") != "sub" ||\
              $(ls -I "a.js" -I "b.txt" -I "c.js" "$src_dir/sub/sub") != "" ||\
              #
              ! -f "$src_dir/a.js" || ! -f "$src_dir/b.txt" || ! -f "$src_dir/c.js" ||\
              ! -f "$src_dir/sub/a.js" || ! -f "$src_dir/sub/b.txt" || ! -f "$src_dir/sub/c.js" ||\
              ! -f "$src_dir/sub/sub/a.js"|| ! -f "$src_dir/sub/sub/b.txt" || ! -f "$src_dir/sub/sub/c.js" ||\
              #
              $(check_fc "$src_dir/a.js"          "//$rnd $src_dir/a.js")          != "" ||\
              $(check_fc "$src_dir/b.txt"         "//$rnd $src_dir/b.txt")         != "" ||\
              $(check_fc "$src_dir/c.js"          "//$rnd $src_dir/c.js")          != "" ||\
              $(check_fc "$src_dir/sub/a.js"      "//$rnd $src_dir/sub/a.js")      != "" ||\
              $(check_fc "$src_dir/sub/b.txt"     "//$rnd $src_dir/sub/b.txt")     != "" ||\
              $(check_fc "$src_dir/sub/c.js"      "//$rnd $src_dir/sub/c.js")      != "" ||\
              $(check_fc "$src_dir/sub/sub/a.js"  "//$rnd $src_dir/sub/sub/a.js")  != "" ||\
              $(check_fc "$src_dir/sub/sub/b.txt" "//$rnd $src_dir/sub/sub/b.txt") != "" ||\
              $(check_fc "$src_dir/sub/sub/c.js"  "//$rnd $src_dir/sub/sub/c.js")  != ""
           ]]; then
            echo_tcf "source directory changed unexpectedly" && return 1
        fi
    fi
}

test_validate_sources() {
    local a b c
    a="$TEST_DIR/a" b="$TEST_DIR/b" c="$TEST_DIR/c"

    echo_tcm "should fail when called with less than one parameter (0)"
    validate_sources 1>/dev/null 2>&1
    if [[ "$?" -ne 1 ]]; then
        echo_tcf "incorrect return status" && return 1
    fi

    echo_tcm "should fail when called with more than one parameter (2)"
    validate_sources "$a" "$b" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 ]]; then
        echo_tcf "incorrect return status" && return 1
    fi

    echo_tcm "should fail when called with more than one parameter (3)"
    validate_sources "$a" "$b" "$c" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 ]]; then
        echo_tcf "incorrect return status" && return 1
    fi

    echo_tcm "should fail when called with exactly one parameter (not a directory)"
    validate_sources "" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 ]]; then
        echo_tcf "incorrect return status" && return 1
    fi

    echo_tcm "should fail when called with exactly one parameter (a directory containing invalid source code)"
    rm -rf "$TEST_DIR/src" && mkdir -p "$TEST_DIR/src" # an empty directory is enough to test here
    validate_sources "$TEST_DIR/src" 1>/dev/null 2>&1
    if [[ "$?" -ne 1 ]]; then
        echo_tcf "incorrect return status" && return 1
    fi

    echo_tcm "should succeed when called with exactly one parameter (a directory containing valid source code)"
    # initialize data with the following in mind: the *.js source files can be placed in subfolders,
    # must comply with the ES5 standard and contain exactly 3 errors; also, non-JS files are ignored
    rm -rf "$TEST_DIR/src" && mkdir -p "$TEST_DIR/src/sub/sub"
    echo "const x = 0;" > "$TEST_DIR/src/a1.js"
    echo "new Boolean();" > "$TEST_DIR/src/sub/a.js"
    echo "const x = 0;" > "$TEST_DIR/src/sub/sub/a.js"
    echo "" > "$TEST_DIR/src/a2.js"
    echo "invalid code that will not be checked because not in a JS file" > "$TEST_DIR/src/a.txt"
    echo "invalid code that will not be checked because not in a JS file" > "$TEST_DIR/src/sub/a.txt"
    # test function
    validate_sources "$TEST_DIR/src" 1>/dev/null 2>&1
    if [[ "$?" -ne 0 ]]; then
        echo_tcf "incorrect return status" && return 1
    fi
}

# Run tests. The rm command is only executed so that each test suite starts with
# a clean test directory and only cares about what it creates inside that
# directory; so the idea here is not to substitute on_exit.
#
# During development:
#     - you can add `run_ts <your_parameters>; exit 0` below so you can focus on
#       a single test suite.
#     - you can also comment `1>/dev/null 2>&1` in test cases to see the output
#       of a command.
run_ts "read_from_to_files" test_read_from_to_files && rm -rf "$TEST_DIR"/* && echo&&\
run_ts "browserify_tests"   test_browserify_tests   && rm -rf "$TEST_DIR"/* && echo&&\
run_ts "validate_sources"   test_validate_sources   && rm -rf "$TEST_DIR"/*
