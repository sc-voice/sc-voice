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
            this.storeName = opts.storeName || 'guid-store';
            this.storePath = opts.storePath ||  path.join(LOCAL, this.storeName);
            fs.existsSync(this.storePath) || fs.mkdirSync(this.storePath);
        }

        guidPath(guid, suffix=this.suffix) {
            if (typeof guid !== 'string') {
                var e = new Error(`GuidStore.guidPath() invalid guid:${guid}`);
                throw e;
            }
            var folder = guid.substr(0,this.folderPrefix);
            var folderPath = path.join(this.storePath, folder);
            fs.existsSync(folderPath) || fs.mkdirSync(folderPath);
            return path.join(folderPath, `${guid}${suffix}`);
        }

        signaturePath(signature, suffix=this.suffix) {
            return this.guidPath(signature.guid, suffix);
        }

    }

    module.exports = exports.GuidStore = GuidStore;
})(typeof exports === "object" ? exports : (exports = {}));

