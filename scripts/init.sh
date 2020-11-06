#!/bin/bash

echo -e "INIT\t: $0 START: `date`"

SCRIPT_DIR=`realpath \`dirname $0\``

sudo apt-get update -y
sudo apt-get upgrade -y

type unzip
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: unzip detected (OK)"
else
    echo -e "INIT\t: installing unzip (requires sudo)"
    sudo apt-get install -y unzip
fi

type make
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: build-essentials detected (OK)"
else
    echo -e "INIT\t: installing build-essentials (requires sudo)"
    sudo apt-get install -y build-essential
fi

type npm
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: npm detected (OK)"
else
    echo -e "INIT\t: installing npm (requires sudo)"
    curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

sudo getcap -v `which node` | grep net_bind_service
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: node can run on port 80 (OK)"
else
    echo -e "INIT\t: changing capability of node to run on port 80"
    sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``
fi

type vue
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: vue detected (OK)"
else
    echo -e "INIT\t: installing vue (requires sudo)"
    sudo npm install -g @vue/cli
fi

type mocha
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: mocha detected (OK)"
else
    echo -e "INIT\t: installing mocha (requires sudo)"
    sudo npm install -g -y mocha
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
    $SCRIPT_DIR/install-aws.sh
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
    if [ -e local/sc/.git ]; then
        echo -e "INIT\t: SuttaCentral/translation folder local/sc exists (OK)"
    else
        echo -e "INIT\t: removing legacy SuttaCentral/translation folder "
        rm -rf local/sc
    fi
fi
if [ ! -e local/sc ]; then
    pushd local
    echo -e "INIT\t: loading SuttaCentral translation content..."
    git clone https://github.com/suttacentral/translation sc
    popd
fi

#//////////////////// DEPRECATED (BEGIN)
if [ -e local/suttas ]; then
    if [ -e local/suttas/.git ]; then
        echo -e "INIT\t: SuttaCentral/translation folder local/suttas exists (OK)"
    else
        echo -e "INIT\t: removing legacy SuttaCentral/translation folder "
        rm -rf local/suttas
    fi
fi
if [ ! -e local/suttas ]; then
    pushd local
    echo -e "INIT\t: loading SuttaCentral translation content..."
    git clone https://github.com/suttacentral/translation suttas
    popd
fi
#//////////////////// DEPRECATED (END)

#if [ -e local/awscli-bundle ]; then
    #echo -e "INIT\t: awscli-bundle folder exists (OK)"
#else
    #echo -e "INIT\t: Installing AWS CLI... "
    #pushd local
    #curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"
    #unzip awscli-bundle.zip
    #popd
#fi

echo -e "INIT\t: $0 END: `date`"
