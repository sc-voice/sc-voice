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
    var translator = 'thanissaro';

    var files = await parser.files(); // supported files
    for (var i = 0; i < files.length; i++) {
        var fpath = files[i];
        var fname = path.basename(fpath);
        var scid = fname.replace('.po','').replace(/([^0-9])0*/g,'$1');
        if (1 || scid.startsWith('mn')) {
            try {
                console.log(scid);
                var sutta = await factory.loadSutta({
                    scid,
                    language: 'en',
                    translator,
                });
                sutta.segments.forEach(seg => {
                    var tokens = seg.en.split(' ');
                    tokens.forEach(tok => {
                        tok = tok.toLowerCase();
                        if (words.words.hasOwnProperty(tok)) {
                            // do nothing
                        } else if (words.isWord(tok) && words.alphabet.test(tok)) {
                            dict[tok] = { 
                                language: 'en',
                            };
                        }
                    });
                });
            } catch(e) {
                console.log(e.message);
            }
        }
    };
    var dictOut = '';
    var dictkeys = Object.keys(dict);
    dictkeys.sort().forEach(key => {
        dictOut += `"${key}":{"language":"en"},\n`;
    });
    var dictname = `./local/${translator}-words.json`;
    fs.writeFileSync(dictname, dictOut);
    console.log(`${dictkeys.length} words written to ${dictname}`);
} catch(e) {
    console.log('error',e.stack);
}})();
