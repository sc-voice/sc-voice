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

(async function() { try {
    var text = fs.readFileSync(0).toString();
    var dict = {};
    text.split('\n').forEach(line => {
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
        console.log(`"${word}": { "language": "de" },`);
    });
} catch(e) {
    console.log(e.stack);
} })();





