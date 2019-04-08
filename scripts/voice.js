#!/usr/bin/env node

const version = '1.0.0';
const fs = require("fs");
const path = require("path");
const E_ARG_INVALID = -1;
const E_EXCEPTION = -2;
const {
    exec,
    execSync,
} = require('child_process');
const {
    Voice,
} = require('../index');
const { logger } = require('rest-bundle');

logger.level = 'warn';
var argv = process.argv;
var parseArg = (ashort, along, action, result) => {
    argv = argv.reduce((acc,a,i) => {
        if (a === ashort || a === along) {
            result = action(acc, a, i);
        } else {
            acc.push(a);
        }
        return acc;
    }, []);
    return result;
};
var help = parseArg('-h', '--help', (acc,a,i) => true, false);
var lang = parseArg('-l', '--language', (acc,a,i) => argv[i+1], 'pli');
var vname = parseArg('-v', '--voice', (acc,a,i) => argv[i+1], 'aditi');
var cache = parseArg('-c', '--cache', (acc,a,i) => argv[i+1], 'common');
var usage = parseArg('-u', '--usage', (acc,a,i) => argv[i+1], 'recite');
var fnIn = parseArg('-i', '--input', (acc,a,i) => argv[i+1], 'stdin');
var fdIn = !fnIn || fnIn === 'stdin' ? 0 : fs.openSync(fnIn, 'r');
var fnOut = parseArg('-o', '--output', (acc,a,i) => argv[i+1], null);
for (var i=0; i<argv.length; i++) {
    var arg = argv[i];
    if (arg.startsWith('-')) {
        console.error(`unknown argument:${arg}`);
        process.exit(E_ARG_INVALID);
    }
}

if (help) {
    console.log(`Voice command line utility v${version}
=====================================
Converts specified text into sound

Parameters:
    -h --help       show this listing
    -l --language   input language ('pli')
    -v --voice      voice name ('aditi')
    -c --cache      sound cache ('common')
    -u --usage      voice usage ('recite', 'navigate', 'review')
    -i --input      input file ('stdin')
    -o --output     output file (default is to play sound)

Arguments:`);
    console.log(`    help\t: ${help}`);
    console.log(`    lang\t: ${lang}`);
    console.log(`    voice\t: ${vname}`);
    console.log(`    cache\t: ${cache}`);
    console.log(`    usage\t: ${usage}`);
    console.log(`    input\t: ${fdIn ? fnIn : 'stdin'}`);
    console.log(`    output\t: ${fnOut ? fnOut : '(play sound)'}`);
    console.log(`    text\t: ${text}`);
    process.exit(0);
}

(async function() { try {
    var text = fs.readFileSync(0).toString();
    console.error(`text\t: ${text}`);
    var voice = Voice.createVoice(vname);
    if (voice == null) {
        throw new Error(`unknown voice name:${vname}`);
    }
    var result = await voice.speak(text, {
        usage,
    });
    var cmd = fnOut
        ? `ffmpeg -i ${result.file} -y ${fnOut}`
        : `ffplay -nodisp -autoexit ${result.file}`;
    console.error(cmd);
    execSync(cmd);
    process.exit(0);
} catch(e) {
    console.error(e.stack);
    process.exit(E_EXCEPTION);
}})();
