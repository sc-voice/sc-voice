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
    const S3Bucket = require('./s3-bucket');
    const Playlist = require('./playlist');
    const Voice = require('./voice');
    const AWS = require("aws-sdk");
    const LOCAL = path.join(__dirname, '../../local');
    const PATH_VSM = path.join(LOCAL, 'vsm');
    const MANIFEST = "manifest.json";
    const VSM_S3 = path.join(LOCAL, 'vsm-s3.json');
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
            this.zipSuffix = opts.zipSuffix || '.gz';
            this.zip = opts.zip || `gzip -f -S ${this.zipSuffix}`;
            this.importMap = {};
            this.s3Bucket = opts.s3Bucket || new S3Bucket();
            this.archiveDir = opts.archiveDir || this.storePath;
        }

        static options(opts={}) {
            var {
                storePath,
                storeName,
                soundStore,
                voice,
                s3Bucket,
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
                s3Bucket,
            });
        }

        tarPath(opts={}) {
            var volume = opts.volume || 'common';
            var archiveDir = opts.archiveDir || this.archiveDir;
            var archiveFile = opts.archiveFile || this.archiveFile || volume;
            return path.join(archiveDir, `${archiveFile}.tar`);
        }

        zipPath(opts={}) {
            var zipSuffix = opts.zipSuffix || this.zipSuffix;
            return `${this.tarPath(opts)}${zipSuffix}`;
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

        archiveNikaya(...args) {
            var that = this;
            var opts = args[0] || {};
            var {
                s3Bucket,
                voice,
            } = opts;
            var archiveDir = opts.archiveDir || that.archiveDir;
            s3Bucket = s3Bucket || this.s3Bucket;
            voice = voice || this.voice;
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var result = {};
                    var importResult = await that.importNikaya.apply(that, args);
                    var {
                        volume,
                    } = importResult;
                    var archiveFile =  opts.archiveFile || volume;
                    var archiveOpts = {
                        volume,
                        archiveDir,
                        archiveFile,
                        voice,
                    };
                    var {
                        archived,
                        version,
                    } = await that.serializeVolume.call(that, archiveOpts);
                    var archivePath = that.zipPath({
                        volume,
                        archiveDir,
                        archiveFile,
                    });
                    var archiveBase = path.basename(archivePath);
                    var archiveStream = fs.createReadStream(archivePath);
                    var archiveResult = await 
                        s3Bucket.putObject(archiveBase, archiveStream);
                    resolve(archiveResult);
                } catch(e) {reject(e);} })();
            });
        }

        importNikaya(...args) {
            var that = this;
            var opts = args[0] || {};
            if (typeof args[0] === 'string') {
                opts = {
                    nikaya: args[0],
                    lang: args[1],
                    author: args[2],
                    voice: args[3],
                }
            }
            var {
                nikaya,
                lang,
                author,
                voice,
                volume,
                maxSuttas,
                suttaStore,
            } = opts;
            lang = lang || 'pli';
            author = author || 'sujato';
            voice = voice || Voice.createVoice('aditi');
            if (typeof voice === 'string') {
                voice = Voice.createVoice(voice);
            }
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var guids = [];
                    suttaStore = suttaStore || await new SuttaStore().initialize();
                    var searchLang = lang === 'pli' ? 'en' : lang;
                    var sutta_ids = await 
                        suttaStore.nikayaSuttaIds(nikaya, searchLang, author);
                    sutta_ids = maxSuttas
                        ? sutta_ids.slice(0, maxSuttas)
                        : sutta_ids;
                    for (var iSutta = 0; iSutta < sutta_ids.length; iSutta++) {
                        var suid = sutta_ids[iSutta];
                        var searchPattern = `${suid}/${searchLang}/${author}`;
                        var searchResults = await suttaStore.search(searchPattern);
                        if (searchResults.results.length) {
                            var {
                                sutta,
                            } = searchResults.results[0];
                        }
                        var archiveResult = await that.importSutta(sutta);
                        var volume = archiveResult.volume;
                        guids = guids.concat(archiveResult.guids);
                    }
                    resolve({
                        nikaya,
                        lang,
                        searchLang,
                        author,
                        voice: {
                            name: voice.name,
                            usage: voice.usage,
                            pitch: voice.pitch,
                            usages: {
                                [voice.usage]: {
                                    rate: voice.usages[voice.usage].rate,
                                }
                            }
                        },
                        maxSuttas,
                        sutta_ids,
                        volume,
                        guids,
                    });
                } catch(e) {reject(e);} })();
            });
        }

        serializeVolume(opts={}) {
            var that = this;
            if (typeof opts === 'string') {
                opts = {
                    volume: opts,
                }
            }
            var {
                s3Bucket,
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
                    `serializeVolume() no volume:${volume}`));
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

                    var tarPath = that.tarPath(manifest);
                    var zip = that.zip;
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

        restoreS3Keys(opts={}) {
            var {
                s3Bucket,
                keys,
                soundStore,
                clearVolume,
            } = opts;
            if (!(s3Bucket instanceof S3Bucket)) {
                return Promise.reject(new Error(    
                    `restoreS3Keys() expected s3Bucket: S3Bucket`));
            }
            if (!(keys instanceof Array) || keys.length===0) {
                return Promise.reject(new Error(    
                    `restoreS3Keys() expected keys: array of S3 Keys`));
            }
            clearVolume = !!clearVolume; // default is false
            soundStore = soundStore || this.soundStore;
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var tmpDirObj = tmp.dirSync({
                        unsafeCleanup: true,
                    });
                    var archiveDir = tmpDirObj.name;
                    var result = {
                        Bucket: s3Bucket.Bucket,
                        s3:{ 
                            endpoint: s3Bucket.s3.endpoint,
                            region: s3Bucket.s3.region,
                        },
                        restored:[],
                    };
                    for (var iVol=0; iVol<keys.length; iVol++) {
                        var key = keys[iVol];
                        var volume = path.basename(key, `.tar${that.zipSuffix}`);
                        var params = {
                            archiveDir,
                            archiveFile: key,
                            volume,
                            clearVolume,
                            soundStore,
                        };
                        var archivePath = path.join(archiveDir, key);
                        var stream = await s3Bucket.downloadObject(key, archivePath);
                        var resRestore = await that.restoreVolume(params);
                        logger.info(`VsmStore.restoreS3Keys() restored:${s3Bucket.Bucket}/${key}`);
                        result.restored.push(resRestore);
                        fs.unlink(archivePath, ()=>logger.debug(`removed ${archivePath}`));
                    }
                    resolve(result);
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
                        clearVolume, // default is true
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
                            logger.warn(`restoreVolume() failed cwd:${cwd} cmd:${cmd}`);
                            logger.warn('-----STDERR BEGIN-----');
                            logger.warn(stderr);
                            logger.warn('-----STDERR END-----');
                            logger.warn(error.stack);
                            reject(error);
                            return;
                        }
                        resolve({
                            restored: zipFile,
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
                        var guid = speakResult.signature.guid;
                        guids.push(guid);
                        var guidResult = await that.importGuidFiles(guid, volume);
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

