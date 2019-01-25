#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
    Words,
} = require('../index');

var words = new Words();
var opts = { 
    words,
};

var argv = process.argv[1].match(__filename) && process.argv || [];

(async function() { try {
    var langOpt = argv.find(a => /--lang=/.test(a));
    var lang = langOpt && langOpt.substring(7) || 'en';
    var text = fs.readFileSync(0).toString();
    var lines = text.split('\n');
    var dict = {};
    lines.forEach(line => {
        if (line) {
            var tokens = words.tokenize(line);
            tokens.forEach(token => {
                word = token.toLowerCase();
                if (!dict[word]) {
                    var wi = words.wordInfo(word);
                    if (!wi || wi.language !== 'pli') {
                        dict[word] = true;
                    }
                }
            });
        }
    });
    Object.keys(dict).sort().forEach(word => {
        console.log(`"${word}": { "language": lang },`);
    });
} catch(e) {
    console.log(e.stack);
} })();





