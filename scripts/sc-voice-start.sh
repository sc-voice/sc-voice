#!/bin/bash

SCRIPT_DIR=`realpath \`dirname $0\``
echo $SCRIPT_DIR
APP_DIR=`realpath $SCRIPT_DIR/..`

mkdir -p ${APP_DIR}/local/logs
TS=`date +%Y%m%d.%H%M%S`
LOGFILE="${APP_DIR}/local/logs/scv-${TS}.log"
SCVLOG="${APP_DIR}/local/scv.log" 
rm -f $SCVLOG
ln -sf ${LOGFILE} $SCVLOG
echo -e "`date` START sc-voice" | tee -a ${LOGFILE}

${SCRIPT_DIR}/sc-voice.js 2>&1 | tee -a ${LOGFILE}

echo -e "`date` EXIT sc-voice" | tee -a ${LOGFILE}

