#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
    PoParser,
    SegDoc,
} = require('../index');

var parser = new PoParser();

(async function() { try {
    var files = await parser.files({
        root: path.join(__dirname, '../local/sc/mn/'),
    });
    files.slice(1,21).forEach(file => {
        (async function() { try {
            var segDoc = await parser.parse(file);
            var excerpt = segDoc.excerpt({
                end:2,
                prop: "pli",
            });
            console.log(excerpt.join(' '));
        } catch(e) {
            console.log(e.stack);
        }})();
    });
} catch(e) {
    console.log(e.stack);
} })();





