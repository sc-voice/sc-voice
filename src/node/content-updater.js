(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        exec,
    } = require('child_process');
    const logger = require('log-instance').LogInstance.singleton;
    const Words = require('./words');
    const SuttaFactory = require('./sutta-factory');
    const SuttaStore = require('./sutta-store');
    const Task = require('./task');
    const LOCAL = path.join(__dirname, '..', '..', 'local');

    class ContentUpdater {
        constructor(opts={}) {
            logger.logInstance(this, opts);
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
                    that.suttaStore = new SuttaStore({ logLevel, });
                    await that.suttaStore.initialize();
                    that.isInitialized = true;
                    resolve(that);
                } catch(e) {reject(e);} })();
            });
        }

        update(unused,opts={}) {
            if (!this.isInitialized) {
                return Promise.reject(new Error(
                    `ContentUpdater is not initialized`));
            }
            var name = `ContentUpdater.update()`;
            var task = opts.task || new Task({ name, });
            task.actionsTotal += 1;
            var results = { name, task, };
            var { suttaStore, } = this;
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    await that.suttaStore.bilaraData.sync();
                    task.summary = `Update completed`;
                    task.actionsDone++; // github
                    resolve(results);
                } catch(e) {
                    logger.warn(
                        `ContentUpdater.update() failed ${e.message}`);
                    logger.warn(e.stack);
                    task.error = e;
                    reject(e);
                } })();
            });
        }
    }

    module.exports = exports.ContentUpdater = ContentUpdater;
})(typeof exports === "object" ? exports : (exports = {}));

