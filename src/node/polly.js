
(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const AbstractTTS = require('./abstract-tts');
    const { SayAgain } = require('say-again');
    const LOCAL_DIR = path.join(__dirname, '..', '..', 'local');
    const AWS_CFG_PATH = path.join(LOCAL_DIR, 'vsm-s3.json');
    const AWS = require("aws-sdk");
    const { logger } = require('log-instance');

    class Polly extends AbstractTTS {
        constructor(opts={}) {
            super(Object.assign({
                audioFormat: 'mp3', // iPhone does not support OGG
                audioSuffix: '.mp3', // iPhone does not support OGG
                language: 'en-GB', // Amy
            }, opts));
            this.voice = opts.voice || 'Amy';
            this.api = opts.api || 'aws-polly';
            this.apiVersion = opts.apiVersion || 'v4';
            let sayAgain = this.sayAgain = opts.sayAgain || new SayAgain({
                configPath: AWS_CFG_PATH,
            });
            if (this.sayAgain == null) {
                throw new Error(`DEPRECATED: sayAgain is required`);
            }
            this.region = opts.region || 'us-west-1';
            this.pollyConfig = opts.config || {
                signatureVersion: this.apiVersion,
                apiVersion: '2016-06-10',
                region: this.region,
            };
            opts.prosody == null && (this.prosody.rate = "-20%");
            if (opts.polly) {
                this.polly = opts.polly;
            } else {
                var cfg = this.pollyConfig;
                this.polly = new AWS.Polly(cfg);
            }
        }

        serviceSynthesize(resolve, reject, request) {
            var that = this;
            (async function() { try {
                var {
                    polly,
                    sayAgain,
                } = that;
                const USE_SAY_AGAIN = true;
                if (USE_SAY_AGAIN && sayAgain) { 
                    var req = Object.assign({}, request.signature);
                    delete req.volume;
                    var outpath = request.outpath+".sayagain";
                    var res = await sayAgain.speak(req);
                    var { base64, mime } = res.response;
                    var buf = Buffer.from(base64, "base64");
                    var resWrite = await fs.promises.writeFile(request.outpath, buf);
                    that.synthesizeResponse(resolve, reject, request);
                } else { // DEPRECATED: call AWS Polly directly
                    logger.warn(`DEPRECATED:`,
                        `serviceSynthesize without sayAgain is no longer supported`);
                    var params = {
                        Text:`<speak>${request.ssml}</speak>`,
                        TextType: 'ssml',
                        OutputFormat: that.audioFormat,
                        VoiceId: that.voice,
                        LanguageCode: that.language,
                    }
                    that.log(`serviceSynthesize() ${JSON.stringify(params)} ${request.outpath}`);
                    polly.synthesizeSpeech(params, (err, data) => {
                        if (err) {
                            that.warn(`serviceSynthesize()`, 
                                request, err.stack)
                            reject(err);
                        } else if (data == null) {
                            var err = new Error(
                                "(no data returned from AWS server)");
                            that.warn(err.stack)
                            reject(err);
                        } else if (data.AudioStream instanceof Buffer) {
                            fs.writeFile(request.outpath, 
                                data.AudioStream, function(err) {
                                if (err) {
                                    that.warn(err)
                                    reject(err);
                                } else {
                                    that.synthesizeResponse(resolve, reject, request);
                                }
                            })
                        } else {
                            var err = new warn([`synthesizeSpeech()`,
                                `expected:Buffer actual:${typeof data.AudioStream}`,
                            ].join(' '));
                            that.warn(err.stack)
                            reject(err);
                        }
                    })
                }
            } catch(e) { 
                that.warn(e.message);
                reject(e);
            }})();
        }
    }

    module.exports = exports.Polly = Polly;
})(typeof exports === "object" ? exports : (exports = {}));

