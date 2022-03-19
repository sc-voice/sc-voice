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
pay for your new Linode server.

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

| Screenshot: New Server |
| :----- |
| <a href="https://raw.githubusercontent.com/sc-voice/sc-voice/master/docs/assets/img/linode-staging.png?raw=true"><img src="https://raw.githubusercontent.com/sc-voice/sc-voice/master/docs/assets/img/linode-staging.png?raw=true" width=400px></a>

You will now be able to login to your new Linode server.

### Set up and Secure Linode Server

Follow the instructions to 
[set up and secure](https://www.linode.com/docs/guides/set-up-and-secure/)
your new Linode server with the following customizations

| Customization | Context | Value | Notes |
| :---- | :---- | :---- | :---- |
| Linux | all | Debian | Same as dev computer |
| hostname | staging | scv-sN | E.g.: scv-s1  |
| hostname | production | scv-pN | E.g.: scv-p1 |
| timezone | all | America/Los_Angeles | Only for dev logs |
| non-root user | all | unroot | id_pub secured dev username needed to disable root SSH login |
| firewall | all | scv-firewall | Linode Cloud firewall allow: SSH, HTTP, HTTPS |

### Install Voice On Linode Server
NOTE: Since the following uses <kbd>sudo<sudo>, 
you may wish to 
[disable sudo password entry](https://phpraxis.wordpress.com/2016/09/27/enable-sudo-without-password-in-ubuntudebian/)
for _unroot_.

```bash
suda apt install git
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
Linode server. Don't press any buttons (e.g., audio won't work)
The HTTP port 80 Voice server is temporary. 
We are just using it to verify that Voice can run on the Linode server. 


After verifying that Voice functions as expected on HTTP port 80,
we will need to shut down the HTTP port 80 server 

```bash
CTRL-C
sudo chown -R $(whoami):$(whoami) * .*
```

### Install SSL Credentials

Install the SSL credentials for _voice.suttacentral.net_ 
in _~/sc-voice/local/ssl:

* <kbd>server.crt</kbd> => ~/sc-voice/local/ssl/server.crt (CERTIFICATE)
* <kbd>server.key</kbd> => ~/sc-voice/local/ssl/server.key (PRIVATE_KEY)

##### Add AWS Credentials

Voice authentication for AWS S3 and Polly services is stored in <kbd>~/sc-voice/local/vsm-s3.json</kbd>

```
{
  "Bucket": "sc-voice-vsm",
  "s3": {
    "apiVersion": "2006-03-01",
    "endpoint": "https://s3.us-west-1.amazonaws.com",
    "region": "us-west-1"
  },
  "polly": {
    "region": "us-west-1",
    "signatureVersion": "v4",
    "apiVersion": "2016-06-10"
  },
  "sayAgain": {
    "Bucket": "say-again.sc-voice"
  },
  "region": "us-west-1",
  "secretAccessKey": "YOUR_AWS_SECRET_ACCESS_KEY",
  "accessKeyId": "YOUR_AWS_ACCESS_KEY_ID"
}
```

##### Install and Launch Voice Daemon 

Install the Voice daemon to start up when the system is rebooted.

```bash
cd ~sc-voice
./scripts/sc-voice-daemon.sh
sudo shutdown -r now
```

When the server reboots, allow several minutes for Voice to start up.


##### UNDER CONSTRUCTION

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


<a href="https://raw.githubusercontent.com/sc-voice/sc-voice/master/docs/assets/img/aws-static-ip.png?raw=true">
<img src="https://raw.githubusercontent.com/sc-voice/sc-voice/master/docs/assets/img/aws-static-ip.png?raw=true">
</a>

To practice Elastic IP setup, do the following:

* Allocate New Address (under Network & Security > Elastic IPs)
* Associate that address with your running EC2 instance
* Verify that Voice is available on the new static IP
* Delete your Elastic IP ("Release address") when you shut down your running EC2 instance unless it is referenced by SuttaCentral itself.


