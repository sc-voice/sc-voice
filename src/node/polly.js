
(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const winston = require('winston');
    const AbstractTTS = require('./abstract-tts');
    const AWS = require("aws-sdk");

    class Polly extends AbstractTTS {
        constructor(opts={}) {
            super(opts);
            this.voice = opts.voice || 'Amy';
            this.api = opts.api || 'aws-polly';
            this.apiVersion = opts.apiVersion || 'v4';
            this.region = opts.region || 'us-west-1';
            this.audioFormat = opts.audioFormat || 'ogg_vorbis';
            this.pollyConfig = opts.config || {
                signatureVersion: this.apiVersion,
                region: this.region,
            };
            opts.prosody == null && (this.prosody.rate = "-20%");
            this.polly = opts.polly || new AWS.Polly(this.pollyConfig);
        }

        serviceSynthesize(resolve, reject, request) {
            var that = this;
            var params = {
                Text:`<speak>${request.ssml}</speak>`,
                TextType: 'ssml',
                OutputFormat: that.audioFormat,
                VoiceId: that.voice,
            }

            that.polly.synthesizeSpeech(params, (err, data) => {

                if (err) {
                    console.error(`serviceSynthesize()`, request, err.stack)
                    reject(err);
                } else if (data == null) {
                    var err = new Error("(no data returned from AWS server)");
                    console.error(err.stack)
                    reject(err);
                } else if (data.AudioStream instanceof Buffer) {
                    fs.writeFile(request.outpath, data.AudioStream, function(err) {
                        if (err) {
                            console.error(err)
                            reject(err);
                        } else {
                            that.synthesizeResponse(resolve, reject, request);
                        }
                    })
                } else {
                    var err = new Error(`synthesizeSpeech() expected:Buffer actual:${typeof data.AudioStream}`);
                    console.error(err.stack)
                    reject(err);
                }
            })
        }
    }

    module.exports = exports.Polly = Polly;
})(typeof exports === "object" ? exports : (exports = {}));

