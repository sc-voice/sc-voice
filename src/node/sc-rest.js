(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const http = require('http');
    const winston = require('winston');
    const Words = require('./words');
    const Sutta = require('./sutta');
    const EXPANSION_PATH = path.join(__dirname, '..', '..', 'local', 'expansion.json');
    var expansion = [{}];

    class SCRest {
        constructor(opts={}) {
            var that = this;
            this.language = opts.language;
            this.translator = opts.translator;
            this.expansion = opts.expansion || [{}];
            this.initialized = false;
        }

        static loadJson(url) {
            return new Promise((resolve, reject) => { try {
                var req = http.get(url, res => {
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
                        winston.error(e.stack);
                        reject(error);
                        return;
                    }

                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => { rawData += chunk; });
                    res.on('end', () => {
                        try {
                            var result = JSON.parse(rawData);
                            winston.info(`${url} => HTTP200`);
                            resolve(result);
                        } catch (e) {
                            winston.error(e.stack);
                            reject(e);
                        }
                    });
                }).on('error', (e) => {
                    reject(e);
                }).on('timeout', (e) => {
                    winston.error(e.stack);
                    req.abort();
                });
            } catch(e) {reject(e);} });
        }

        static loadExpansion() {
            if (fs.existsSync(EXPANSION_PATH)) {
                try {
                    var expansion = JSON.parse(fs.readFileSync(EXPANSION_PATH));
                    return Promise.resolve(expansion);
                } catch(e) {
                    return Promise.reject(e);
                }
            } else {
                return new Promise((resolve, reject) => {
                    var url = `http://suttacentral.net/api/expansion`;
                    SCRest.loadJson(url).then(res => {
                        fs.writeFileSync(EXPANSION_PATH, JSON.stringify(res,null,2));
                        resolve(res);
                    }).catch(e => reject(e));
                });
            }
        }

        initialize() {
            return new Promise((resolve,reject) => { try {
                SCRest.loadExpansion().then(res => {
                    this.expansion = res;
                    this.initialized = true;
                    resolve(this);
                }).catch(e => reject(e));
            } catch(e) {reject(e);} });
        }

        expand(abbr) {
            if (!this.initialized) {
                throw new Error('initialize() must be called');
            }
            return this.expansion[0][abbr];
        }

        suttaFromApiText(apiJson) {
            if (!this.initialized) {
                throw new Error('initialize() must be called');
            }
            var translation = apiJson.translation;
            var html = translation.text;
            var resultAside = (/<aside/um).exec(html);
            if (resultAside) {
                let start = html.indexOf('>', resultAside.index)+1;
                let end = html.indexOf('</aside', start);
                var metaarea = html.substring(start, end);
                let reAside = new RegExp('<aside[^]*</aside>', 'gum');
                html = html.replace(reAside, '');
            } else {
                var metaArea = '';
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
            var that = this;
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
                var language = opts.language || that.language;
                var translator = opts.translator || that.translator;
                var request = `http://suttacentral.net/api/suttas/${scid}`;
                if (translator) {
                    request += `/${translator}`;
                }
                request += `?lang=${language}`;
                winston.info(request);

                (async function(){ try {
                    var result = await SCRest.loadJson(request);
                    var suttaplex = result.suttaplex;
                    var translations = suttaplex && suttaplex.translations;
                    if (translations && language) {
                        suttaplex.translations = translations.filter(t => t.lang === language);
                    }
                    var translation = result.translation;
                    if (translation) {
                        if (translation.text) {
                            resolve(that.suttaFromApiText(result));
                        } else {
                            resolve({
                                segments: translation.segments,
                            });
                        }
                    }

                    // no unique translation 
                    result.request = request;
                    resolve(result);
                } catch(e) {reject(e);} })();
            });
        }
        
    }

    module.exports = exports.SCRest = SCRest;
})(typeof exports === "object" ? exports : (exports = {}));

