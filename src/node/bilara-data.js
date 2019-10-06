(function(exports) {
    const fs = require("fs");
    const path = require("path");
    const {
        js,
        logger,
    } = require('just-simple').JustSimple;
    const {
        execSync,
    } = require('child_process');

    const LOCAL = path.join(__dirname, '..', '..', 'local');
    const cwd = LOCAL;

    class BilaraData {
        constructor(opts={}) {
            this.root = opts.root || path.join(LOCAL, 'bilara-data');
            logger.logInstance(this, opts);
            this.nikayas = opts.nikayas || ['an','mn','dn','sn', 'kn'];
            this.reNikayas = new RegExp(
                `/(${this.nikayas.join('|')})/`, 'ui');
            Object.defineProperty(this, "_suttaMap", {
                writable: true,
                value: null,
            });
        }

        syncGit(root, repo, gitRoot='') {
            this.log(`root:${root}`);
            if (fs.existsSync(root)) {
                var cmd = `cd ${root}; git pull`;
            } else {
                var cmd = `git clone ${repo} ${gitRoot}`;
            }
            this.log(cmd);
            var res = execSync(cmd, { cwd }).toString();
            this.log(res);
        }

        isSuttaPath(fpath) {
            return this.reNikayas.test(fpath);
        }

        suttaMap() {
            var map = this._suttaMap;
            if (map) {
                return map;
            }
            this._sutta_Map = map = {};
            var transRoot = path.join(this.root, 'translation');
            this.translations = this.dirFiles(transRoot)
                .filter(f => this.isSuttaPath(f));
            this.translations.forEach((f,i) => {
                var file = f.replace(/.*\/translation\//,'translation/');
                var parts = file.split('/');
                var lang = parts[1];
                var author = parts[2];
                var nikaya = parts[3];
                var suid = parts[parts.length-1].split('_')[0];
                map[suid] = map[suid] || {};
                map[suid][lang] = map[suid][lang] || [];
                map[suid][lang].push({
                    suid,
                    lang,
                    nikaya,
                    author,
                    translation: file,
                });
            });
            console.log(`dbg suttaMap[0]`, map['dn33']);
            console.log(`dbg suttaMap[0]`, map['sn12.3']);
            console.log(`dbg suttaMap[0]`, map['an2.1-10']);

            return map;
        }

        dirFiles(root) {
            var files = [];
            var cmd = `find ${root} -path '*.git*' -prune -o -type f -print`;
            var res = execSync(cmd, { cwd }).toString();
            return res.split('\n');
        }

        suttaPaths(...args) {
            if (args.length == 0) {
                throw new Error(`Expected {suid,lang,author}`);
            }
            var lang = args.lang || 'en';
            var author = args.author || 'author';
            var suid = args.suid;
            //var map = this.suttaMap[lang] || []};
            //this.suttaMap[lang] = map;
        }

    }

    module.exports = exports.BilaraData = BilaraData;
})(typeof exports === "object" ? exports : (exports = {}));
