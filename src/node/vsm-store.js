(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        logger,
    } = require('rest-bundle');
    const {
        exec,
    } = require('child_process');
    const SuttaStore = require('./sutta-store');
    const SoundStore = require('./sound-store');
    const Voice = require('./voice');
    const PATH_VSM = path.join(__dirname, '../../local/vsm');

    class VsmStore extends SoundStore {
        constructor(opts) {
            super((opts = VsmStore.options(opts)));
            logger.info(`VsmStore.ctor(${this.storePath})`);
            this.soundStore = opts.soundStore;
            this.voice = opts.voice;
            this.guidMap = {};
        }

        static options(opts={}) {
            var {
                storePath,
                storeName,
                soundStore,
                voice,
            } = opts;
            voice = voice || new Voice();
            storeName = storeName || `vsm-${voice.name.toLowerCase()}`;
            storePath = storePath || path.join(PATH_VSM, storeName);
            soundStore = soundStore || new SoundStore();

            return Object.assign({}, {
                storePath,
                storeName,
                type: "VsmStore",
                soundStore,
                voice,
            });
        }

        importGuidFiles(guid, volume) {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var srcStore = that.soundStore;
                    var pathOpts = {
                        guid,
                        volume,
                    };
                    var srcDir = path.dirname(srcStore.guidPath(pathOpts));
                    var dstDir = path.dirname(that.guidPath(pathOpts));
                    var srcFiles = path.join(srcDir, `${guid}.*`);
                    var cmd = `cp -v ${srcFiles} ${dstDir}`;
                    var cmdOpts = {};
                    var cp = exec(cmd, cmdOpts, (error, stdout, stderr) => {
                        if (error) {
                            reject(error);
                            console.log(`stderr`, stderr);
                            console.error(error.stack);
                            return;
                        }
                        var files = stdout.split('\n');
                        files = files.reduce((acc,line) => {
                            var parts = line.split(' -> ');
                            parts.length === 2 && acc.push(parts[1]);
                            return acc;
                        }, []);
                        resolve({
                            files,
                        });
                    });
                } catch(e) {reject(e);}})();
            });
        }

        import(speakResult) {
            var guid = speakResult.signature.guid;
            var result = this.guidMap[guid];
            if (result) {
                return Promise.resolve(result);
            }
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var srcStore = that.soundStore;
                    var volume = speakResult.signature.volume;
                    var guidResult = await that.importGuidFiles(guid, volume);
                    var importResult = Object.assign({}, speakResult);
                    importResult.file = importResult.file
                        .replace(srcStore.storePath, that.storePath);
                    that.guidMap[guid] = importResult;
                    resolve(importResult);
                } catch(e) {reject(e);}})();
            });
        }

        speak(text, opts={}) {
            var {
                guidMap,
            } = this;
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var speakResult = await that.voice.speak(text, opts);
                    var result = await that.import(speakResult);
                    resolve(result);
                }catch(e) {reject(e);}})();
            });
        }
    }

    module.exports = exports.VsmStore = VsmStore;
})(typeof exports === "object" ? exports : (exports = {}));

