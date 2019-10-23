#!/bin/bash
. ~/.nvm/nvm.sh
if [ "$NVM_DIR" == "" ]; then
    echo -e "INIT\t: installing nvm RC:${RC}"
    URL=https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.0/install.sh 
    curl -o- ${URL} | bash
else
    echo -e "INIT\t: nvm detected (OK)"
fi

NODE_CURVER=`node --version`
NODE_VER=10.17
echo -e "INIT\t: node version: ${NODE_CURVER}"
if [ "$NODE_CURVER" == "$NODE_VER" ]; then
    echo -e "INIT\t: node version $NODE_CURVER (ok)"
else 
    echo -e "INIT\t: installing node version $NODE_VER... "
    nvm install 10.17
fi

