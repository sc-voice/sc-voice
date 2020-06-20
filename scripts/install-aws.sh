#!/bin/bash

echo -e "INIT\t: $0 START: `date`"

SCRIPT_DIR=`realpath \`dirname $0\``

type aws
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: upgrading AWS CLI detected"
else
    echo -e "INIT\t: installing AWS CLI detected"
fi
pushd ~
BIN="`pwd`/bin"
mkdir -p $BIN
echo $PATH | grep -E "~/bin|$BIN"
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: AWS CLI $BIN will installed in $BIN"
    rm -f awscli-bundle.zip
    curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"
    rm -rf awscli-bundle
    unzip awscli-bundle.zip
    ./awscli-bundle/install -b ~/bin/aws
else
    echo -e "INIT\t: $BIN cannot be used for installing AWS CLI for Polly"
    echo -e "INIT\t: Make sure ~/bin exists and is in your PATH"
    echo -e "ERROR\t: Install AWS CLI manually and rerun this script"
    exit 0
fi
popd

echo -e "INIT\t: $0 END: `date`"
