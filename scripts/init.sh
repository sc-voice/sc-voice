#!/bin/bash

echo -e "INIT\t: $0 START: `date`"

sudo apt-get update -y
sudo apt-get upgrade -y

type unzip
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: unzip detected (OK)"
else
    echo -e "INIT\t: installing unzip (requires sudo)"
    sudo apt-get install -y unzip
fi

type npm
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: npm detected (OK)"
else
    echo -e "INIT\t: installing npm (requires sudo)"
    sudo apt-get install -y npm
fi

type node
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: node detected (OK)"
else
    echo -e "INIT\t: installing node (requires sudo)"
    npm install -g npm@latest
fi

type aspell
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: aspell detected (OK)"
else
    echo -e "INIT\t: installing aspell (requires sudo)"
    sudo apt-get install -y aspell
fi

type ffmpeg
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: ffmpeg detected (OK)"
else
    echo -e "INIT\t: installing ffmpeg (requires sudo)"
    sudo apt-get install -y ffmpeg
fi

type python
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: Python detected (consult AWS CLI for required version)"
else
    echo -e "INIT\t: installing python (requires sudo)"
    sudo apt-get install -y python
    #echo -e "ERROR\t: Python not installed. See AWS CLI documentation"
    #echo -e "ERROR\t: https://docs.aws.amazon.com/cli/latest/userguide/awscli-install-bundle.html"
    #echo -e "ERROR\t: Install correct version of Python per AWS CLI instructions"
    #exit -1
fi

type aws
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: AWS CLI detected (OK)"
else
    pushd ~
    BIN="`pwd`/bin"
    echo $PATH | grep -E "~/bin|$BIN"
    RC=$?; if [ "$RC" == "0" ]; then
        echo -e "INIT\t: AWS CLI $BIN will installed in $BIN"
        curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"
        unzip awscli-bundle.zip
        ./awscli-bundle/install -b ~/bin/aws
    else
        echo -e "INIT\t: $BIN cannot be used for installing AWS CLI for Polly"
        echo -e "ERROR\t: Install AWS CLI manually and rerun this script"
        exit 0
    fi
    popd
fi

if [ -e node_modules ]; then
    echo -e "INIT\t: node_modules exist (OK)"
else
    echo -e "INIT\t: npm install..."
    npm install
fi

if [ -e local/watson ]; then
    echo -e "INIT\t: watson folder exists (OK)"
else
    echo -e "INIT\t: creating local/watson"
    mkdir -p local/watson
fi

if [ -e local/sc ]; then
    echo -e "INIT\t: mn folder exists (OK)"
else
    pushd local
    echo -e "INIT\t: loading SuttaCentral translation content (translation.zip)..."
    curl https://codeload.github.com/suttacentral/translation/zip/master -o master.zip
    unzip master.zip
    mv translation-master sc
    rm sc/README.md
    popd
fi

if [ -e local/awscli-bundle ]; then
    echo -e "INIT\t: awscli-bundle folder exists (OK)"
else
    echo -e "INIT\t: Installing AWS CLI... "
    pushd local
    curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"
    unzip awscli-bundle.zip
    popd
fi

echo -e "INIT\t: $0 END: `date`"
