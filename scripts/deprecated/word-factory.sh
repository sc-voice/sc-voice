#!/bin/bash

DIR=`dirname $0`
DIR=`realpath $DIR`
CACHE=0

if [[ $CACHE -eq 0 ]] || [[ ! -e $DIR/../local/words-en-all.txt ]]; then
    echo -e "generating words-en-all.txt" >&2
    $DIR/words-en.js $DIR/../local/sc \
    | sort -f \
    | uniq -i \
    > $DIR/../local/words-en-all.txt
fi

if [[ $CACHE -eq 0 ]] || [[ ! -e $DIR/../local/words-pli.txt ]]; then
    echo -e "generating words-pli.txt" >&2
    $DIR/words-pli.js $DIR/../local/sc \
    | sort -f \
    | uniq -i \
    > $DIR/../local/words-pli.txt
fi

if [[ $CACHE -eq 0 ]] || [[ ! -e $DIR/../local/words-en-pli.txt ]]; then
    echo -e "generating words-en-pli.txt" >&2
    cat $DIR/../local/words-en-all.txt \
    | aspell --encoding=utf-8 -p $DIR/../words/aspell.en.pws -a \
    | cut -d ' ' -f 2 \
    | grep -v '*' \
    | sed -e "/^$/d" -e "1d" \
    > $DIR/../local/words-en-pli.txt
fi

if [[ $CACHE -eq 0 ]] || [[ ! -e $DIR/../local/words-en.json ]]; then
    echo -e "generating words-en.json" >&2
    cat $DIR/../local/words-en-all.txt $DIR/../local/words-en-pli.txt \
    | sort -f \
    | uniq -u \
    | sed -e 's/.*/  "&": {"language":"en"},/' -e '/\\"/d' \
    > $DIR/../local/words-en.json
fi

if [[ $CACHE -eq 0 ]] || [[ ! -e $DIR/../local/words-romanize.json ]]; then
    echo -e "generating words-romanize.txt" >&2
    $DIR/romanize.js \
    < $DIR/../local/words-pli.txt \
    > $DIR/../local/words-romanize.json
fi
