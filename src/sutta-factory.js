(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Words = require('./words');
    const Segments = require('./segments');
    const Sutta = require('./sutta');
    const Section = require('./section');
    const PoParser = require('./po-parser');
    const SuttaCentralId = require('./sutta-central-id');
    const RE_ELLIPSIS = new RegExp(`${Words.U_ELLIPSIS}$`);
    const OPTS_EN = {
        prop: 'en',
    };

    class SuttaFactory { 
        constructor(opts={}) {
        }

        static loadSutta(opts={}) {
            return new SuttaFactory(opts).loadSutta(opts);
        }

        loadSutta(opts={}) {
            return new Promise((resolve, reject) => {
                (async function() { try {
                    if (typeof opts === 'string') {
                        opts = {
                            id: opts,
                        }
                    }
                    var parser = new PoParser();
                    var id = opts.id || 'mn1';
                    var suttaPath = PoParser.suttaPath(id, opts.root);
                    var segDoc = await parser.parse(suttaPath, opts);
                    resolve(new Sutta(Object.assign({}, segDoc, opts)));
                } catch(e) {reject(e);} })();
            });
        }


    }

    module.exports = exports.SuttaFactory = SuttaFactory;
})(typeof exports === "object" ? exports : (exports = {}));

