# sc-voice

Javascript implemenation for SuttaCentral voice assistance for vision-impaired. Includes:

* TTS adapter for [Amazon AWS Polly Text-to-Speech](https://aws.amazon.com/polly/) 
* TTS adapter for [IBM Watson Text-to-Speech API](https://www.ibm.com/watson/services/text-to-speech/)
* utilites for parsing SuttaCentral Pootl translations
* romanized search for Pali terms (e.g., Mulapariyayasutta vs. Mūlapariyāyasutta)

### Prerequisites

* Linux (tested on Ubuntu 16.04.5 LTS/xenial)
* AWS Polly account (recommended)
* IBM Watson Text-to-Speech account (optional)

### Installation
With a Linux console, install the software:

```
git clone git@github.com:sc-karl/sc-voice.git
cd sc-voice
./scripts/init.sh
```

### Amazon AWS Polly
The [Amazon AWS Polly Text-to-Speech](https://aws.amazon.com/polly/) service can be used to convert sutta text to speech.
To enable AWS Polly, you will need to [configure your credentials](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-nodejs.html#getting-started-nodejs-credentials)

### Watson
The [IBM Watson Text-to-Speech API](https://www.ibm.com/watson/services/text-to-speech/)
can be used to convert sutta text to speech. To use Watson, you will need an IBM Cloud Watson account.
To enable Watson translation, first copy your Watson JSON credentials, then
do the following:

1. `cat > local/watson-credentials.json`
1. _paste credentials_
1. ENTER
1. CTRL-D

### Other
#### Directory structure

* **src** contains Javascript source code
* **test** contains Javascript unit tests
* **scripts** contains miscellaneous scripts
* **local** contains local content not archived in git


