(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        logger,
    } = require('rest-bundle');
    const Words = require('./words');
    const SuttaCentralApi = require('./sutta-central-api');
    const SuttaFactory = require('./sutta-factory');
    const ROOT = path.join(__dirname, '..', '..', 'local', 'suttas');
    const COLLECTIONS = {
        an: {
            folder: 'an',
            groups: [
                627, 479, 352, 304, 1152,
                170, 645, 148, 113, 267,
                1151,
                ],
        },
        mn: {
            folder: 'mn',
            groups: [152],
        },
        dn: {
            folder: 'dn',
            groups: [34],
        },
        sn: {
            folder: 'sn',
            groups: [
                81, 30, 25, 25, 10,
                15, 22, 12, 14, 12, // 10
                25, 93, 11, 39, 20,
                13, 43, 22, 21, 12,// 20
                12, 159, 46, 96, 10,
                10, 10, 10, 50, 46,// 30
                112, 57, 55, 55, 248,
                31, 34, 16, 16, 11,// 40
                10, 13, 44, 11, 180,
                184, 104, 178, 54, 108, // 50
                86, 24, 54, 20, 74, 
                131,
            ],
        },
        thig: {
            folder: 'kn',
            groups: [
                18, 10, 8, 1, 12, 
                8, 3, 1, 1, 1, 
                1, 1, 5, 1, 1, 
                1],
        },
        thag: {
            folder: 'kn',
            groups: [
                120, 49, 16, 12, 12, 
                14, 5, 3, 1, 7,
                1, 2, 1, 2, 2,
                10, 3, 1, 1, 1,
                1],
        }
    }


    class SuttaStore {
        constructor(opts={}) {
            this.suttaCentralApi = opts.suttaCentralApi || new SuttaCentralApi();
            this.suttaFactory = opts.suttaFactory || new SuttaFactory({
                suttaCentralApi: this.suttaCentralApi,
            });
            this.root = opts.root || ROOT;
        }

        initialize() {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    await that.suttaFactory.initialize();
                    if (!fs.existsSync(that.root)) {
                        fs.mkdirSync(that.root);
                    }
                    resolve(that);
                } catch(e) {reject(e);} })();
            });
        }

        suttaFolder(sutta_uid) {
            var group = sutta_uid.replace(/[^a-z]*/gu,'');
            var folder = Object.keys(COLLECTIONS).reduce((acc,key) => {
                var c = COLLECTIONS[key];
                return acc || c.folder===group && c.folder;
            }, null);
            if (!folder) {
                throw new Error(`unsupported sutta: ${sutta_uid}`);
            }
            var fpath = path.join(this.root, folder);
            if (!fs.existsSync(fpath)) {
                logger.info(`creating folder ${fpath}`);
                fs.mkdirSync(fpath);
            }
            return fpath;
        }

        suttaPath(...args) {
            if (typeof args[0] === 'string') {
                var opts = {
                    sutta_uid: args[0],
                    language: args[1],
                    author_uid: args[2],
                }
            } else {
                var opts = args[0];
            }
            var sutta_uid = this.suttaCentralApi.normalizeSuttaId(opts.sutta_uid);
            if (!sutta_uid) {
                throw new Error('sutta_uid is required');
            }
            var folder = this.suttaFolder(sutta_uid);
            var language = opts.language || 'en';
            var langPath = path.join(folder, language);
            if (!fs.existsSync(langPath)) {
                fs.mkdirSync(langPath);
            }
            var author_uid = opts.author_uid;
            if (!author_uid) {
                throw new Error('author_uid is required');
            }
            var authorPath = path.join(langPath, author_uid);
            if (!fs.existsSync(authorPath)) {
                fs.mkdirSync(authorPath);
            }
            return path.join(authorPath, `${sutta_uid}.json`);
        }

    }

    module.exports = exports.SuttaStore = SuttaStore;
})(typeof exports === "object" ? exports : (exports = {}));

