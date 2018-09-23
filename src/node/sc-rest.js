(function(exports) {
    const http = require('http');
    const winston = require('winston');
    const Words = require('./words');

    class SCRest {
        constructor(opts={}) {
            this.language = opts.language;
            this.translator = opts.translator;
        }

        suttaFromApiText(apiJson) {
            var translation = apiJson.translation;
            var html = translation.text;
            var resultAside = (/<aside/um).exec(html);
            if (resultAside) {
                let start = html.indexOf('>', resultAside.index)+1;
                let end = html.indexOf('</aside', start);
                var metaarea = html.substring(start, end);
                let reAside = new RegExp('<aside[^]*</aside>', 'gum');
                console.log(`aside start:${start} end:${end} reAside:${reAside}`);
                html = html.replace(reAside, '');
                console.log(`metaarea`, metaarea);
            } else {
                var metaArea = '';
                console.log('no aside');
            }
            html = html.replace(/(.*\n)*<blockquote[^>]*>\n*/um, '');
            html = html.replace(/<\/blockquote>[^]*/um, '');
            html = html.replace(/<br>\n/gum, ' ');
            html = html.replace(/<\/p>/gum, '');
            html = html.replace(/\n( *\n)*/gum, '\n');
            html = html.replace(/\n*$/gum, '');
            var lines = html.split('\n');
            var suttaplex = apiJson.suttaplex;
            var segments = lines.map(line => {
                var tokens = line.split('</a>');
                var scid = tokens[0].replace(/.*sc/u,`${suttaplex.uid}:`).replace(/".*/u,'');
                return {
                    scid,
                    [translation.lang]: tokens[2],
                }
            });
            return Object.assign({
                metaarea,
                segments,
            }, apiJson);
        }

        loadSutta(opts={}, ...args) {
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
                                result = this.suttaFromApiText(result);
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

