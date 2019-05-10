(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        logger,
    } = require('rest-bundle');
    const {
        exec,
    } = require('child_process');
    const {
        version,
    } = require('../../package');
    const SuttaStore = require('./sutta-store');
    const SoundStore = require('./sound-store');
    const Playlist = require('./playlist');
    const Voice = require('./voice');
    const AWS = require("aws-sdk");
    const PATH_VSM = path.join(__dirname, '../../local/vsm');
    const MANIFEST = "manifest.json";
    const tmp = require('tmp');

    var suttaStore = new SuttaStore();

    class VsmStore extends SoundStore {
        constructor(opts) {
            super((opts = VsmStore.options(opts)));
            logger.info(`VsmStore.ctor(${this.storePath})`);
            this.soundStore = opts.soundStore;
            this.lang = opts.lang || 'pli';
            this.author = opts.author || 'mahasangiti';
            this.voice = opts.voice;
            this.zip = opts.zip || 'gzip -f ';
            this.importMap = {};
            this.s3 = opts.s3 || new AWS.S3();
        }

        static options(opts={}) {
            var {
                storePath,
                storeName,
                soundStore,
                voice,
            } = opts;
            voice = voice || Voice.createVoice({
                name: "aditi",
                usage: 'recite',
                languageUnknown: "pli",
                language: 'hi-IN',
                stripNumbers: true,
                stripQuotes: true,
            });
            storeName = storeName || `vsm`;
            storePath = storePath || PATH_VSM;
            soundStore = soundStore || voice.soundStore;

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

        importSpeakResult(speakResult) {
            var guid = speakResult.signature.guid;
            var result = this.importMap[guid];
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
                    that.importMap[guid] = importResult;
                    resolve(importResult);
                } catch(e) {reject(e);}})();
            });
        }

        speak(text, opts={}) {
            var {
                importMap,
            } = this;
            var that = this;
            var {
                sutta_uid,
                voice,
                lang,
                author,
                volume,
            } = opts;
            sutta_uid = sutta_uid || 'other';
            lang = lang || that.lang;
            author = author || that.author;
            voice = voice || that.voice;
            volume = volume || Playlist.volumeName(sutta_uid, lang, author, voice.name);
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var speakOpts = Object.assign({
                        volume,
                        lang,
                        author,
                    }, opts);
                    var speakResult = await voice.speak(text, speakOpts);
                    var result = await that.importSpeakResult(speakResult);
                    resolve(result);
                }catch(e) {reject(e);}})();
            });
        }

        archiveVolume(opts={}) {
            var that = this;
            if (typeof opts === 'string') {
                opts = {
                    volume: opts,
                }
            }
            var {
                volume,
                voice,
                archiveDir,
                archiveFile,
            } = opts;
            voice = voice || that.voice;
            archiveDir = archiveDir || that.storePath;
            archiveFile = archiveFile || volume || 'archive';
            var volPath = path.join(that.storePath, volume);
            if (!fs.existsSync(volPath)) {
                return Promise.reject(new Error(
                    `archiveVolume() no volume:${volume}`));
            }
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var manifest = Object.assign({}, opts, {
                        archived: new Date(),
                        archiveDir,
                        archiveFile,
                        volume,
                        version,
                        voice,
                    });
                    var manifestPath = path.join(that.storePath, volume, MANIFEST);
                    fs.writeFileSync(manifestPath, 
                        JSON.stringify(manifest, null, 2));

                    var tarPath = path.join(archiveDir, `${archiveFile}.tar`);
                    var zip = that.zip
                    var cmd = `tar -cf ${tarPath} ${volume} ; ${zip} ${tarPath}`;
                    var cmdOpts = {
                        cwd: that.storePath,
                    };
                    var execResult = exec(cmd, cmdOpts, (error, stdout, stderr) => {
                        if (error) {
                            reject(error);
                            console.log(`stderr`, stderr);
                            console.error(error.stack);
                            return;
                        }
                        resolve(manifest);
                    });
                } catch(e) {reject(e);} })();
            });
        }

        restoreVolume(opts={}) {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var {
                        volume,
                        voice,
                        soundStore,
                        archiveDir,
                        archiveFile,
                        clearVolume,
                    } = opts;
                    voice = voice || that.voice;
                    archiveDir = archiveDir || that.storePath;
                    archiveFile = archiveFile || volume || 'archive';
                    soundStore = soundStore || that.soundStore;
                    clearVolume = clearVolume === false ? false : true;
                    var filesDeleted = 0;
                    var volumePath = path.join(soundStore.storePath, volume);
                    if (clearVolume && fs.existsSync(volumePath)) {
                        logger.info(`restoreVolume(${volume}) clearVolume`);
                        var clearResult = await soundStore.clearVolume(volume);
                        filesDeleted = clearResult.filesDeleted;
                    }
                    var zipFile = archiveFile.startsWith('/')
                        ? archiveFile
                        : path.join(archiveDir, archiveFile);
                    if (!fs.existsSync(zipFile)) {
                        var altZipFile = `${zipFile}.tar.gz`;
                        if (!fs.existsSync(altZipFile)) {
                            throw new Error(`VSM archive not found:${zipFile}`);
                        }
                        zipFile = altZipFile;
                    }
                    var cwd = soundStore.storePath;
                    var cmd = `gunzip -ck ${zipFile} | tar -x`;
                    var cmdOpts = {
                        cwd,
                    };
                    var execResult = exec(cmd, cmdOpts, (error, stdout, stderr) => {
                        if (error) {
                            reject(error);
                            console.log(`stderr`, stderr);
                            console.error(error.stack);
                            return;
                        }
                        resolve({
                            filesDeleted,
                        });
                    });
                } catch(e) { reject(e);} })();
            });
        }

        importSutta(sutta, opts = {}) {
            var {
                lang,
                author,
                voice,
                volume,
            } = opts;
            var sutta_uid = sutta.sutta_uid;
            lang = lang || this.lang;
            author = author || this.author;
            voice = voice || this.voice;
            volume = volume || Playlist.volumeName(sutta_uid, lang, author, voice.name);

            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var result = {
                        lang,
                        author,
                        voice,
                        volume,
                        sutta_uid,
                    };
                    var guids = [];
                    for (var i = 0; i<sutta.segments.length; i++) {
                        var seg = sutta.segments[i];
                        var text = seg[lang];
                        var speakResult = await that.speak(text, {
                            volume,
                        });
                        guids.push(speakResult.signature.guid);
                    }
                    resolve({
                        sutta_uid,
                        volume,
                        guids,
                    });
                } catch(e) {reject(e);} })();
            });
        }
    }

    module.exports = exports.VsmStore = VsmStore;
})(typeof exports === "object" ? exports : (exports = {}));

