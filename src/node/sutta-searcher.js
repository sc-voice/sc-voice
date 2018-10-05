(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        logger,
    } = require('rest-bundle');
    const Words = require('./words');
    const SuttaCentralApi = require('./sutta-central-api');
    const SuttaFactory = require('./sutta-factory');

    class SuttaSearcher {
        constructor(opts={}) {
            this.words = opts.words || new Words();
            this.suttaWords = {};
        }

        initialize() {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var suttaCentralApi = new SuttaCentralApi();
                    that.factory = await new SuttaFactory({
                        suttaCentralApi,
                    }).initialize();
                    resolve(that);
                } catch(e) {reject(e);} })();
            });
        }

        wordCount(sutta_uid, lang='en') {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var wc = that.suttaWords[sutta_uid];
                    if (wc == null) {
                        var words = that.words;
                        var sutta = await that.factory.loadSutta(sutta_uid);
                        that.suttaWords[sutta_uid] = wc = {};
                        sutta.segments.forEach(seg => {
                            words.tokenize(seg[lang]).forEach(t => {
                                t = t.toLowerCase(t);
                                if (words.isWord(t)) {
                                    wc[t] = 1 + (wc[t] || 0);
                                }
                            });
                        });
                    }
                    resolve(wc);
                } catch(e) {reject(e);} })();
            });
        }
    }

    module.exports = exports.SuttaSearcher = SuttaSearcher;
})(typeof exports === "object" ? exports : (exports = {}));

