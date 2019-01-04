(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        logger,
    } = require('rest-bundle');
    const GuidStore = require('./guid-store');
    const PATH_SOUNDS = path.join(__dirname, '../../local/sounds');

    class SoundStore extends GuidStore { 
        constructor(opts) {
            super((opts = SoundStore.options(opts)));
            logger.info(`SoundStore.ctor(${this.storePath})`);
            this.audioFormat = opts.audioFormat || 'mp3';
            if (this.audioFormat === 'ogg') {
                this.audioSuffix = '.ogg';
                this.audioFormat = 'ogg_vorbis';
                this.audioMIME = 'audio/ogg';
            } else if (this.audioFormat === 'mp3') {
                this.audioSuffix = '.mp3';
                this.audioFormat = 'mp3';
                this.audioMIME = 'audio/mp3';
            } else {
                throw new Error(`unsupported audioFormat:${opts.audioFormat}`);
            }
            this.ephemerals = [];
            this.suffixes = opts.suffixes || [this.audioSuffix];
        }

        static options(opts={}) {
            return Object.assign({}, {
                type: 'SoundStore',
                storeName: 'sounds',
                storePath: PATH_SOUNDS,
                suffix: this.audioSuffix,
            }, opts);
        }

        guidPath(guid, suffix) {
            return super.guidPath(guid, suffix || this.audioSuffix);
        }

        addEphemeral(guid) {
            this.ephemerals.push(guid);
        }

        clearEphemerals(opts={}) {
            var ctime = opts.ctime || Date.now();
            var suffixes = opts.suffixes || this.suffixes;
            var ephemerals = [];
            this.ephemerals.forEach(guid => {
                suffixes.forEach(suffix => {
                    var fpath = this.guidPath(guid, suffix);
                    var fstat = fs.statSync(fpath);
                    if (fstat.ctime <= ctime) {
                        fs.unlinkSync(fpath);
                    } else if (ephemerals[ephemerals.length-1] !== guid) {
                        ephemerals.push(guid);
                    }
                });
            });
            this.ephemerals = ephemerals;
        }

    }

    module.exports = exports.SoundStore = SoundStore;
})(typeof exports === "object" ? exports : (exports = {}));

