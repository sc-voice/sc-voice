#!/bin/bash

echo -e "INIT\t: $0 START: `date`"

SCRIPT_DIR=`realpath \`dirname $0\``

echo -e "INIT\t: updating apt"
sudo apt update -y
sudo apt upgrade -y

export DEBIAN_FRONTEND=noninteractive

function installApp() {
  APP=$1
  INST=$2
  if [ "$INST" == "" ]; then INST=$APP; fi
  type $APP >& /dev/null
  RC=$?; if [ "$RC" == "0" ]; then
      echo -e "INIT\t:" `type $APP`
  else
      echo -e "INIT\t: installing $APP (sudo)"
      sudo apt-get install -y $INST
  fi
}

function installLibDev() {
  LIB=$1
  MSG=`sudo ldconfig -p | grep $LIB.so`;
  RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: $MSG (OK)"
  else
    echo -e "INIT\t: installing $LIB-dev"
    sudo apt-get install -y $LIB-dev
  fi
}


installApp unzip
installApp make build-essential

$SCRIPT_DIR/update-node.sh

MSG=`vue --version 2>&1`; RC=$?
if [ "$RC" == "0" ]; then 
  echo -e "INIT\t: vue $MSG (OK)"
else
  echo -e "INIT\t: installing @vue/cli"
  sudo npm install -g @vue/cli
fi

installApp opusenc opus-tools
installApp ffmpeg

if [ -e node_modules ]; then
    echo -e "INIT\t: node_modules exist (OK)"
else
    echo -e "INIT\t: npm install..."
    npm install
fi

echo -e "INIT\t: $0 END: `date`"
