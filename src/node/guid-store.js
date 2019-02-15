(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const LOCAL = path.join(__dirname, '../../local');

    class GuidStore {
        constructor(opts={}) {
            if (!fs.existsSync(LOCAL)) {
                fs.mkdirSync(LOCAL);
            }
            this.type = opts.type || 'GuidStore';
            this.folderPrefix = opts.folderPrefix || 2;

            this.suffix = opts.suffix || '';
            this.volume = opts.volume || 'common';
            this.storeName = opts.storeName || 'guid-store';
            this.storePath = opts.storePath ||  path.join(LOCAL, this.storeName);
            fs.existsSync(this.storePath) || fs.mkdirSync(this.storePath);
        }

        guidPath(...args) {
            var guid = args[0];
            var opts = args[1] || {};
            if (typeof opts === 'string') {
                opts = {
                    suffix: opts,
                };
            }
            var suffix = opts.suffix || this.suffix;
            if (typeof guid !== 'string') {
                var e = new Error(`GuidStore.guidPath() invalid guid:${guid}`);
                throw e;
            }
            var volume = opts.volume || this.volume;
            var volumePath = path.join(this.storePath, volume);
            fs.existsSync(volumePath) || fs.mkdirSync(volumePath);
            var chapter = opts.chapter || guid.substr(0,this.folderPrefix);
            var chapterPath = path.join(this.storePath, volume, chapter);
            fs.existsSync(chapterPath) || fs.mkdirSync(chapterPath);
            return path.join(chapterPath, `${guid}${suffix}`);
        }

        signaturePath(signature, opts) {
            return this.guidPath(signature.guid, opts);
        }

    }

    module.exports = exports.GuidStore = GuidStore;
})(typeof exports === "object" ? exports : (exports = {}));

