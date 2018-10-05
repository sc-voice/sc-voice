#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const logger = require('rest-bundle').logger;
const {
    PoParser,
    Sutta,
    SuttaFactory,
    SuttaCentralApi,
    Words,
} = require('../index');


(async function() { try {
    logger.level = 'warn';
    var parser = new PoParser();
    var words = new Words();
    var suttaCentralApi = new SuttaCentralApi();
    var factory = await new SuttaFactory({
        suttaCentralApi,
    }).initialize();
    var dict = {};
    var translator = 'horner';

    var files = await parser.files(); // supported files
    var folders = {};
    var root = path.join(__dirname, '..', 'local', 'sc');
    for (var i = 0; i < files.length; i++) {
        var fpath = files[i];
        var fname = path.basename(fpath);
        var folder = path.dirname(fpath).substring(root.length);
        folders[folder] = 1 + (folders[folder] || 0);
    };
    //fs.writeFileSync(dictname, dictOut);
    //console.log(JSON.stringify(folders, null, 2));
    var mn1 = await factory.loadSutta('mn1');
    var freq = mn1.segments.reduce((acc, seg) => {
        words.tokenize(seg.en.toLowerCase()).forEach(t => {
            if (words.isWord(t)) {
                acc[t] = 1 + (acc[t] || 0);
            }
        });
        return acc;
    }, {});
    console.log(freq);
} catch(e) {
    console.log('error',e.stack);
}})();
