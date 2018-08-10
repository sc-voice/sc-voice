#!/bin/bash

echo -e "INIT\t: $0 START: `date`"
if [ -e node_modules ]; then
    echo -e "INIT\t: node_modules exist. no action required"
else
    echo -e "INIT\t: npm install..."
    npm install
fi

if [ -e local/watson ]; then
    echo -e "INIT\t: watson folder exists. no action required"
else
    echo -e "INIT\t: creating local/watson"
    mkdir -p local/watson
fi

if [ -e local/mn ]; then
    echo -e "INIT\t: mn folder exists. no action required"
else
    pushd local
    echo -e "INIT\t: loading SuttaCentral translation content (translation.zip)..."
    curl https://codeload.github.com/suttacentral/translation/zip/master -o master.zip
    unzip master.zip
    mv translation-master/mn .
    rm -rf master.zip translation-master
    popd
fi

echo -e "INIT\t: $0 END: `date`"
