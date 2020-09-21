(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const { logger } = require('log-instance');
    const MS_MINUTE = 60 * 1000;
    const MS_DAY = 24 * 60 * MS_MINUTE;
    const PRUNE_DAYS = 180;

    var instances = 0;

    class FilePruner { 
        constructor(opts={}) {
            var that = this;

            // options
            that.name = `${that.constructor.name}_${++instances}`;
            (opts.logger || logger).logInstance(this);
            if (!fs.existsSync(opts.root)) {
                throw new Error(`Expected file path for root:${opts.root}`);
            }
            that.root = opts.root;
            that.pruneDays = opts.pruneDays || PRUNE_DAYS;
            that.onPrune = opts.onPrune || FilePruner.onPrune;

            // instance
            that.started = undefined;
            that.done = undefined;
            that.earliest = undefined;
            that.pruning = 0;
            that.size = {
                total: 0,
                pruned: 0,
            };
        }

        static onPrune(oldPath) {
            logger.info("prune", oldPath);
            return true;
        }

        pruneOldFiles(onPrune = this.onPrune) {
            var that = this;
            if (that.pruning) {
                return Promise.reject(new Error(
                    `pruneOldFiles() ignored (busy)`));
            }
            that.pruning = 1;
            var pruneDays = that.pruneDays || 180;
            var pruned = [];
            that.started = new Date();
            that.size.total = 0;
            that.size.pruned = 0;
            var entries = that.entries();
            that.earliest = Date.now();
            var pruneDate = new Date(Date.now()-pruneDays*MS_DAY);
            that.log(`pruneOldFiles() started:${that.started}`);
            var pbody = async (resolve, reject) => { try {
                let next;
                while((next=entries.next()) && !next.done) {
                    var fpath = next.value;
                    var stats = await fs.promises.stat(fpath);
                    that.size.total += stats.size;
                    stats.mtime < that.earliest && (that.earliest = stats.mtime);
                    if (stats.mtime <= pruneDate) {
                        that.pruning = entries.stack.length + 1;
                        if (await onPrune(fpath)) { // qualified delete
                            pruned.push(fpath);
                            that.info(`pruneOldFiles() unlink:${fpath}`);
                            await fs.promises.unlink(fpath);
                            that.size.pruned += stats.size;
                        }
                    }
                }
                that.pruning = 0;
                that.done = new Date();
                var elapsed = ((that.done - that.started)/1000).toFixed(1);
                that.log(`pruneOldFiles() done:${elapsed}s`);
                resolve({
                    started: that.started,
                    earliest: that.earliest,
                    done: that.done,
                    size: that.size,
                    pruning: that.pruning,
                    pruned,
                });
            } catch(e) { reject(e); }};
            return new Promise(pbody);
        }

        entries() {
            var that = this;
            let stack = [that.root];
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

    module.exports = exports.FilePruner = FilePruner;
})(typeof exports === "object" ? exports : (exports = {}));

