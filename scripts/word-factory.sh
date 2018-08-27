#!/bin/bash

DIR=`dirname $0`

if [ ! -e ~/Downloads/words-all.txt ]; then
    $DIR/pali-words.js \
    | sort -d \
    | uniq -i \
    > ~/Downloads/words-all.txt
fi

if [ ! -e ~/Downloads/words-plain.txt ]; then
    grep -e `printf '^[a-zA-Z\u2019]*$'` \
    < ~/Downloads/words-all.txt \
    | ispell -l \
    > ~/Downloads/words-plain.txt
fi

if [ ! -e ~/Downloads/words-pali.txt ]; then
    grep -v `printf '^[a-zA-Z\u2019]*$'` \
    < ~/Downloads/words-all.txt \
    > ~/Downloads/words-pali.txt
fi

if [ ! -e ~/Downloads/words-romanize.json ]; then
    $DIR/romanize.js \
    < ~/Downloads/words-pali.txt \
    > ~/Downloads/words-romanize.json
fi
