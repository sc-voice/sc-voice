(typeof describe === 'function') && describe("sc-rest", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        SCRest,
        Segments,
        Sutta,
        Words,
    } = require('../index');

    it("TESTTESTcreate SuttaCentral REST adapter", function(done) {
        (async function() { try {
            var scr = new SCRest();
            var scid = 'snp1.8';
            var language = 'de';
            var translator = 'mills';
            var result = await scr.getSutta('snp1.8', language, translator);
            var result = await scr.getSutta('snp1.8');
            Object.keys(result).forEach(key => {
                var json = result[key];
                console.log(`${key}: ${json && Object.keys(json) || json}`);
            });
            console.log();
            var suttaplex = result.suttaplex;
            Object.keys(suttaplex).forEach(key => {
                var json = suttaplex[key];
                console.log(`${key}: ${json && Object.keys(json) || json}`);
            });
            [
                'acronym',
                'volpages',
                'uid',
                'original_title',
                'root_lang',
                'type',
                'translated_title',
                'parallel_count',
                'num',
                'biblio',
            ].forEach(field => {
                console.log(`${field}:`,JSON.stringify(suttaplex[field]));
            });
            /*
            should(result).properties({
                scid,
                language,
                translator,
            });
            */
            done();
        } catch(e) {done(e);} })();
    });

})
