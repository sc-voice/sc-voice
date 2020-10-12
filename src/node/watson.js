(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const { logger, } = require('log-instance');
    const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
    const AbstractTTS = require('./abstract-tts');

    class Watson extends AbstractTTS {
        constructor(opts={}) {
            super(opts);
            var credentials = opts.credentials;
            if (credentials == null) {
                var credpath = path.join(__dirname, '../../local/watson/credentials.json');
                if (fs.existsSync(credpath)) {
                    credentials = JSON.parse(fs.readFileSync(credpath));
                }
            }
            this.credentials = credentials;
            this.voice = opts.voice || 'en-GB_KateVoice';
            opts.prosody == null && (this.prosody.pitch = "-30%");
            this.apiVersion = opts.apiVersion || 'v1';
            this.api = opts.api || `watson/text-to-speech`;
        }

        get textToSpeech() {
            if (this._textToSpeech == null) {
                this._textToSpeech = new TextToSpeechV1(this.credentials);
            }
            return this._textToSpeech;
        }

        serviceSynthesize(resolve, reject, request) {
            var ostream = fs.createWriteStream(request.outpath);
            var serviceParams = {
                text: request.ssml,
                accept: request.audioFormat || this.audioFormat,
                voice: request.voice || this.voice,
            };
            this.textToSpeech.synthesize(serviceParams)
                .on('error', error => reject(error) )
                .on('end', () => this.synthesizeResponse(resolve, reject, request) )
                .pipe(ostream);
        }
    }

    module.exports = exports.Watson = Watson;
})(typeof exports === "object" ? exports : (exports = {}));

