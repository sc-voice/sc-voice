(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const { execSync } = require('child_process');
    const { logger } = require('log-instance');
    const S3Creds = require('./s3-creds');
    const { GuidStore, FilePruner } = require('memo-again');
    const { AwsConfig, SayAgain } = require('say-again');
    const LOCAL = path.join(__dirname, '../../local');
    const PATH_SOUNDS = path.join(LOCAL, 'sounds');
    const MS_MINUTE = 60 * 1000;
    const MS_DAY = 24 * 60 * MS_MINUTE;
    const VSMPATH = path.join(LOCAL, 'vsm-s3.json');

    var instances = 0;

    class SoundStore extends GuidStore { 
        constructor(opts) {
            super((opts = SoundStore.options(opts)));
            var that = this;
            that.name = `${that.constructor.name}_${++instances}`;
            if (opts.name) {
                that.name += `.${opts.name}`;
            }
            that.debug(`SoundStore.ctor(${that.storePath})`);
            that.audioSuffix = opts.audioSuffix;
            that.audioFormat = opts.audioFormat;
            that.audioMIME = opts.audioMIME;
            this.filePruner = opts.filePruner || new FilePruner({root:this.storePath});
            var s3Creds = new S3Creds();
            that.sayAgain = opts.sayAgain || new SayAgain({
                name: this.name,
                logger: this,
                awsConfig: s3Creds.awsConfig,
            });

            // every minute, delete ephemerals older than 5 minutes
            that.ephemerals = {};
            that.ephemeralAge = opts.ephemeralAge || 15*MS_MINUTE;
            that.ephemeralInterval = opts.ephemeralInterval || 5*MS_MINUTE;
            that.ephemeralInterval && setInterval(() => {
                var ctime = new Date(Date.now() - that.ephemeralAge);
                that.clearEphemerals({
                    ctime,
                });
            }, that.ephemeralInterval);
            that.suffixes = opts.suffixes || 
                [that.audioSuffix, '.json', '.txt', '.ssml'];
        }

        static suttaVolumeName(sutta_uid, lang, auid, vname) {
            var collection = sutta_uid.replace(/([a-z]+).*/, '$1');
            if (collection === "thig" || collection === "thag") {
                collection = "kn";
            }
            var source = lang === 'pli' ? 'mahasangiti' : auid;
            var vname =  vname.toLowerCase();
            return `${collection}_${lang}_${source}_${vname}`;
        }

        static options(opts={}) {
            if (opts.audioFormat === 'ogg') {
                var audioSuffix = '.ogg';
                var audioFormat = 'ogg_vorbis';
                var audioMIME = 'audio/ogg';
            } else if (audioFormat == null || audioFormat === 'mp3') {
                var audioSuffix = '.mp3';
                var audioFormat = 'mp3';
                var audioMIME = 'audio/mp3';
            } else {
                throw new Error(
                    `unsupported audioFormat:${opts.audioFormat}`);
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

        soundInfo({guid, volume}) {
            var that = this;
            var suffix = ".json";
            if (!guid) { throw new Error('guid is required') };
            if (!volume) { throw new Error('volume is required') };
            var guidPath = this.guidPath(guid, {suffix, volume});
            var info = [];
            if (fs.existsSync(guidPath)) {
                var json = JSON.parse(fs.readFileSync(guidPath));
                if (json.files) {
                    json.files.forEach(f=>{
                        let fJSON = f.replace(/\.[^.]*$/, ".json");
                        let fPath = path.join(that.storePath, fJSON);
                        info.push(JSON.parse(fs.readFileSync(fPath)));
                    });
                } else {
                    info.push(json);
                }
            } else {
                logger.warn(`soundInfo not found:`, {guidPath});
            }
            return info;
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
                        var stat = fs.statSync(dpath);
                        if (stat.isDirectory()) {
                            var dfiles = fs.readdirSync(dpath)
                                .map(f=>path.join(dpath,f));
                            dfiles.forEach(df => files.push(df));
                        } else if (stat.isFile()) {
                            files.push(dpath);
                        }
                    });
                    files.forEach(f => fs.unlinkSync(f));
                    var result = {
                       filesDeleted: files.length,
                    };
                    resolve(result);
                } catch(e) {reject(e);} })();
            });
        }

        uploadPath({jsonPath, stats, voice, maxUpload}) {
            var that = this;
            var { sayAgain } = that;
            var pbody = (resolve, reject) => { (async function() { try {
                var result = "TBD";
                var json = JSON.parse(fs.readFileSync(jsonPath));
                stats.json = (stats.json||0) + 1;
                stats[json.api] = (stats[json.api] || 0) + 1;

                if (json.api === 'aws-polly') {
                    var mp3Path = jsonPath.replace(/\.json$/,'.mp3');
                    var matchesVoice = !voice || voice === json.voice;
                    if (fs.existsSync(mp3Path) && matchesVoice) {
                        stats.mp3 = (stats.mp3||0) + 1;
                        var buf = await fs.promises.readFile(mp3Path);
                        var base64 = buf.toString('base64');
                        stats.base64 = (stats.base64||0) + base64.length;
                        var request = json;
                        var s3key = sayAgain.s3Key(request);
                        if (s3key.indexOf(json.guid) >= 0) {
                            var response = {
                                mime: "audio/mpeg",
                                base64,
                            }
                            stats.matched = (stats.matched||0) + 1;
                            if (!maxUpload || stats.uploads < maxUpload) {
                                var res = await sayAgain.preload(request, response);
                                if (res.updated) {
                                    stats.uploads = (stats.uploads||0) + 1;
                                    that.log(`uploaded ${s3key}`);
                                    stats.uploads === maxUpload && that.log(
                                        `upload limited by maxUpload:${maxUpload}`);
                                }
                            }
                        } else {
                            that.warn(`Guid mismatch ${guid} vs. ${s3key}`);
                        }
                    }
                }
                resolve(result);
            } catch (e) { reject(e); }})()};
            return new Promise(pbody);
        }

        uploadCaches({stats, voice, maxUpload=0}) {
            var that = this;
            var {
                storePath,
            } = that;
            var pbody = (resolve, reject) => (async function() { try {
                stats = stats || {};
                stats.uploads = stats.uploads || 0;
                stats.started = new Date();
                stats.status = "in progress";
                var deVols = fs.readdirSync(storePath, {withFileTypes: true});
                for (let deVol of deVols.filter(de=>de.isDirectory())) {
                    var volPath = path.join(storePath, deVol.name);
                    stats.volumes = (stats.volumes||0) + 1;
                    var deGuids = fs.readdirSync(volPath, {withFileTypes: true});
                    for (let deGuid of deGuids.filter(de=>de.isDirectory())) {
                        if (deGuid.name.length === 2) {
                            stats.guidFolders = (stats.guidFolders||0) + 1;
                            var dataPath = path.join(volPath, deGuid.name);
                            var fnames = await fs.promises.readdir(dataPath);
                            for (let fname of fnames) {
                                if (fname.endsWith('.json')) {
                                    var jsonPath = path.join(dataPath, fname);
                                    await that.uploadPath({
                                        jsonPath, 
                                        stats,
                                        voice,
                                        maxUpload,
                                    });
                                }
                            }
                        }
                    }
                }
                stats.status = "done"
                resolve(stats);
            } catch(e) { 
                stats.stats = e.message;
                reject(e); 
            } finally {
                stats.finished = new Date();
            }})();
            return new Promise(pbody);
        }

        entries() {
            var that = this;
            let stack = [that.storePath];
            return {
                stack,
                calls: 0,
                found: 0,
                notFound: 0,
                started: new Date(),
                elapsed: 0,
                [Symbol.iterator]: function() { return this; },
                next: function() {
                    this.calls++;
                    while (stack.length) {
                        var fpath = stack.pop();
                        if (fs.existsSync(fpath)) {
                            this.found++;
                            var stats = fs.statSync(fpath);
                            if (stats.isDirectory()) {
                                fs.readdirSync(fpath).forEach(dirEntry=>{
                                    stack.push(path.join(fpath,dirEntry));
                                });
                            } else if (stats.isFile()) {
                                this.elapsed = new Date() - this.started;
                                return {
                                    done: false,
                                    value: fpath,
                                }
                            }
                        } else {
                            this.notFound++;
                            that.info(`skipping deleted entry`, fpath);
                        }
                    }
                    return {
                        done: true,
                        value: undefined,
                    }
                } // next()
            }
        }

    }

    module.exports = exports.SoundStore = SoundStore;
})(typeof exports === "object" ? exports : (exports = {}));

