#!/bin/bash

SCRIPT=`basename $0`
echo -e "[$SCRIPT] $0 START: `date`"

SCRIPT_DIR=`realpath \`dirname $0\``

echo -e "[$SCRIPT] updating apt"
sudo apt update -y
sudo apt upgrade -y

function installApp() {
  APP=$1
  INST=$2
  if [ "$INST" == "" ]; then INST=$APP; fi
  type $APP >& /dev/null
  RC=$?; if [ "$RC" == "0" ]; then
      echo -e "[$SCRIPT]" `type $APP`
  else
      echo -e "[$SCRIPT] installing $APP (sudo)"
      sudo apt-get install -y $INST
  fi
}

function installLibDev() {
  LIB=$1
  MSG=`sudo ldconfig -p | grep $LIB.so`;
  RC=$?; if [ "$RC" == "0" ]; then
    echo -e "[$SCRIPT] $MSG (OK)"
  else
    echo -e "[$SCRIPT] installing $LIB-dev"
    sudo apt-get install -y $LIB-dev
  fi
}


NODE_VER=16.14
node --version |& grep $NODE_VER >& /dev/null
RC=$?; if [ "$RC" == "0" ]; then
  echo -e "[$SCRIPT] nodejs" `node --version`
else
  echo -e "[$SCRIPT] installing nodejs $NODE_VER (sudo)"
  mkdir -p local
  curl -sL https://deb.nodesource.com/setup_14.x | tee local/node_setup_14.x | sudo bash -
  npm cache clean -f
  sudo npm install -g n
  sudo n $NODE_VER
fi

sudo getcap -v `which node` | grep net_bind_service >& /dev/null
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "[$SCRIPT] node can run on port 80 (OK)"
else
    echo -e "[$SCRIPT] changing capability of node to run on port 80"
    sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``
fi

echo -e "[$SCRIPT] END: `date`"
