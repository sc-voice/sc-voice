(typeof describe === 'function') && describe("sutta-searcher", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        SuttaSearcher,
    } = require("../index");
    const LANG = 'en';

    it("asdf", function(done) {
    done(); return; //TODO
        (async function() { try {
            var searcher = await new SuttaSearcher().initialize();
            var sutta_wc = {};
            for (var i = 1; i <= 152; i++) {
                var sutta_uid = `mn${i}`;
                sutta_wc[sutta_uid] = await searcher.wordCount(sutta_uid, LANG);
            }
            var common = {};
            Object.keys(sutta_wc).forEach(key => {
                var wc = sutta_wc[key];
                Object.keys(wc).forEach(key => {
                    common[key] = 1 + (common[key] || 0);
                });
            });
            console.log(Object.keys(common).length);
            var stats = new Array(152).fill(0);
            Object.keys(common).reduce((acc, key) => {
                var freq = common[key];
                acc[freq] = 1 + (acc[freq] || 0);
                return acc;
            }, stats);
            console.log(JSON.stringify(stats));
            var searchWords = ['charnel']; // mn10:4 mn13:4
            var searchWords = ['fear','terror']; // mn4:16
            var searchWords = ['hate']; // mn4:16
            var searchWords = ['leaking']; // mn81:2
            var searchWords = ['red', 'white', 'blue', 'yellow']; // mn77:19
            var searchWords = ['root', 'of', 'suffering']; // mn1:2 mn9:10 and 36 suttas!
            var searchWords = ['relishing']; // mn38:8 mn148:8
            var searchWords = ['anger']; // mn21:9
            var searchWords = ['fire']; mn96:19
            var searchWords = ['fire','earth','air','water']; //mn28:12  mn140:11
            var searchWords = ['water']; //mn28:21  mn119:21
            var found = Object.keys(sutta_wc).reduce((acc,key) => {
                var wc = sutta_wc[key];

                var match = searchWords.reduce((a,w) => Math.min(a, (wc[w] || 0)), 1000);
                match && (acc[key] = match);
                return acc;
            }, {});
            console.log(found, Object.keys(found).length);

            done(); 
        } catch(e) {done(e);} })();
    });

})
