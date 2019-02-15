(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        logger,
    } = require('rest-bundle');
    const GuidStore = require('./guid-store');
    const PATH_SOUNDS = path.join(__dirname, '../../local/sounds');
    const MS_MINUTES = 60 * 1000;

    class SoundStore extends GuidStore { 
        constructor(opts) {
            super((opts = SoundStore.options(opts)));
            var that = this;
            logger.info(`SoundStore.ctor(${that.storePath})`);
            that.audioFormat = opts.audioFormat || 'mp3';
            if (that.audioFormat === 'ogg') {
                that.audioSuffix = '.ogg';
                that.audioFormat = 'ogg_vorbis';
                that.audioMIME = 'audio/ogg';
            } else if (that.audioFormat === 'mp3') {
                that.audioSuffix = '.mp3';
                that.audioFormat = 'mp3';
                that.audioMIME = 'audio/mp3';
            } else {
                throw new Error(`unsupported audioFormat:${opts.audioFormat}`);
            }

            // every minute, delete ephemerals older than 5 minutes
            that.ephemerals = [];
            that.ephemeralAge = opts.ephemeralAge || 5*MS_MINUTES;
            that.ephemeralInterval = opts.ephemeralInterval || 1*MS_MINUTES;
            that.ephemeralInterval && setInterval(() => {
                var ctime = new Date(Date.now() - that.ephemeralAge);
                that.clearEphemerals({
                    ctime,
                });
            }, that.ephemeralInterval);
            that.suffixes = opts.suffixes || [that.audioSuffix, '.json', '.txt', '.ssml'];
        }

        static options(opts={}) {
            return Object.assign({}, {
                type: 'SoundStore',
                storeName: 'sounds',
                storePath: PATH_SOUNDS,
                suffix: this.audioSuffix,
            }, opts);
        }

        guidPath(...args) {
            var guid = args[0];
            var opts = args[1] || {};
            if (typeof opts === 'string') {
                opts = {
                    suffix: opts,
                };
            }
            opts.suffix = opts.suffix || this.audioSuffix;
            return super.guidPath(guid, opts);
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
                    if (fs.existsSync(fpath)) {
                        var fstat = fs.statSync(fpath);
                        if (fstat.ctime <= ctime) {
                            fs.unlinkSync(fpath);
                            logger.info(`clearEphemerals unlinkSync:${fpath}`);
                        } else if (ephemerals[ephemerals.length-1] !== guid) {
                            ephemerals.push(guid);
                        } 
                    }
                });
            });
            this.ephemerals = ephemerals;
        }

    }

    module.exports = exports.SoundStore = SoundStore;
})(typeof exports === "object" ? exports : (exports = {}));

