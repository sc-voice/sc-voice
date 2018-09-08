(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const LOCAL = path.join(__dirname, '../../local');

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

        signaturePath(signature, suffix='.ogg') {
            var guid = signature.guid;
            if (typeof guid !== 'string') {
                var e = new Error(`SoundStore.assetPath() invalid guid:${guid}`);
                throw e;
            }
            var folder = guid.substr(0,this.folderPrefix);
            var folderPath = path.join(this.storePath, folder);
            fs.existsSync(folderPath) || fs.mkdirSync(folderPath);
            return path.join(folderPath, `${guid}${suffix}`);
        }

    }

    module.exports = exports.SoundStore = SoundStore;
})(typeof exports === "object" ? exports : (exports = {}));

