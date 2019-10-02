#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
    execSync,
} = require('child_process');
const {
} = require('../index');

const LOCAL = path.join(__dirname, '..', 'local');
const SUTTA_TRANSLATION_PATH = path.join(LOCAL, 'de-suttas');
const GITHUB = 'https://github.com';
const SUTTA_TRANSLATION_GIT = 
    `${GITHUB}/sabbamitta/sutta-translation.git`;
var cwd = LOCAL;

function get_sutta_translation() {
    if (fs.existsSync(SUTTA_TRANSLATION_PATH)) {
        var cmd = `cd de-suttas; git pull`;
    } else {
        var cmd = `git clone ${SUTTA_TRANSLATION_GIT} de-suttas`;
        console.log(`dbg cmd`, cmd);
    }
    console.log(cmd);
    var res = execSync(cmd, { cwd }).toString();
    console.log(res);
}

get_sutta_translation();

process.exit(0);

