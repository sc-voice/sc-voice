(function(exports) {
    const http = require('http');
    const winston = require('winston');
    const Words = require('./words');

    class SCRest {
        constructor(opts={}) {
            this.language = opts.language;
            this.translator = opts.translator;
        }

        linesFromHtml(html) {
            html = html.replace(/(.*\n)*<body>\n*/um, '');
            html = html.replace(/<\/body>(\n.*)*/um, '');
            html = html.replace(/<br>\n/gum, ' ');
            html = html.replace(/<aside(.*\n?)*<\/aside>/gum, ' ');
            html = html.replace(/<\/p>\n/gum, '');
            var lines = html.split('\n');
            return lines;
            return lines.map(l => Words.utf16(l));
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
                console.debug(request);
                winston.info(request);

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
                            var result = JSON.parse(rawData);
                            var suttaplex = result.suttaplex;
                            var translations = suttaplex && suttaplex.translations;
                            if (translations && language) {
                                suttaplex.translations = translations.filter(t => t.lang === language);
                            }
                            var translation = result.translation;
                            if (translation && translation.text) {
                                translation.lines = this.linesFromHtml(translation.text);
                            }
                            result.request = request;
                            resolve(result);
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

