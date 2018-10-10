#!/bin/bash
grep -rciE "$1" local/suttas \
    | sort -r -k 2 -t ':' \
    | head -10                                                                                   
