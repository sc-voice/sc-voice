(typeof describe === 'function') && describe("sutta-central-api", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        SuttaCentralApi,
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
    const SUTTAPLEX_AN2_12 = {
        acronym: null,
        volpages: null,
        uid: 'an2.11-20',
        blurb: null,
        difficulty: null,
        original_title: 'Adhikaraṇa Vagga',
        root_lang: 'pli',
        type: 'text',
        from: null,
        translated_title: '',
        parallel_count: 7,
        biblio: null,
        num: 1,
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
            var scr = await new SuttaCentralApi().initialize();
            var scid = 'snp1.8';
            var language = 'en';
            var result = await scr.loadSutta('snp1.8','en');
            var suttaplex = result.suttaplex;
            should(suttaplex).properties(SUTTAPLEX_SNP1_8);
            var translations = suttaplex.translations;
            should(translations).instanceOf(Array);
            should.deepEqual(translations, TRANSLATIONS_SNP1_8); done();
        } catch(e) {done(e);} })();
    });
    it("TESTTESTloadSutta(opts) returns english translations for Snp1.8", function(done) {
        (async function() { try {
            var scr = await new SuttaCentralApi().initialize();
            var scid = 'snp1.8';
            var language = 'en';
            var sutta = await scr.loadSutta({
                scid:'snp1.8',
                language: 'en', 
                translator: 'mills'
            });
            should(sutta).instanceOf(Sutta);
            should.deepEqual(Object.keys(sutta).sort(), [
                'metaarea', 'sections', 'suttaplex',
            ].sort());

            var suttaplex = sutta.suttaplex;
            should(suttaplex).properties(SUTTAPLEX_SNP1_8);
            var translations = suttaplex.translations;
            should(translations).instanceOf(Array);
            should.deepEqual(translations, TRANSLATIONS_SNP1_8);
            var translation = suttaplex.translations[0];
            var segments = sutta.segments;
            var i = 0;
            should(segments[i].scid).match(/snp1.8:0.1/um);
            should(segments[i].en).match(/Sutta Nipāta 1/um);
            should(segments[i].pli).match(/Sutta Nipāta 1/um);
            i += 1;
            should(segments[i].scid).match(/snp1.8:0.2/um);
            should(segments[i].en).match(/Loving-kindness/um);
            should(segments[i].pli).match(/Metta Sutta/um);
            i += 1;
            should(segments[i].scid).match(/snp1.8:1/um);
            should(segments[i].en).match(/What should[^]*well content/um);
            i += 9;
            should(segments[i].scid).match(/snp1.8:10/um);
            should(segments[i].en).match(/But when on[^]*no more to be reborn./um);
            should(sutta.metaarea).match(/<p>This translation[^]*No rights reserved.[^]*/um);
            should(segments.length).equal(12);
            done();
        } catch(e) {done(e);} })();
    });
    it("loadSutta(opts) returns Error if sutta not found", function(done) {
        (async function() { try {
            var scr = await new SuttaCentralApi().initialize();

            // implausible sutta
            var err = null;
            try {
                var result = await scr.loadSutta('nonsense-sutta-id');
                console.error(result);
            } catch(e) {
                err = e;
            }
            should(err).instanceOf(Error);

            // plausible but not existing
            var err = null;
            try {
                var result = await scr.loadSutta('mn911');
                console.error(result);
            } catch(e) {
                err = e;
            }
            should(err).instanceOf(Error);

            // plausible but not existing
            var err = null;
            try {
                var result = await scr.loadSutta('an2.911');
                //console.error(result);
            } catch(e) {
                err = e;
            }
            should(err).instanceOf(Error);

            done();
        } catch(e) {done(e);} })();
    });
    it("loadSutta(opts) returns an2.12 as part of an2.11-20", function(done) {
        (async function() { try {
            var scr = await new SuttaCentralApi().initialize();
            var language = 'en';
            var sutta = await scr.loadSutta('an2.12');
            should(sutta).instanceOf(Sutta);
            should(sutta.suttaplex.uid).equal('an2.11-20');
            var suttaplex = sutta.suttaplex;
            should(suttaplex).properties(SUTTAPLEX_AN2_12);
            var translations = suttaplex.translations;
            should(translations).instanceOf(Array);
            should(translations.length).equal(2); // sujato, thanissaro
            var segments = sutta.segments;
            should(segments.length).equal(169);
            should(segments[0].scid).match(/an2.11-20:0.1/um);
            should(segments[0].en).match(/Numbered Discourses 2/um);
            should(segments[9].scid).match(/an2.11-20:11.1.7/um);
            should(segments[9].en).match(/Reflecting like this[^]*keeping themselves pure./um);
            should(sutta.metaarea).equal(undefined);
            done();
        } catch(e) {done(e);} })();
    });
    it("expandAbbreviation(abbr) expands abbreviation", function(done) {
        (async function() { try {
            var scr = await new SuttaCentralApi().initialize();
            should.deepEqual(scr.expandAbbreviation('sk'), [
              "Sk",
              "Sekhiya"
            ]);
            done();
        } catch(e) {done(e);} })();
    });
    it("loadSutta(opts) returns same sutta as Pootl", function(done) {
        (async function() { try {
            var scr = await new SuttaCentralApi().initialize();
            var sutta = await scr.loadSutta("mn1", "en", "sujato");
            var suttaPootl = await SuttaFactory.loadSuttaPootl('mn1');

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
            should.deepEqual(Object.keys(sutta).sort(), [
                'suttaplex', 'sections',
            ].sort());
            should.deepEqual(Object.keys(sutta.sections), Object.keys(suttaPootl.sections));
            var scrs1 = sutta.sections[1];
            var scrp1 = suttaPootl.sections[1];
            var nSegs = scrp1.segments.length;
            should.deepEqual(scrs1.segments.length, nSegs);
            var nCmp = null;
            should.deepEqual(scrs1.segments.slice(0,nCmp), scrp1.segments.slice(0,nCmp));
            should.deepEqual(sutta.sections, suttaPootl.sections);

            done();
        } catch(e) { done(e); } })();
    });
})
