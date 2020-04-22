# sc-voice

Javascript implemenation of SuttaCentral Voice Assistance (SC-Voice) for vision-impaired. Includes:

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
git clone https://github.com/sc-karl/sc-voice.git
cd sc-voice
./scripts/init.sh
./scripts/update-latest
```
As part of installation you will need to configure one TTS service adapter.

##### Configure Amazon AWS Polly (recommended)
The [Amazon AWS Polly Text-to-Speech](https://aws.amazon.com/polly/) service can be used to convert sutta text to speech.
To enable AWS Polly, you will need to [configure your credentials](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-nodejs.html#getting-started-nodejs-credentials)

```
aws configure
```

##### Configure Watson (optional)
The [IBM Watson Text-to-Speech API](https://www.ibm.com/watson/services/text-to-speech/)
can be used to convert sutta text to speech. To use Watson, you will need an IBM Cloud Watson account.
To enable Watson translation, first copy your Watson JSON credentials, then
do the following:

1. `cat > local/watson-credentials.json`
1. _paste credentials_
1. ENTER
1. CTRL-D

##### Service installation
SC-Voice can be installed as a **systemd** service that will be launched at boot. For example, in Ubuntu 16.04 you can type the following from a console window in the `sc-voice` folder:

```bash
./scripts/sc-voice-daemon.sh
```

Restart server to launch SC-Voice.

### Unit tests
```
npm run test
```
Unit tests take about 2 minutes.
The unit tests require AWS Polly. 
Tests for IBM Watson are disabled by default (see `test/watson.js`). 

To execute a single unit/test, simply insert the text `TESTTEST`
into the `it("...")` title argument. Then run `npm run test:test`, 
which selectively tests such unit tests whenever a source file changes. 
This makes quick work of debugging or implementing a feature.

##### Test failures
* Some tests validate online APIs and may fail due to timeouts 
or `EAI_AGAIN` responses. Re-run tests and they should pass.
* Some tests validate online content which may change. For example, the number of search results may change slightly. Update the unit tests accordingly and re-run tests.

### Scripts

 | Command line script | Description |
 | :----- | :---------- |
 | `npm run test`  | Run service unit tests (about 2 minutes). |
 | `npm run serve` | Compile and reload SC-Voice Vue for development at http://localhost:8080 |
 | `npm run build` | Create production Vue build in `dist` folder |
 | `npm run lint`  | Run esLint to check *.js and *.vue files `|


### Other
#### Directory structure

* **src** contains Javascript source code
* **test** contains Javascript unit tests
* **scripts** contains miscellaneous scripts
* **local** contains local content not archived in git
* **public** Vue/Vuetify public HTML assets
* **words** contains language lexicons for search and speech.

