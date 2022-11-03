#!/bin/bash
# https://github.com/arlogy/jsu
# Released under the MIT License (see LICENSE file)
# Copyright (c) 2022 https://github.com/arlogy

# ----------------------
# --- Initialization ---
# ----------------------

# Intercept shell process termination (EXIT signal) to call exit_handler(). The
# function named "on_exit" will be called if defined.
trap exit_handler EXIT
exit_handler() {
    # depending on the current command, the messages logged by the on_exit
    # function may not be displayed to the user (i.e. even after the script
    # terminates)
    [[ "$(type -t on_exit)" == "function" ]] && on_exit
}

# Intercept Ctrl+C (SIGINT signal) to call ctrl_c_handler(). Useful to break
# earlier from while loops for example.
trap ctrl_c_handler INT
ctrl_c_handler() {
    echo "Trapped CTRL+C" && exit 1 # exit_handler will also be triggered
}

# --------------------
# --- Test Helpers ---
# --------------------

# Runs a test suite. Expected parameters: a single-line message and a function
# (representing the test cases to execute).
run_ts() {
    local msg func
    msg="$1"
    func="$2"
    echo_tsm "$msg" && $func
}

# Prints a test suite message. Expected parameters: the single-line message to
# print.
echo_tsm() { echo "  $1"; }

# Prints a test case message. Expected parameters: the single-line message to
# print.
echo_tcm() { echo "    - $1"; }

# Prints a test case failure. Expected parameters: the single-line failure
# message to print.
echo_tcf() { echo "    | did not pass: $1"; }

# Checks file content. The first argument is a file path; the others (if any)
# are the expected data (one per line in the given file).
check_fc() {
    local fpath line count
    fpath="$1"
    count=1
    while IFS= read -r line; do
        ((count++))
        if [ "$line" != "${!count}" ]; then echo "Parameter #$count is missing or has an unexpected value" && return 1; fi
    done < "$fpath"
    if [ "$#" -ne "$count" ]; then echo "$count parameters expected, $# given" && return 1; fi
    return 0
}

# -------------------------
# --- General functions ---
# -------------------------

# Reads from one file to another; both must exist. This function appends content
# to the destination file (i.e. existing content is not lost).
read_from_to_files() {
    if [ "$#" -ne 2 ]; then
        echo "2 parameters expected to read from one file to another, $# given" 1>&2 && return 1
    fi

    local src_file dst_file
    src_file="$1"
    dst_file="$2"
    if [[ ! -f "$src_file" || ! -f "$dst_file" ]]; then
        echo "Source path or destination path is not a file" 1>&2 && return 1
    fi

    # read lines while preserving leading/trailing spaces (so IFS is cleared)
    # and preventing backslash interpretation (so option -r is used)
    local line
    while IFS= read -r line; do
        echo "$line" >> "$dst_file"
    done < "$src_file"
    return 0
}

# --------------------------------------
# --- Application-specific functions ---
# --------------------------------------

# Converts CLI-oriented *.js test files to browser-specific equivalents using
# the npm browserify package and creates an index.html page for running the
# tests. The test files are read non-recursively from the first given directory
# that must exists; each of them is browserified and output into the second
# given directory which is first deleted.
#
# Note: make sure to pass directories that do not resolve to the same path (i.e.
# they do not point to the same location), otherwise data will be lost (rm
# command used).
browserify_tests() {
    if [ "$#" -ne 2 ]; then
        echo "2 parameters expected to browserify tests, $# given" 1>&2 && return 1
    fi

    local src_dir dst_dir dst_html
    src_dir="$1"
    dst_dir="$2"
    dst_html="$dst_dir/index.html"
    if [[ ! -d "$src_dir" ]]; then
        echo "Test source path is not a directory" 1>&2 && return 1
    fi

    echo "Remove and recreate $dst_dir" && rm -rf "$dst_dir" && mkdir -p "$dst_dir" || return 1

    touch "$dst_html" && read_from_to_files "$src_dir/_browser.template.part1.html" "$dst_html" || return 1

    # create a subshell just to enclose exports (using the export command)
    # all *.js files are considered for simplicity; subdirectories are excluded
    # see xargs documentation for exit status 255
    (
        export -f _browserify_tests_callback &&\
        find "$src_dir" -maxdepth 1 -name "*.js" | xargs -I{} bash -c "_browserify_tests_callback \"{}\" \"$dst_dir\" \"$dst_html\" || exit 255"
    ) || return 1

    read_from_to_files "$src_dir/_browser.template.part2.html" "$dst_html" || return 1

    echo "HTML test file available at $dst_html"
    return 0
}

# Private callback function for browserify_tests. Browserifies a JS file.
_browserify_tests_callback() {
    local fpath dst_dir dst_html
    fpath="$1"
    dst_dir="$2"
    dst_html="$3"

    local fname cmd
    fname="$(basename "$fpath")" || return 1
    cmd="npx browserify \"$fpath\" --outfile \"$dst_dir/$fname\"" || return 1
    echo "$cmd" && bash -c "$cmd" || return 1
    echo "        <script src=\"file://$dst_dir/$fname\"></script>" >> "$dst_html" || return 1

    return 0
}

# Validates source code against the rules established for the jshint npm
# package: essentially checks that the correct version of ECMAScript is
# targeted.
validate_sources() {
    if [ "$#" -ne 1 ]; then
        echo "1 parameter expected to validate sources, $# given" 1>&2 && return 1
    fi

    local src_dir
    src_dir="$1"
    if [[ ! -d "$src_dir" ]]; then
        echo "The given source directory is invalid" 1>&2 && return 1
    fi

    echo "Validating sources..."

    # run the jshint command and make sure that only allowed errors are found;
    # note that it is the number of errors that is checked instead of the actual
    # error messages, which is sufficient
    local cmd
    cmd="npx jshint \"$src_dir\""
    if ! bash -c "$cmd" | tail -1 | grep -Fq "3 errors"; then
        echo "Failed to execute command or found unexpected jshint errors (too many or too few)" 1>&2
        echo "The command: $cmd" 1>&2
        return 1
    fi

    echo "Sources validated!"
    return 0
}
