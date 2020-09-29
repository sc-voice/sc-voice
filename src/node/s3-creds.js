(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const { logger } = require('log-instance');
    const { GuidStore } = require('memo-again');
    const { AwsConfig, SayAgain } = require('say-again');
    const LOCAL = path.join(__dirname, '../../local');
    const VSMPATH = path.join(LOCAL, 'vsm-s3.json');

    class S3Creds { 
        constructor(opts={}) {
            var configPath = opts.configPath || VSMPATH;
            var vsmCreds = fs.existsSync(configPath)
                ? JSON.parse(fs.readFileSync(configPath))
                : {};

            var config = this.awsConfig = opts.awsConfig || new AwsConfig(vsmCreds);
            config.polly.region = config.polly.region || config.s3.region;
            config.polly.secretAccessKey = config.polly.secretAccessKey || 
                config.s3.secretAccessKey;
            config.polly.accessKeyId = config.polly.accessKeyId || 
                config.s3.accessKeyId;
            config.Bucket = config.Bucket || vsmCreds.Bucket || 'sc-voice-vsm';
            config.sayAgain.Bucket = "say-again.sc-voice";
        }

        obfuscate(s) {
            var result = "";
            for (var i = 0; i < s.length; i++) {
                result = result + (i < s.length-4 ? '*' : s[i]);
            }
            return result;
        }
            
        obfuscated() {
            var s3 = Object.assign({}, this.awsConfig.s3);
            var polly = Object.assign({}, this.awsConfig.polly);
            if (s3) {
                s3.secretAccessKey = this.obfuscate(s3.secretAccessKey);
                s3.accessKeyId = this.obfuscate(s3.accessKeyId);
            }
            if (polly) {
                polly.secretAccessKey = this.obfuscate(polly.secretAccessKey);
                polly.accessKeyId = this.obfuscate(polly.accessKeyId);
            }
            return {
                Bucket: this.awsConfig.Bucket,
                s3,
                polly,
            }
        }
    }

    module.exports = exports.S3Creds = S3Creds;
})(typeof exports === "object" ? exports : (exports = {}));

