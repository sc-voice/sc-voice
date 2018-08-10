(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const LOCAL = path.join(__dirname, '..', 'local');

    class SoundStore {
        constructor(opts={}) {
            if (!fs.existsSync(LOCAL)) {
                fs.mkdirSync(LOCAL);
            }
            this.type = 'SoundStore';
            this.folderPrefix = opts.folderPrefix || 2;

            this.storePath = opts.storePath ||  path.join(LOCAL, 'sounds');
            fs.existsSync(this.storePath) || fs.mkdirSync(this.storePath);
        }

        signaturePath(signature) {
            var guid = signature.guid;
            var suffix = ".ogg";
            if (typeof guid !== 'string') {
                var e = new Error(`SoundStore.assetPath() invalid guid:${guid}`);
                throw e;
            }
            var folder = guid.substr(0,this.folderPrefix);
            return path.join(this.storePath, folder, `${guid}${suffix}`);
        }

    }

    module.exports = exports.SoundStore = SoundStore;
})(typeof exports === "object" ? exports : (exports = {}));

