#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
    execSync,
} = require('child_process');
const {
} = require('../index');

const LOCAL = path.join(__dirname, '..', 'local');
const cwd = LOCAL;

class SuttaTransform {

    constructor(opts={}) {
        var DST_DIR = opts.bilara_dir || `bilara-data`;
        var DST_PATH = path.join(LOCAL, DST_DIR);
        var SRC_DE_DIR = opts.src_de_dir || 'de-suttas';
        var SRC_DE_PATH = path.join(LOCAL, SRC_DE_DIR);
        var DST_DE_DIR = path.join(DST_PATH, `translation/de`);
        var SRC_EN_PATH = path.join(DST_PATH, `translation/en`);
        var GITHUB = 'https://github.com';
        var SRC_GIT = opts.src_git || `${GITHUB}/sabbamitta/sutta-translation.git`;
        var DST_GIT = opts.dst_git || `${GITHUB}/sc-voice/${DST_DIR}.git`;

        this.nikayas = opts.nikayas || {
            an: true,
            dn: true,
            sn: true,
            mn: true,
        };
        this.deSrcSuttas = this.suttaFiles(SRC_DE_PATH, SRC_GIT, SRC_DE_DIR);
        this.enSrcSuttas = this.suttaFiles(DST_PATH, DST_GIT, DST_DIR);
    }

    isSuttaPath(fpath) {
        var parts = fpath.split('/');
        for (var i = 0; i < parts.length; i++) {
            if (this.nikayas[parts[i].toLowerCase()]) {
                return true;
            }
        }
        return false;
    }

    dirFiles(root) {
        var files = [];
        fs.readdirSync(root).forEach(fname => {
            var fpath = path.join(root, fname);
            var stat = fs.statSync(fpath);
            if (stat.isDirectory()) {
                files = files.concat(this.dirFiles(fpath));
            } else if (this.isSuttaPath(fpath)) {
                files.push(fpath);
            }
        });
        return files;
    }

    suttaFiles(root, repo, gitRoot='') {
        console.log(`root:${root}`);
        if (fs.existsSync(root)) {
            var cmd = `cd ${root}; git pull`;
        } else {
            var cmd = `git clone ${repo} ${gitRoot}`;
        }
        console.log(cmd);
        var res = execSync(cmd, { cwd }).toString();
        console.log(res);

        var files = this.dirFiles(root);
        return files;
    }

    enSrcPath(dePath) {
    }
}

var trans = new SuttaTransform();
console.log(`dbg srcDeFiles`, trans.deSrcSuttas.slice(0,5));
console.log(`dbg srcEnFiles`, trans.enSrcSuttas.slice(0,5));

process.exit(0);

