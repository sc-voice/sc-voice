(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        exec,
    } = require('child_process');
    const {
        logger,
    } = require('just-simple').JustSimple;
    const Words = require('./words');
    const SuttaCentralApi = require('./sutta-central-api');
    const SuttaFactory = require('./sutta-factory');
    const SuttaStore = require('./sutta-store');
    const Task = require('./task');
    const LOCAL = path.join(__dirname, '..', '..', 'local');

    class ContentUpdater {
        constructor(opts={}) {
            logger.logInstance(this, opts);
            this.apiUrl = opts.apiUrl || 'http://staging.suttacentral.net/api';
            this.gitPath = opts.gitPath ||  path.join(LOCAL, 'suttas');
            this.token = opts.token || // GitHub Personal Access Token
                'no-token'; 
            Object.defineProperty(this, 'isInitialized', {
                writable: true,
                value: false,
            });
        }

        initialize() {
            if (this.isInitialized) {
                return Promise.resolve(this);
            }
            var logLevel = this.logLevel;
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var suttaCentralApi = await new SuttaCentralApi({
                        apiUrl: that.apiUrl,
                        logLevel,
                    }).initialize();
                    that.suttaStore = new SuttaStore({
                        suttaCentralApi,
                        logLevel,
                    });
                    await that.suttaStore.initialize();
                    that.remote_origin_url = await 
                        that.git('git config --get remote.origin.url');
                    that.isInitialized = true;
                    resolve(that);
                } catch(e) {reject(e);} })();
            });
        }

        git(cmd, task) {
            const maxBuffer = 10 * 1024 * 1024;
            var opts = {
                cwd: this.gitPath,
                shell: '/bin/bash',
                maxBuffer,
            };
            var safeCmd = cmd;
            console.log(`dbg token`, this.token);
            if (cmd === 'git push') {
                var auth = `${this.token}:x-oauth-basic`;
                safeCmd = ` git push ` + // hide from bash history
                    this.remote_origin_url.replace('https://', `https://${auth}@`);
            }
            return new Promise((resolve,reject) => {
                task && (task.summary = cmd);
                exec(safeCmd, opts, (err,stdout,stderr) => {
                    if (err) {
                        stderr = stderr.toString();
                        if (/invalid username or password/iu.test(stderr)) {
                            var msg = `Invalid Personal Access Token`;
                            logger.warn(`ContentUpdater.git("${cmd}") ${msg}`);
                            var e = new Error(msg);
                            task && (task.error = e);
                            reject(e);
                        } else {
                            logger.warn(`ContentUpdater.git("${cmd}") E2`);
                            logger.warn(stderr);
                            logger.warn(err.stack);
                            reject(err);
                        }
                    } else {
                        logger.info(`ContentUpdater.update() git:${stdout}`);
                        resolve(stdout.trim()) || '';
                    }
                });
            });
        }

        update(suids, opts={}) {
            if (!this.isInitialized) {
                return Promise.reject(new Error(`ContentUpdater is not initialized`));
            }
            if (!(suids instanceof Array) || suids.length == 0) {
                return Promise.reject(new Error(`Expected array of suids`));
            }
            var name = `ContentUpdater.update()`;
            var task = opts.task || new Task({
                name,
            });
            task.actionsTotal += 1;
            var results = {
                name,
                suids,
                task,
                gitLog: [],
            };
            var {
                suttaStore,
            } = this;
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    await that.suttaStore.bilaraData.sync();
                    task.summary = `Update completed`;
                    if (0) {
                    var resPull = await that.git('git pull', task);
                    results.gitLog.push(resPull);
                    var resUpdate = await suttaStore.updateSuttas(suids, {
                        task,
                    });
                    var resStatus = await that.git('git status', task);
                    if (!/nothing to commit/.test(resStatus)) {
                        var cmdCommit = 'git commit -am "ContentUpdater"';
                        var resCommit = await that.git(cmdCommit, task);
                    }
                    if (!/up-to-date/.test(resStatus)) {
                        var resPush = await that.git('git push', task);
                        task.summary = `Update completed for ${suids.length} suttas`;
                    } else {
                        task.summary = `Update completed without change`;
                    }
                    }

                    task.actionsDone++; // github

                    resolve(results);
                } catch(e) {
                    logger.warn(`ContentUpdater.update() failed ${e.message}`);
                    logger.warn(e.stack);
                    task.error = e;
                    reject(e);
                } })();
            });
        }
    }

    module.exports = exports.ContentUpdater = ContentUpdater;
})(typeof exports === "object" ? exports : (exports = {}));

