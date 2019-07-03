#!/bin/bash

SCRIPT_DIR=`realpath \`dirname $0\``
echo $SCRIPT_DIR
APP_DIR=`realpath $SCRIPT_DIR/..`
LOGDIR="${APP_DIR}/local/logs"
mkdir -p ${LOGDIR}
LOGFILE="${LOGDIR}/scv-%Y%m%d.log"
SCVLOG="${APP_DIR}/local/scv.log" 
rm -f $SCVLOG

${SCRIPT_DIR}/sc-voice.js --ssl 2>&1 | rotatelogs -L ${SCVLOG} -f ${LOGFILE} 86400

echo -e "`date` EXIT sc-voice" | tee -a ${SCVLOG}

