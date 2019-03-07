
(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        logger,
    } = require('rest-bundle');
    const AbstractTTS = require('./abstract-tts');
    const AWS = require("aws-sdk");

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
                logger.info(`Polly.ctor() new AWS.Polly(${JSON.stringify(cfg)})`);
                this.polly = new AWS.Polly(cfg);
            }
        }

        serviceSynthesize(resolve, reject, request) {
            var that = this;
            var params = {
                Text:`<speak>${request.ssml}</speak>`,
                TextType: 'ssml',
                OutputFormat: that.audioFormat,
                VoiceId: that.voice,
                LanguageCode: that.language,
            }
            logger.info(`serviceSynthesize() ${JSON.stringify(params)}`);

            that.polly.synthesizeSpeech(params, (err, data) => {

                if (err) {
                    logger.error(`serviceSynthesize()`, request, err.stack)
                    reject(err);
                } else if (data == null) {
                    var err = new Error("(no data returned from AWS server)");
                    logger.error(err.stack)
                    reject(err);
                } else if (data.AudioStream instanceof Buffer) {
                    fs.writeFile(request.outpath, data.AudioStream, function(err) {
                        if (err) {
                            logger.error(err)
                            reject(err);
                        } else {
                            that.synthesizeResponse(resolve, reject, request);
                        }
                    })
                } else {
                    var err = new Error(`synthesizeSpeech() expected:Buffer actual:${typeof data.AudioStream}`);
                    logger.error(err.stack)
                    reject(err);
                }
            })
        }
    }

    module.exports = exports.Polly = Polly;
})(typeof exports === "object" ? exports : (exports = {}));

