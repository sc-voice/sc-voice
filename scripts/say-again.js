#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { logger } = require('log-instance');
logger.logLevel = 'warn';
const {
    SoundStore,
} = require("../index");
const LOCALPATH = path.join(__dirname, '..', 'local');


var voice = "Aditi";
var maxUpload = 10;

function help() {
    console.log(`
USAGE
    Upload cache to S3 say-again.sc-voice via SayAgain:

OPTIONS
    -v
    Specify AWS voice to upload. Default is "Aditi".

    -mu --maxUpload
    Maximum upload (default is 10). Enter 0 for all.
`);
    console.log("-v\tspecify voice");
    process.exit();
}

var { argv } = process;
for (let iArg=2; iArg < argv.length; iArg++) {
    var arg = argv[iArg];
    if (arg === '-v') {
        voice = argv[++iArg];
    } else if (arg === '-mu' || arg === '--maxUpload') {
        maxUpload = Number(argv[++iArg]);
    } else if (arg === '--help') {
        help();
    } else {
        console.log(`unknown option:`, arg);
        help();
    }
}

var sounds = new SoundStore();
sounds.log(`voice:     ${voice}`);
sounds.log(`maxUpload: ${maxUpload}`);

(async function() { try {
    var stats = {};
    var msStart = Date.now();

    sounds.logLevel = 'info';
    var res = await sounds.uploadCaches({stats, voice, maxUpload});
    var elapsed = ((Date.now()-msStart)/1000).toFixed(1);
    sounds.log(JSON.stringify(stats, null, 2));
    sounds.log(`Done ${elapsed}s`);
} catch(e) {
    logger.error(e);
    throw e;
} finally {
    process.exit();
}})();
