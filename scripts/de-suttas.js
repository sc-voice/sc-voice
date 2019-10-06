#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
    js,
    logger,
} = require('just-simple').JustSimple;
const {
    execSync,
} = require('child_process');
const {
} = require('../index');

const LOCAL = path.join(__dirname, '..', 'local');
const cwd = LOCAL;

class BilaraData {
    constructor(opts={}) {
        this.root = opts.root || path.join(LOCAL, 'bilara-data');
        logger.logInstance(this, opts);
        this.nikayas = opts.nikayas || ['an','mn','dn','sn'];
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

class SuttaTransform extends BilaraData {

    constructor(opts={}) {
        super(opts);
        var DST_DIR = opts.bilara_dir || `bilara-data`;
        var DST_PATH = path.join(LOCAL, DST_DIR);
        var SRC_DE_DIR = opts.src_de_dir || 'de-suttas';
        var SRC_DE_PATH = path.join(LOCAL, SRC_DE_DIR);
        var DST_DE_PATH = path.join(DST_PATH, `translation/de`);
        var SRC_EN_PATH = path.join(DST_PATH, `translation/en`);
        var GITHUB = 'https://github.com';
        var SRC_GIT = opts.src_git || `${GITHUB}/sabbamitta/sutta-translation.git`;
        var DST_GIT = opts.dst_git || `${GITHUB}/sc-voice/${DST_DIR}.git`;

        this.syncGit(SRC_DE_PATH, SRC_GIT, SRC_DE_DIR);
        this.syncGit(DST_PATH, DST_GIT, DST_DIR);

        this.deSrcSuttas = this.suttaFiles(SRC_DE_PATH);
        this.enSrcSuttas = this.suttaFiles(SRC_EN_PATH);
    }

    suttaFiles(suttaDir) {
        return this.dirFiles(suttaDir).filter(f => this.isSuttaPath(f));
    }

    enSrcPath(dePath) {
        var deSutta = fs.readFileSync(dePath).toString().split('\n');
        var suid = deSutta[0].toLowerCase()
            .replace(/ [^0-9]*$/,'')
            .replace(' ','');
        var enPath = this.enSrcSuttas.filter(f => f.indexOf(suid) >= 0)[0] || null;
        var enSutta = enPath && JSON.parse(fs.readFileSync(enPath)) || null;
        return {
            suid,
            dePath,
            //deSutta,
            enPath,
            enSutta,
        };
    }
}

var trans = new SuttaTransform();
console.log(`dbg srcDeFiles`, trans.deSrcSuttas.slice(0,5));
console.log(`dbg srcEnFiles`, trans.enSrcSuttas.slice(0,5));
//console.log(`dbg enSrcPath`, trans.enSrcPath(trans.deSrcSuttas[0]));
trans.suttaMap();

process.exit(0);

