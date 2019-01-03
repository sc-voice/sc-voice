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
            logger.info(`SoundStore.ctor(${this.name})`);
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
        }

        static options(opts={}) {
            return Object.assign({}, {
                storeName: 'sounds',
                storePath: PATH_SOUNDS,
                suffix: this.audioSuffix,
            }, opts);
        }

        guidPath(guid, opts) {
            return super.guidPath(guid, opts || this.audioSuffix);
        }
    }

    module.exports = exports.SoundStore = SoundStore;
})(typeof exports === "object" ? exports : (exports = {}));

