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

    const SUTTAPLEX_SNP1_8 = {
        acronym: 'Snp 1.8',
        volpages: 'Snp 25',
        uid: 'snp1.8',
        blurb: null,
        difficulty: null,
        original_title: 'Metta Sutta',
        root_lang: 'pli',
        type: 'text',
        from: null,
        translated_title: 'Loving-kindness',
        parallel_count: 1,
        biblio: null,
        num: 8,
    };
    const TRANSLATIONS_SNP1_8 = [{
        author: 'Laurence Khantipalo Mills',
        author_short: 'Mills',
        author_uid: 'mills',
        id: 'en_snp1.8_mills',
        lang: 'en',
        lang_name: 'English',
        segmented: false,
        title: 'Loving-kindness',
    }];

    it("TESTTESTloadSutta(opts) returns list of english translations for Snp1.8", function(done) {
        (async function() { try {
            var scr = await new SCRest().initialize();
            var scid = 'snp1.8';
            var language = 'en';
            var result = await scr.loadSutta('snp1.8','en');
            var suttaplex = result.suttaplex;
            should(suttaplex).properties(SUTTAPLEX_SNP1_8);
            var translations = suttaplex.translations;
            should(translations).instanceOf(Array);
            should.deepEqual(translations, TRANSLATIONS_SNP1_8);
            done();
        } catch(e) {done(e);} })();
    });
    it("TESTTESTloadSutta(opts) returns english translations for Snp1.8", function(done) {
        (async function() { try {
            var scr = await new SCRest().initialize();
            var scid = 'snp1.8';
            var language = 'en';
            var result = await scr.loadSutta({
                scid:'snp1.8',
                language: 'en', 
                translator: 'mills'
            });
            var suttaplex = result.suttaplex;
            should(suttaplex).properties(SUTTAPLEX_SNP1_8);
            var translations = suttaplex.translations;
            should(translations).instanceOf(Array);
            should.deepEqual(translations, TRANSLATIONS_SNP1_8);
            var translation = result.translation;
            should(translation.uid).equal( 'snp1.8');
            should(translation.lang).equal( 'en');
            should(translation.author_uid).equal( 'mills');
            should(translation.author_short).equal( 'Mills');
            should(translation.author).equal( 'Laurence Khantipalo Mills');
            var segments = result.segments;
            should(segments.length).equal(10);
            should(segments[0].scid).match(/snp1.8:1/um);
            should(segments[0].en).match(/What should[^]*well content/um);
            should(segments[9].scid).match(/snp1.8:10/um);
            should(segments[9].en).match(/But when on[^]*no more to be reborn./um);
            should(result.metaarea).match(/<p>This translation[^]*No rights reserved.[^]*/um);
            done();
        } catch(e) {done(e);} })();
    });
    it("TESTTESTexpand(abbr) expands abbreviation", function(done) {
        (async function() { try {
            var scr = await new SCRest().initialize();
            should.deepEqual(scr.expand('sk'), [
              "Sk",
              "Sekhiya"
            ]);
            done();
        } catch(e) {done(e);} })();
    });
})
