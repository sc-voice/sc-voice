#!/bin/bash

SCRIPT_DIR=`realpath \`dirname $0\``
echo $SCRIPT_DIR
APP_DIR=`realpath $SCRIPT_DIR/..`
SCVLOG="${APP_DIR}/local/scv.log" 

echo -e "`date` STOP sc-voice service" | tee -a ${SCVLOG}
killall -g -r sc-voice 
