#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
    PoParser,
    Polly,
    SegDoc,
    Words,
} = require('../index');

var parser = new PoParser();
var words = new Words();

(async function() { try {
    var files = await parser.files({
        root: path.join(__dirname, '../local/sc/mn/'),
    });
    var segDocs = await Promise.all(
        files.slice(1,21).map(file => parser.parse(file))
    );
    var paliOpts = {
        language: 'pli',
    };
    var lines = segDocs.map((segDoc,i) => {
        var excerpt = segDoc.excerpt({
            start:1,
            end:2,
            prop: "pli",
        });
        excerpt[0].split(' ').forEach(word => words.add(word, paliOpts));
        return `${i+1}: ${excerpt[0]}.`;
    });
    var text = 'Hello, this is Roweena.\n';
    var mn = 'Majjhima Nikāya';
    mn.split(' ').forEach(word => words.add(word, paliOpts));
    text += `The first 20 suttas in the ${mn} are:\n`;
    text += lines.join('\n');
    console.log(text);

    var speak = 1;
    if (speak) {
        var polly = new Polly({
            words
        });
        var cache = false;
        var result = await polly.synthesizeText(text, {cache});
        console.log(result);
    }
} catch(e) {
    console.log('error',e.stack);
} })();
