(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const winston = require('winston');
    const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
    const AbstractTTS = require('./abstract-tts');

    class Watson extends AbstractTTS {
        constructor(opts={}) {
            super(opts);
            var credentials = opts.credentials;
            if (credentials == null) {
                var credpath = path.join(__dirname, '../local/watson/credentials.json');
                if (fs.existsSync(credpath)) {
                    credentials = JSON.parse(fs.readFileSync(credpath));
                }
            }
            this.credentials = credentials;
            this.voice = opts.voice || 'en-GB_KateVoice';
            this.prosody.pitch = "-30%";
            this.language = this.voice.split('-')[0];
            this.service_url = opts.service_url || "https://stream.watsonplatform.net/text-to-speech/api/v1";
            this.api = opts.api || 'watson/text-to-speech/v1';
        }

        get textToSpeech() {
            if (this._textToSpeech == null) {
                this._textToSpeech = new TextToSpeechV1(this.credentials);
            }
            return this._textToSpeech;
        }

        serviceSynthesize(resolve, reject, serviceParams, outpath, signature) {
            var ostream = fs.createWriteStream(outpath);
            this.textToSpeech.synthesize(serviceParams)
            .on('error', function(error) {
                console.log(`synthesize() error:`, error.stack);
                reject(error);
            })
            .on('end', () => {
                var hitPct = (100*this.hits/(this.hits+this.misses)).toFixed(1);
                var stats = fs.existsSync(outpath) && fs.statSync(outpath);
                if (stats && stats.size <= this.ERROR_SIZE) {
                    var err = fs.readFileSync(outpath).toString();
                    console.log(`synthesize() failed ${outpath}`, stats.size, err);
                    reject(new Error(err));
                }
                //console.log(`synthesize() ${outpath} cache:${cache} ${stats.size}B hits:${hitPct}%`);
                var jsonPath = this.store.signaturePath(signature, ".json");
                fs.writeFileSync(jsonPath, JSON.stringify(signature, null, 2));
                resolve({
                    file: outpath,
                    stats,
                    hits: this.hits,
                    misses: this.misses,
                    signature,
                    cached: false,
                });
            })
            .pipe(ostream);
        }
    }

    module.exports = exports.Watson = Watson;
})(typeof exports === "object" ? exports : (exports = {}));

