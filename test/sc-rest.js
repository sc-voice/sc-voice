(typeof describe === 'function') && describe("sc-rest", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        SCRest,
        Segments,
        Sutta,
        SuttaFactory,
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

    it("loadSutta(opts) returns list of english translations for Snp1.8", function(done) {
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
    it("loadSutta(opts) returns english translations for Snp1.8", function(done) {
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
    it("expandAbbreviation(abbr) expands abbreviation", function(done) {
        (async function() { try {
            var scr = await new SCRest().initialize();
            should.deepEqual(scr.expandAbbreviation('sk'), [
              "Sk",
              "Sekhiya"
            ]);
            done();
        } catch(e) {done(e);} })();
    });
    it("TESTTESTloadSutta(opts) returns same sutta as Pootl", function(done) {
        (async function() { try {
            var scr = await new SCRest().initialize();
            var sutta = await scr.loadSutta("mn1", "en", "sujato");
            var suttaPootl = await SuttaFactory.loadSuttaPootl('mn1');

            if (0) { // change this to 1 to diagnose differences
                should.deepEqual(sutta.segments[0], {
                    scid: 'mn1:0.1',
                    en: 'Middle Discourses 1',
                    pli: 'Majjhima Nikāya 1'
                });
                var nSegments = suttaPootl.segments.length;
                should.deepEqual(sutta.segments[0], suttaPootl.segments[0]);
                should.deepEqual(sutta.segments[100], suttaPootl.segments[100]);
                should.deepEqual(sutta.segments[nSegments-1], suttaPootl.segments[nSegments-1]);
                should(sutta.segments.length).equal(nSegments);
                should.deepEqual(Object.keys(sutta), Object.keys(suttaPootl));
                should.deepEqual(Object.keys(sutta.sections), Object.keys(suttaPootl.sections));
                var scrs1 = sutta.sections[1];
                var scrp1 = suttaPootl.sections[1];
                var nSegs = scrp1.segments.length;
                should.deepEqual(scrs1.segments.length, nSegs);
                var nCmp = null;
                should.deepEqual(scrs1.segments.slice(0,nCmp), scrp1.segments.slice(0,nCmp));
            }
            should.deepEqual(sutta, suttaPootl);

            done();
        } catch(e) { done(e); } })();
    });
})
