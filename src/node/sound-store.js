(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const { execSync } = require('child_process');
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
            that.audioSuffix = opts.audioSuffix;
            that.audioFormat = opts.audioFormat;
            that.audioMIME = opts.audioMIME;

            // every minute, delete ephemerals older than 5 minutes
            that.ephemerals = {};
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
            if (opts.audioFormat === 'ogg') {
                var audioSuffix = '.ogg';
                var audioFormat = 'ogg_vorbis';
                var audioMIME = 'audio/ogg';
            } else if (opts.audioFormat == null || opts.audioFormat === 'mp3') {
                var audioSuffix = '.mp3';
                var audioFormat = 'mp3';
                var audioMIME = 'audio/mp3';
            } else {
                throw new Error(`unsupported audioFormat:${opts.audioFormat}`);
            }
            return Object.assign({}, {
                type: 'SoundStore',
                storeName: 'sounds',
                storePath: PATH_SOUNDS,
                suffix: audioSuffix,
            }, opts, {
                audioFormat,
                audioSuffix,
                audioMIME,
            });
        }

        addEphemeral(guid) {
            this.ephemerals[guid] = Date.now();
        }

        clearEphemerals(opts={}) {
            var ctime = opts.ctime || Date.now();
            var suffixes = opts.suffixes || this.suffixes;
            var ephemerals = {};
            Object.keys(this.ephemerals).forEach(guid => {
                suffixes.forEach(suffix => {
                    var fpath = this.guidPath(guid, suffix);
                    if (fs.existsSync(fpath)) {
                        var fstat = fs.statSync(fpath);
                        if (fstat.ctime <= ctime) {
                            fs.unlinkSync(fpath);
                            logger.info(`clearEphemerals unlinkSync:${fpath}`);
                        } else if (ephemerals[guid] == null) {
                            ephemerals[guid] = Date.now();
                        } 
                    }
                });
            });
            this.ephemerals = ephemerals;
        }

        volumeInfo() {
            var execOpts = {
                cwd: this.storePath,
            };
            logger.info(`volumeInfo execOpts:${JSON.stringify(execOpts)}`);
            var cmd = `du -sb *`;
            var du = execSync(cmd, execOpts).toString().trim().split('\n');
            return du.reduce((acc, line) => {
                var lineParts = line.split('\t');
                acc[lineParts[1]] = {
                    name: lineParts[1],
                    size: Number(lineParts[0]),
                };
                return acc;
            }, {});
        }

        clearVolume(volume) {
            var that = this;
            var context = `SoundStore.clearVolume()`;
            var volpath = path.join(this.storePath, volume+"");
            if (!fs.existsSync(volpath)) {
                var e = new Error(`${context} no volume:${volume}`);
                logger.warn(e);
                return Promise.reject(e);
            }
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var files = [];
                    fs.readdirSync(volpath).forEach(d => {
                        var dpath = path.join(volpath, d);
                        var dfiles = fs.readdirSync(dpath)
                            .map(f=>path.join(dpath,f));
                        dfiles.forEach(df => files.push(df));
                    });
                    files.forEach(f => fs.unlinkSync(f));
                    var result = {
                       filesDeleted: files.length,
                    };
                    resolve(result);
                } catch(e) {reject(e);} })();
            });
        }

    }

    module.exports = exports.SoundStore = SoundStore;
})(typeof exports === "object" ? exports : (exports = {}));

