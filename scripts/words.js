#!/usr/bin/env node 

const fs = require("fs");
const path = require("path");
const {
    execSync,
} = require('child_process');

const {
    Words,
} = require('../index');

var argv = process.argv[1].match(__filename) && process.argv || [];
var textOpt = argv.find(a => a === '--text');
var langOpt = argv.find(a => /--lang=/.test(a));
var lang = langOpt && langOpt.substring(7) || 'en';
var rootOpt = argv.find(a => /--root=/.test(a));
var root = rootOpt && rootOpt.substring(7) || 'local/suttas';
if (!root.startsWith('/')) {
    root = path.join(process.cwd(), root);
}
var reLang = new RegExp(`"${lang}":\\s*"`);
var words = new Words(null, {
    language: lang,
});

function processText(text, dict) {
    var lines = text.split('\n');
    if (reLang.test(text)) {
        lines = lines.reduce((acc, line) => {
            if (reLang.test(line)) {
                acc.push(line.replace(reLang,"").replace(/"\\s*$/, ""));
            }
            return acc;
        }, []);
    }
    lines.forEach(line => {
        if (line) {
            var tokens = words.tokenize(line);
            tokens.forEach(token => {
                var word = token.toLowerCase();
                word = word.replace(/’$/,'');
                if (!dict[word] && words.isWord(word)) {
                    var wi = words.wordInfo(word);
                    if (!wi) {
                        dict[word] = words.isForeignAlphabet(word) ? "pli" : lang;
                    }
                }
            });
        }
    });
}

(async function() { try {
    var dict = {};
    if (textOpt) {
        var text = fs.readFileSync(0).toString();
        processText(text, dict);
    } else {
        var cmd = `find . -name "*.json" `;
        var suttaFiles = execSync(cmd, {
            cwd: root,
        }).toString().split('\n').filter(id => !!id);
        suttaFiles.forEach(f => {
            var fpath = path.join(root, f);
            var text = fs.readFileSync(fpath).toString();
            processText(text, dict);
        });
    }

    Object.keys(dict).sort().forEach(word => {
        dict[word] === lang &&
            console.log(`"${word}": { "language": "${dict[word]}" },`);
    });
    Object.keys(dict).sort().forEach(word => {
        dict[word] !== lang &&
            console.log(`"${word}": { "language": "${dict[word]}" },`);
    });
} catch(e) {
    console.log(e.stack);
} })();





