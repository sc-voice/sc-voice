#!/bin/bash

echo -e "DAEMON\t: creating sc-voice systemctl daemon"

SCRIPT_DIR=`realpath \`dirname $0\``

cat <<- HEREDOC > $SCRIPT_DIR/../local/sc-voice.service
[Unit]
Description=SuttaCentral Voice Assistant
After=network.target

[Service]
User=`whoami`
Environment=
WorkingDirectory=`realpath $SCRIPT_DIR/..`
ExecStart=$SCRIPT_DIR/sc-voice-start.sh
ExecStop=$SCRIPT_DIR/sc-voice-stop.sh

[Install]
WantedBy=multi-user.target
HEREDOC
# END sc-voice.service

SERVICE_FILE=/etc/systemd/system/sc-voice.service 
if [ -e $SERVICE_FILE ]; then
    echo -e "DAEMON\t: ${SERVICE_FILE} has already been installed"
else
    echo -e "DAEMON\t: installing ${SERVICE_FILE} "
    sudo cp local/sc-voice.service ${SERVICE_FILE}
fi

sudo systemctl daemon-reload
sudo systemctl enable sc-voice
sudo systemctl start sc-voice
sudo systemctl status sc-voice
