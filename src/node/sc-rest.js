(function(exports) {
    const http = require('http');
    const DEFAULT_LANGUAGE = 'en';
    const DEFAULT_TRANSLATOR = 'sujato';

    class SCRest {
        constructor(opts={}) {
            this.language = opts.language || DEFAULT_LANGUAGE;
            this.translator = opts.translator;
        }

        getSutta(opts={}, ...args) {
            return new Promise((resolve, reject) => {
                if (typeof opts === 'string') {
                    opts = {
                        scid: opts,
                        language: args[0],
                        translator: args[1],
                    };
                }
                var scid = opts.scid;
                if (scid == null) {
                    throw new Error('Sutta reference identifier is required');
                }
                var language = opts.language || this.language;
                var translator = opts.translator || this.translator;
                var request = `http://suttacentral.net/api/suttas/${scid}`;
                if (translator) {
                    request += `/${translator}`;
                }
                request += `?lang=${language}`;

                var req = http.get(request, res => {
                    const { statusCode } = res;
                    const contentType = res.headers['content-type'];

                    let error;
                    if (statusCode !== 200) {
                        error = new Error('Request Failed.\n' +
                                          `Status Code: ${statusCode}`);
                    } else if (!/^application\/json/.test(contentType)) {
                        error = new Error('Invalid content-type.\n' +
                                          `Expected application/json but received ${contentType}`);
                    }
                    if (error) {
                        res.resume(); // consume response data to free up memory
                        reject(error);
                        return;
                    }

                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => { rawData += chunk; });
                    res.on('end', () => {
                        try {
                            var parsedData = JSON.parse(rawData);
                            parsedData.ip = opts.host;
                            resolve(parsedData);
                        } catch (e) {
                            reject(e);
                        }
                    });
                }).on('error', (e) => {
                    reject(e);
                }).on('timeout', (e) => {
                    req.abort();
                });
            });
        }
        
    }

    module.exports = exports.SCRest = SCRest;
})(typeof exports === "object" ? exports : (exports = {}));

