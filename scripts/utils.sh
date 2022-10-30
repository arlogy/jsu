#!/bin/bash
# https://github.com/arlogy/jsu
# Released under the MIT License (see LICENSE file)
# Copyright (c) 2022 https://github.com/arlogy

trap ctrl_c INT # intercept the Ctrl+C (SIGINT) signal to call ctrl_c()
                # useful to safely quit while loops for example

# Called after the Ctrl+C signal is trapped.
ctrl_c() {
    echo "Trapped CTRL+C" && kill 0
}

# Reads from one file to another. This function creates the destination file if
# it does not exist and appends content to it.
read_from_to_files() {
    local src_path=$1
    local dest_path=$2
    # read lines while preserving leading/trailing spaces (IFS cleared) and
    # preventing backslash interpretation (option -r)
    while IFS= read -r line; do
        echo "$line" >> $dest_path
    done < $src_path
}
