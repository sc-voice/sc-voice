#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
    PoParser,
    Polly,
    Segments,
    Voice,
    Words,
} = require('../index');

var parser = new PoParser();
var words = new Words();

(async function() { try {
    /*
     *  Search MN suttas, extracting the second segment
     */
    var files = await parser.files({
        root: path.join(__dirname, '../local/sc/mn/'),
    });
    var nResults = 5;
    var start = 10;
    var segDocs = await Promise.all(
        files.slice(start,start+nResults).map(file => parser.parse(file))
    );
    var paliOpts = {
        language: 'pli',
    };
    var lines = segDocs.map((segDoc,i) => {
        var excerpt = segDoc.excerpt({
            start:1,
            end:2,
        });
        excerpt[0].pli.split(' ').forEach(word => words.add(word, paliOpts));
        return `${start+i}: ${excerpt[0].pli}${Words.U_EMDASH}${excerpt[0].en}.`;
    });
    var text = `SuttaCentral found ${nResults} suttas.\n`;
    text += lines.join('\n');
    console.log(text); // text to be spoken
} catch(e) {
    console.log('error',e.stack);
} })();
