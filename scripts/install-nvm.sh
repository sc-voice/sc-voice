#!/bin/bash

# Nodejs must be installed globally (avoid nvm)
OLD_NODE=10.21
nodejs --version |& grep $OLD_NODE >& /dev/null
RC=$?; if [ "$RC" == "0" ]; then
  echo -e "INIT\t: uninstalling nodejs $OLD_NODE"
  sudo apt-get remove -y nodejs 
else
  echo -e "INIT\t: no legacy nodejs found (OK)"
fi

NODE_VER=14.15
nodejs --version |& grep $NODE_VER >& /dev/null
RC=$?; if [ "$RC" == "0" ]; then
  echo -e "INIT\t: nodejs $NODE_VER installed"
else
  echo -e "INIT\t: installing nodejs $NODE_VER"
  curl -sL https://deb.nodesource.com/setup_14.x | tee node_setup_14.x | sudo bash -
  sudo apt -y install nodejs
  #nvm install $NODE_VER
  #nvm use $NODE_VER
  #sudo nvm use $NODE_VER
fi

