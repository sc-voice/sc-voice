(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const { logger, } = require('log-instance');
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
    const Task = require('./task');
    const Voice = require('./voice');
    const AWS = require("aws-sdk");
    const LOCAL = path.join(__dirname, '../../local');
    const PATH_VSM = path.join(LOCAL, 'vsm');
    const MANIFEST = "manifest.json";
    const VSM_S3 = path.join(LOCAL, 'vsm-s3.json');
    const tmp = require('tmp');

    const IMPORT_KIDS = false;  // atomic import provides neglible benefit 
                                // It is also complicated and buggy

    class VsmStore extends SoundStore {
        constructor(opts) {
            super((opts = VsmStore.options(opts)));
            logger.debug(`VsmStore.ctor(${this.storePath})`);
            this.soundStore = opts.soundStore;
            this.lang = opts.lang || 'pli';
            this.author = opts.author || 'mahasangiti';
            this.voice = opts.voice;
            this.zipSuffix = opts.zipSuffix || '.gz';
            this.zip = opts.zip || `gzip -f -S ${this.zipSuffix}`;
            this.importMap = {};
            this.s3Bucket = opts.s3Bucket || new S3Bucket();
            this.archiveDir = opts.archiveDir || this.storePath;
            this.importKids = opts.importKids == null ? IMPORT_KIDS : opts.importKids;
        }

        static get suttaStore() {
            if (suttaStore == null) {
                suttaStore = new SuttaStore();
            }
            return suttaStore;
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
                localeIPA: "pli",
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
            var signature = speakResult.signature;
            var guid = signature.guid;
            var result = this.importMap[guid];
            if (result) {
                return Promise.resolve(result);
            }
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var srcStore = that.soundStore;
                    var volume = signature.volume;
                    var kidguids = [];
                    if (that.importKids && signature.api === 'ffmegConcat') {
                        var files = signature.files;
                        for (var i=0; i<files.length; i++) {
                            var fileparts = files[i].split('/');
                            if (fileparts[0] === volume) {
                                var lastpart = fileparts[fileparts.length-1];
                                kidguids.push(lastpart.split('.')[0]);
                            } else {
                                logger.info(`skipping atomic sound:${files[i]}`);
                            }
                        }
                        if (kidguids.length !== files.length) {
                            kidguids = [];
                        }
                    }
                    if (kidguids.length > 0) {
                        for (var i=0; i<kidguids.length; i++) {
                            await that.importGuidFiles(kidguids[i], volume);
                        }
                    } else {
                        await that.importGuidFiles(guid, volume);
                    }
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
            volume = volume || 
                SoundStore.suttaVolumeName(sutta_uid, lang, author, voice.name);
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
            var opts = args[0] && Object.assign({},args[0]) || {};
            opts.s3Bucket = opts.s3Bucket || this.s3Bucket;
            opts.voice = opts.voice || this.voice;
            opts.task = opts.task || new Task({
                name: 'archiveNikaya',
            });
            opts.archiveDir = opts.archiveDir || this.archiveDir;
            var {
                nikaya,
                archiveDir,
                s3Bucket,
                voice,
                task,
            } = opts;
            if (nikaya == null) {
                return Promise.reject(new Error(
                    `archiveNikaya() nikaya is required`));
            }
            const ACTIONS_UPLOAD = 10; // a large number to prevent 100% from misleading user
            task.actionsTotal += ACTIONS_UPLOAD;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var result = {};
                    var importResult = await that.importNikaya.call(that, opts);
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
                    task.summary = `serializing volume: ${volume}`;
                    var archivePath = that.zipPath({
                        volume,
                        archiveDir,
                        archiveFile,
                    });
                    if (fs.existsSync(archivePath)) {
                        logger.info(`removing existing archive:${archivePath}`);
                        fs.unlinkSync(archivePath);
                    }
                    var {
                        archived,
                        version,
                    } = await that.serializeVolume.call(that, archiveOpts);
                    task.summary = `archiving ${volume} to ${s3Bucket.Bucket} ...`;
                    var archiveStats = fs.statSync(archivePath);
                    var archiveSize = archiveStats.size;
                    var archiveBase = path.basename(archivePath);
                    var archiveStream = fs.createReadStream(archivePath);
                    var archivePromise = s3Bucket.upload(archiveBase, archiveStream);
                    /*
                    archiveStream.on('data', chunk => {
                        logger.info(`archiveStream.data chunk:${chunk.length}`);
                    });
                    archiveStream.on('end', () => {
                        logger.info(`archiveStream.end`);
                    });
                    archiveStream.on('error', e => {
                        logger.warn(e.stack);
                    });
                    */
                    logger.info([
                        `archiveNikaya()`,
                        `Bucket:${s3Bucket.Bucket}`,
                        `file:${archivePath}`,
                        `size:${archiveSize} ...`].join(' '));
                    var archiveResult = await archivePromise;
                    var Bucket = s3Bucket.Bucket;
                    var Key = archiveResult.Key;
                    var ETag = archiveResult.response.ETag;
                    ETag && (ETag = ETag.replace(/"/ug, ''));
                    task.summary = `Archived ${Key}/${ETag} to ${Bucket}`;
                    if (fs.existsSync(archivePath)) {
                        logger.info(`removing uploaded archive:${archivePath}`);
                        fs.unlinkSync(archivePath);
                    }
                    task.actionsDone += ACTIONS_UPLOAD;
                    resolve(archiveResult);
                } catch(e) {
                    logger.warn(e.stack);
                    reject(e);
                } })();
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
                task,
            } = opts;
            maxSuttas = Number(maxSuttas);
            if (nikaya == null) {
                return Promise.reject(new Error(
                    `importNikaya() nikaya is required`));
            }
            lang = lang || 'pli';
            author = author || 'sujato';
            voice = voice || Voice.createVoice('aditi');
            task = task || new Task();
            task.actionsTotal++;
            if (typeof voice === 'string') {
                voice = Voice.createVoice(voice);
            }
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var guids = [];
                    suttaStore = suttaStore || 
                        await SuttaStore.suttaStore.initialize();
                    var searchLang = lang === 'pli' ? 'en' : lang;
                    var sutta_ids = await 
                        suttaStore.nikayaSuttaIds(nikaya, searchLang, author);
                    if (maxSuttas) {
                        sutta_ids = sutta_ids.slice(0, maxSuttas);
                    }
                    logger.info(`VSMStore.importNikaya(${nikaya}) `+
                        `${sutta_ids.length} suttas`);
                    var nSuttas = sutta_ids.length;
                    task.actionsTotal += nSuttas;
                    for (var iSutta = 0; iSutta < nSuttas; iSutta++) {
                        var suid = sutta_ids[iSutta];
                        var searchPattern = `${suid}/${searchLang}/${author}`;
                        var searchResults = await 
                            suttaStore.search(searchPattern);
                        if (searchResults.results.length) {
                            var {
                                sutta,
                            } = searchResults.results[0];
                            var archiveResult = await that.importSutta(sutta);
                            var volume = archiveResult.volume || '';
                            guids = guids.concat(archiveResult.guids);
                            task.summary = 
                                `${volume} suttas imported: ${iSutta+1}/${nSuttas} ${suid}`;
                        } else {
                            logger.warn(`VSMStore.importNikaya(${nikaya}) `+
                                `[${iSutta}] ${suid} NOT FOUND`);
                        }
                        task.actionsDone++;
                    }
                    task.actionsDone++;
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
                        task,
                    });
                } catch(e) {
                    task.error = e;
                    logger.warn(e.stack);
                    reject(e);
                } })();
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
                    var cmd = [
                        `tar -cf ${tarPath} ${volume}`,
                        `${zip} ${tarPath}`,
                    ].join(';');
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

        restoreS3Archives(opts={}) {
            var {
                s3Bucket,
                restore,
                soundStore,
                clearVolume,
            } = opts;
            if (!(s3Bucket instanceof S3Bucket)) {
                return Promise.reject(new Error(    
                    `restoreS3Archives() expected s3Bucket: S3Bucket`));
            }
            if (!(restore instanceof Array) || restore.length===0) {
                return Promise.reject(new Error(    
                    `restoreS3Archives() expected restore: array of {Key,ETag}`));
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
                        s3Bucket: {
                            Bucket: s3Bucket.Bucket,
                            s3: {
                                endpoint: s3Bucket.s3.config.endpoint,
                                region: s3Bucket.s3.config.region,
                            },
                        },
                        restored:[],
                    };
                    for (var iVol=0; iVol<restore.length; iVol++) {
                        var { 
                            Key,
                            ETag,
                        } = restore[iVol];
                        var volume = path.basename(Key, `.tar${that.zipSuffix}`);
                        var params = {
                            archiveDir,
                            archiveFile: Key,
                            volume,
                            clearVolume,
                            soundStore,
                            ETag,
                        };
                        var archivePath = path.join(archiveDir, Key);
                        var stream = await s3Bucket.downloadObject(Key, archivePath);
                        var resRestore = await that.restoreVolume(params);
                        var fun = 'VsmStore.restoreS3Archives()';
                        logger.info(`${fun} restored:${s3Bucket.Bucket}/${Key}`);
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
                        ETag,
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
                        var manifestPath = path.join(volumePath, 'manifest.json');
                        var manifest = {};
                        if (fs.existsSync(manifestPath)) {
                            manifest = JSON.parse(fs.readFileSync(manifestPath));
                        }
                        manifest.ETag = ETag || null;
                        manifest.restored = new Date();
                        manifest.volume = manifest.volume || volume;
                        fs.writeFileSync(manifestPath, 
                            JSON.stringify(manifest, null, 2));
                        resolve({
                            manifest,
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
            volume = volume || 
                SoundStore.suttaVolumeName(sutta_uid, lang, author, voice.name);

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
                        if (text) {
                            var speakResult = await that.speak(text, {
                                volume,
                            });
                            var guid = speakResult.signature.guid;
                            guids.push(guid);
                            var guidResult = await that.importGuidFiles(guid, volume);
                        }
                    }
                    resolve({
                        sutta_uid,
                        volume,
                        guids,
                    });
                } catch(e) {
                    logger.warn(`importSutta(${sutta_uid}) failed`);
                    reject(e);
                } })();
            });
        }
    }

    module.exports = exports.VsmStore = VsmStore;
})(typeof exports === "object" ? exports : (exports = {}));

