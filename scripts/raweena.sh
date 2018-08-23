#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
    PoParser,
    Polly,
    SegDoc,
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
    var lines = segDocs.map((segDoc,i) => {
        var excerpt = segDoc.excerpt({
            start:1,
            end:2,
            prop: "pli",
        });
        return `${i+1}: ${excerpt[0]}.`;
    });
    var text = 'Hello, this is Roweena.\n';
    var mn = 'Majjhima Nikāya';
    text += `The first 20 suttas in the ${mn} are:\n`;
    text += lines.join('\n');
    console.log(text);

    var speak = 0;
    if (speak) {
        var polly = new Polly();
        var cache = true;
        var result = await polly.synthesizeText(text, {cache});
        console.log(result);
    }
} catch(e) {
    console.log('error',e.stack);
} })();
