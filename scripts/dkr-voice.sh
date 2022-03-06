#!/bin/bash
DIR=`dirname $0`
SCRIPT=`basename -s .sh $0`
LOGDIR=$DIR/../local/logs
mkdir -p $LOGDIR
LOG=$LOGDIR/$SCRIPT.log
CONTAINER=sc-voice/$SCRIPT
rm -f $LOG
echo -e "$SCRIPT\t: BEGIN `date`" |& tee -a $LOG
echo -e "$SCRIPT\t: build Debian/Node container $CONTAINER" |& tee -a $LOG

docker build -t $CONTAINER -f $DIR/$SCRIPT.dkr $DIR/.. |& tee -a $LOG

echo -e "$SCRIPT\t: END `date`" |& tee -a $LOG
