#!/bin/bash

IP=$1
if [ "$IP" == "" ]; then
    IP=`aws ec2 describe-instances | json Reservations[0].Instances[0].PublicIpAddress`
fi

pushd local/ssl/voice
echo -e 'SSL\t: Deploying local/ssl/voice/server.crt and server.key to $IP'
scp -i ~/.aws/g-sc-polly.pem server.crt server.key ubuntu@$IP:sc-voice/local/ssl
popd
