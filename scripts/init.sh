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

# TODO: Ubuntu 20.04 nodegit pre-requisites?
#installLibDev libssl
#installLibDev libpcre
#installLibDev libpcreposix
#installLibDev libkrb5
#installLibDev libk5crypto
#installLibDev libcom_err
#installApp krb5-config
#installApp pcre-config libpcre3-dev

NODE_VER=14.15
node --version |& grep $NODE_VER >& /dev/null
RC=$?; if [ "$RC" == "0" ]; then
  echo -e "INIT\t: nodejs" `node --version`
else
  echo -e "INIT\t: installing nodejs $NODE_VER (sudo)"
  mkdir -p local
  curl -sL https://deb.nodesource.com/setup_14.x | tee local/node_setup_14.x | sudo bash -
  sudo apt -y install nodejs
  #nvm install $NODE_VER
  #nvm use $NODE_VER
  #sudo nvm use $NODE_VER
fi

sudo getcap -v `which node` | grep net_bind_service >& /dev/null
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INIT\t: node can run on port 80 (OK)"
else
    echo -e "INIT\t: changing capability of node to run on port 80"
    sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``
fi

MSG=`vue --version 2>&1`; RC=$?
if [ "$RC" == "0" ]; then 
  echo -e "INIT\t: vue $MSG (OK)"
else
  echo -e "INIT\t: installing @vue/cli"
  npm install -g @vue/cli
fi

installApp opusenc opus-tools
installApp ffmpeg

#installApp python
#type aws >& /dev/null
#RC=$?; if [ "$RC" == "0" ]; then
    #echo -e "INIT\t:" `type aws`
#else
    #echo -e "INIT\t: installing aws cli ..."
    #$SCRIPT_DIR/install-aws.sh
#fi

if [ -e node_modules ]; then
    echo -e "INIT\t: node_modules exist (OK)"
else
    echo -e "INIT\t: npm install..."
    npm install
fi

echo -e "INIT\t: $0 END: `date`"
