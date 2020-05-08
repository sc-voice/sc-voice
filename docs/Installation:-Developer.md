These are the instructions for setting up a Voice developer environment.

### Prerequisites



* Ubuntu 16.04 (Xenial Xerus), or a Linux distribution with a Ubuntu 16.04 codebase (to verify Ubuntu version: `lsb_release -a`)
* Amazon Web Services account for using AWS Polly 
* `git` version 2.7.4 or later

### Install source
Fork the [sc-voice repository](https://github.com/sc-voice/sc-voice) and clone the forked repository. 
The HTTPS way is easiest. 
The SSH way is simpler in the long term because it requires less typing of credentials.

Example:
```bash
git clone git@github.com:sc-aminah/sc-voice.git
cd sc-voice
npm install
./scripts/init.sh
```

### Configure AWS Command-Line Interface (CLI)
The `init.sh` script you ran with the initial installation installed the 
[AWS SDK for Javascript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/welcome.html).
To use it, you will need to: 
- [Configure your AWS SDK](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/configuring-the-jssdk.html) (reading the documentation in full is recommended).
   - _Set region (given in step below)_
   - [Get AWS credentials](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-your-credentials.html) 
     - Create a new user in the [IAM console](https://console.aws.amazon.com/iam/home?#home)
     - Attach the AmazonEC2FullAccess and AmazonPollyFullAccess policies to the user (or their group). _(🚩 Review best practice)_
     - Retrieve Access key ID and Secret access key.  
   - [Set your credentials in Node.js](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html)

      If running on Amazon EC2 [load from AWS IAM](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-iam.html), otherwise [load from the shared credentials file](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html).

- Install AWS Command Line Interface: `./scripts/install-aws.sh`
- Set [region](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html) and output type (json recommended): `aws configure`
- `npm run build`  

Once you have set up your Node.js credentials for AWS, you should be able to do the following to list your AWS EC2 server instances:

- `aws ec2 describe-instances` 

Even if you have no EC2 instances, the command should be successful and return:

```json
{
    "Reservations": []
}
```
(Note: if you encounter an `AWSHTTPSConnection' object has no attribute 'server_hostname'` error, see [here](https://stackoverflow.com/questions/54346551/fatal-error-awshttpsconnection-object-has-no-attribute-server-hostname) and try installing via the curl method in **`/usr/bin/aws`** not `/usr/local/bin/aws`) 

### Install sutta content

```bash
rm -rf local/suttas
./scripts/update-latest
```

### Test source
Once the software is completely installed and configured, the unit tests should complete successfully.

- `npm test`


### Launch Voice

- `npm start`

This launches the primary web server which calls AWS. It is for working on for caching, searching suttas, TTS, etc. 
Changes made to UI files after the server starts will not be shown.
Note the HTTP port for testing (normally it is 80).


### Develop Voice UI
If only client UI changes are being made, it is possible to launch the Vue development web server:

- `npm run dev`

This launches the secondary web server which is only useful for developing HTML code for the browser; all the UI Vue and Vuetify stuff.
Changes made to UI files will be shown almost instantly in the browser.
Note the HTTP port for testing (normally it is 8080).

Have fun! :grinning:
