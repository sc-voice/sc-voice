#!/bin/bash
grep -rciE "\b$1\b" --exclude-dir=.git local/suttas \
    | grep -v ':0' \
    | sort -r -k 2 -t ':' \
    | sort -r -k 2,2 -k 1,1 -t ':' \
    | head -10                                                                                   
