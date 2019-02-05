#!/bin/bash
SCRIPTDIR=`dirname $0`
$SCRIPTDIR/update-sutta-store.js | tee $SCRIPTDIR/../local/update-sutta-store.log

