#!/bin/bash

SCRIPT_DIR=`dirname $0`
echo $SCRIPT_DIR
APP_DIR=`realpath $SCRIPT_DIR`

pushd $APP_DIR
mkdir -p local/logs
TS=`date +%Y%m%d.%H%M%S`
LOGFILE="${APP_DIR}/local/logs/scv-${TS}.log"
rm -f "local/scv.log"
ln -sf ${LOGFILE} "${APP_DIR}/local/scv.log"

npm start 2>&1 | tee -a ${LOGFILE}

popd

