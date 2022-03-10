This document describes how to set up Voice on a new Linode server.

### Set up a Linode account
You will need a Linode account,
which will require a credit card for any expenses that you incur.
Be very aware of what you do with Linode. It is the candy store of temptation.
Your credit card will be charged. 
Monitor your usage constantly and set up appropriate notifications 
so that you can curtail or adjust use before incurring unwanted charges.

### Create Linode Server (Staging)
Linode servers are billed whether they are online or not.
By creating a Linode server, you are subscribing and will 
pay for your new Linoder server.

| Parameter | Value |
| :---- | :---- |
| Distribution | Debian 10 |
| Region | Newark |
| Linode Plan | Shared CPU; Nanode 1GB |
| Linode Label | scv-s1 |
| Tags | Staging |
| Root password | _a-password_ |
| SSH key | _a-public-key_ |

Verify cost (5USD/month) and push </kbd>Create Linode</kbd>.

| Image |
| ----- |
| <a href="https://raw.githubusercontent.com/sc-voice/sc-voice/master/src/assets/linode-staging.png?raw=true"><img src="https://raw.githubusercontent.com/sc-voice/sc-voice/master/src/assets/linode-staging.png?raw=true" width=400px></a>


##### UNDER CONSTRUCTION


### Install Voice Server

Connect to your instance using your previously downloaded ssh certificate:

```bash
ssh -i ~/.aws/sabbamitta-ssh2.pem ubuntu@MY_NEW_AWS_SERVER_IP
```

This should open up an ssh connection to your new AWS server.


### Install Voice on Server

Connect to AWS server using `ssh` and install Voice.

```bash
sudo chown -R $(whoami):$(whoami) ~
git clone https://github.com/sc-voice/sc-voice.git
cd sc-voice
sudo chown -R $(whoami):$(whoami) .
./scripts/init.sh
sudo chown -R $(whoami):$(whoami) .
```

Update Voice but *do not reboot*:
```bash
./scripts/update-latest
```

Launch Voice in HTTP mode for port 80

```bash
sudo npm start
```

Verify that Voice is running by using a browser to view the public IP of the
AWS server. Don't press any buttons (e.g., audio won't work)
The HTTP port 80 Voice server is temporary. 
We are just using it to verify that Voice can run on the AWS server. 

After verifying that Voice functions as expected on HTTP port 80,
we will need to shut down the HTTP port 80 server 

```bash
CTRL-C
sudo chown -R $(whoami):$(whoami) * .*
```

We'll now return to your own machine to upload ssl certifate...

```
exit
```

### Install SSL Certificate

Open up SuttaCentral Discuss&Discover to get the SSL Certificate:

1. Click the Search icon
1. Select the `search messages` checkbox
1. Enter `Voice Admin` and press Enter

```
scp -i ~/.aws/sabbamitta-ssh2.pem voice-ssl.tar.gz ubuntu@MY_NEW_AWS_SERVER_IP:sc-voice/local
```

##### Connect to your AWS server to install the SSL certificate

```
ssh -i ~/.aws/sabbamitta-ssh2.pem ubuntu@MY_NEW_AWS_SERVER_IP
cd sc-voice/local
gunzip voice-ssl.tar.gz
tar -xvf voice-ssl.tar
```

##### Now install daemon and reboot.

```bash
cd ../
./scripts/sc-voice-daemon.sh
sudo shutdown -r now
```

##### Add AWS credentials
Voice uses AWS services which require authentication.
Once the Voice server has rebooted, you will need to 
add AWS credentials by logging in as <kbd>admin</kbd>.

* Click on the VSM tab 
* Click <kbd>Edit Credentials</kbd>
* Enter your Access Key Identifier
* Enter your Secret Access Key
* Click <kbd>Save</kbd>

### Public Static IP
Every time an AWS EC2 server is restarted, it will be given a new public IP.
Generally speaking, it is important to have a public static IP available at all times.
DNS mapping requires that SuttaCentral be able to map a
fully qualified name such as `staging.voice.suttacentral.net` to a specific static IP.

Every AWS account is allowed one free Elastic IP (i.e., static public IP) that is mapped
to an AWS EC2 **running instance**. Note that "running" is critical here.
You will be charged for having a static IP that is not in use.


<a href="https://raw.githubusercontent.com/sc-voice/sc-voice/master/src/assets/aws-static-ip.png?raw=true">
<img src="https://raw.githubusercontent.com/sc-voice/sc-voice/master/src/assets/aws-static-ip.png?raw=true">
</a>

To practice Elastic IP setup, do the following:

* Allocate New Address (under Network & Security > Elastic IPs)
* Associate that address with your running EC2 instance
* Verify that Voice is available on the new static IP
* Delete your Elastic IP ("Release address") when you shut down your running EC2 instance unless it is referenced by SuttaCentral itself.


