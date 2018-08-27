#!/bin/bash

DIR=`dirname $0`
DIR=`realpath $DIR`

#if [ ! -e $DIR/../local/words-en.txt ]; then
    $DIR/words-en.js $DIR/../local/sc \
    | sort -f \
    | uniq -i \
    > $DIR/../local/words-en.txt
#fi

#if [ ! -e $DIR/../local/words-pli.txt ]; then
    $DIR/words-pli.js $DIR/../local/sc \
    | sort -f \
    | uniq -i \
    > $DIR/../local/words-pli.txt
#fi

#if [ ! -e $DIR/../local/words-spell.txt ]; then
    cat $DIR/../local/words-en.txt \
    | aspell -p $DIR/../words/aspell.en.pws -a \
    | cut -d ' ' -f 2 \
    | grep -v '*' \
    | sed -e "/^$/d" \
    | tee $DIR/../local/words-spell.txt
#fi

#if [ ! -e $DIR/../local/words-pali.txt ]; then
    #grep -v `printf '^[a-zA-Z\u2019]*$'` \
    #< $DIR/../local/words-en.txt \
    #> $DIR/../local/words-pali.txt
#fi

#if [ ! -e $DIR/../local/words-romanize.json ]; then
    #$DIR/romanize.js \
    #< $DIR/../local/words-pali.txt \
    #> $DIR/../local/words-romanize.json
#fi
