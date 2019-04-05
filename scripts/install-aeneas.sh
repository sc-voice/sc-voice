#!/bin/bash

echo -e "INIT\t: $0 START: `date -Iseconds`"

SCRIPT_DIR=`realpath \`dirname $0\``

type pip > /dev/null
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: pip installed (OK)"
else
    echo -e "INIT\t: installing pip..."
    sudo apt-get install python-pip
fi

type aws > /dev/null
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: AWS SDK installed (OK)"
else
    echo -e "INIT\t: installing AWS SDK..."
    $SCRIPT_DIR/install-aws.sh
fi

type make > /dev/null
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: build-essential installed (OK)"
else
    echo -e "INIT\t: installing build-essential..."
    sudo apt-get install build-essential
fi

dpkg -s libasound2-dev | grep "installed" > /dev/null
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: libasound2-dev installed (OK)"
else
    echo -e "INIT\t: installing libasound2-dev..."
    sudo apt-get install libasound2-dev
fi

mkdir -p local
if [ -e local/portaudio ]; then
    echo -e "INIT\t: portaudio installed (OK)"
else
    echo -e "INIT\t: fetching portaudio..."
    git clone https://git.assembla.com/portaudio.git local/portaudio
fi

pushd local/portaudio > /dev/null
    if [ -e bin/patest_sine8 ]; then
        echo -e "INIT\t: portaudio built (OK)"
    else
        echo -e "INIT\t: building portaudio..."
        ./configure && make
    fi
popd > /dev/null

echo -e "INIT\t: $0 END: `date -Iseconds`"
