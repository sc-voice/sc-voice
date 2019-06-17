(typeof describe === 'function') && describe("sutta-central-api", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { logger } = require('rest-bundle');
    const {
        Definitions,
        Segments,
        Sutta,
        SuttaCentralApi,
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
    const SUTTAPLEX_AN2_12_2019 = {
        acronym: null,
        volpages: 'pts-vp-pli1.53',
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
    const SUTTAPLEX_EA12_1 = {
        acronym: 'EA 12.1//T 125.12.1',
        volpages: 'T ii 568a01',
        uid: 'ea12.1',
        blurb: null,
        difficulty: null,
        original_title: ' ?',
        root_lang: 'lzh',
        type: 'text',
        from: null,
        translated_title: 'The One Way In Sūtra',
        parallel_count: 8,
        biblio: null,
        num: 96,
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
    const TRANSLATIONS_SNP1_8_2019 = [{
        author: 'Laurence Khantipalo Mills',
        author_short: 'Mills',
        author_uid: 'mills',
        id: 'en_snp1.8_mills',
        lang: 'en',
        lang_name: 'English',
        segmented: false,
        title: 'Loving-kindness',
        is_root: false,
        publication_date: "2015",
        volpage: null,
    }];
    const TRANSLATIONS_EA12_1 = [{
        author: 'Thích Nhất Hạnh, Annabel Laity',
        author_short: 'Nhất Hạnh …',
        author_uid: 'nhat_hanh-laity',
        id: 'en_ea12.1_nhat_hanh-laity',
        lang: 'en',
        lang_name: 'English',
        segmented: false,
        title: 'The One Way In Sūtra',
    }];
    const TRANSLATIONS_EA12_1_2019 = [{
        author: 'Thích Nhất Hạnh, Annabel Laity',
        author_short: 'Nhất Hạnh …',
        author_uid: 'nhat_hanh-laity',
        id: 'en_ea12.1_nhat_hanh-laity',
        lang: 'en',
        lang_name: 'English',
        segmented: false,
        title: 'The One Way In Sūtra',
        is_root: false,
        publication_date: null,
        volpage: null,
    }];
    const SCAPI_2019 = {
        apiUrl: 'http://staging.suttacentral.net/api',
    };

    it("loadSutta(opts) returns list of english translations for Snp1.8", function(done) {
        this.timeout(10*1000);
        (async function() { try {
            var scr = await new SuttaCentralApi(SCAPI_2019).initialize();
            var scid = 'snp1.8';
            var language = 'en';
            var sutta = await scr.loadSutta('snp1.8','en');
            should(sutta).instanceOf(Sutta);
            should.deepEqual(sutta.support, Definitions.SUPPORT_LEVELS.Legacy);
            var suttaplex = sutta.suttaplex;
            should(suttaplex).properties(SUTTAPLEX_SNP1_8);
            var translations = suttaplex.translations;
            should(translations).instanceOf(Array);
            should.deepEqual(translations, TRANSLATIONS_SNP1_8_2019); done();
        } catch(e) {done(e);} })();
    });
    it("loadSutta(opts) returns english translations for Snp1.8", function(done) {
        (async function() { try {
            var scr = await new SuttaCentralApi(SCAPI_2019).initialize();
            var language = 'en';
            var sutta = await scr.loadSutta({
                scid:'snp1.8',
                language: 'en', 
                translator: 'mills'
            });
            should(sutta).instanceOf(Sutta);
            should.deepEqual(Object.keys(sutta).sort(), [
                'translation', 'suttaCode', 'sutta_uid', 'author_uid', 'support', 
                'metaarea', 'sections', 'suttaplex',
            ].sort());
            should.deepEqual(sutta.support, Definitions.SUPPORT_LEVELS.Legacy);

            var suttaplex = sutta.suttaplex;
            should(suttaplex).properties(SUTTAPLEX_SNP1_8);
            var translations = suttaplex.translations;
            should(translations).instanceOf(Array);
            should.deepEqual(translations, TRANSLATIONS_SNP1_8_2019);
            var translation = suttaplex.translations[0];
            var segments = sutta.segments;
            var i = 0;
            should(segments[i].scid).match(/snp1.8:0.1/um);
            should(segments[i].en).match(/Sutta Nipāta 1/um);
            i += 1;
            should(segments[i].scid).match(/snp1.8:0.2/um);
            should(segments[i].en).match(/Loving-kindness/um);
            should(segments[i].pli).match(/Metta Sutta/um);
            i += 1;
            should(segments[i].scid).match(/snp1.8:1.0.1$/um);
            should(segments[i].en).match(/Sutta Nipāta/um);
            i += 1;
            should(segments[i].scid).match(/snp1.8:1.0.2$/um);
            should(segments[i].en).match(/Mettā Sutta/um);
            i += 1;
            should(segments[i].scid).match(/snp1.8:1.0.3$/um);
            should(segments[i].en).match(/1.8. Loving-kindness/um);
            i += 1;
            should(segments[i].scid).match(/snp1.8:1.1.4$/um);
            should(segments[i].en).match(/What should[^]*well content/um);
            i += 9;
            should(segments[i].scid).match(/snp1.8:1.10.13$/um);
            should(segments[i].en).match(/But when on[^]*no more to be reborn./um);
            should(sutta.metaarea).match(/<p>This translation[^]*No rights reserved.[^]*/um);
            should(segments.length).equal(15);
            done();
        } catch(e) {done(e);} })();
    });
    it("loadSutta(opts) returns english translations for ea12.1", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var scr = await new SuttaCentralApi(SCAPI_2019).initialize();
            var language = 'en';
            var sutta = await scr.loadSutta({
                scid:'ea12.1',
                language: 'en', 
            });
            should(sutta).instanceOf(Sutta);
            should.deepEqual(Object.keys(sutta).sort(), [
                'translation', 'suttaCode', 'sutta_uid', 'author_uid', 'support', 
                'metaarea', 'sections', 'suttaplex',
            ].sort());
            should.deepEqual(sutta.support, Definitions.SUPPORT_LEVELS.Legacy);

            var suttaplex = sutta.suttaplex;
            should(suttaplex).properties(SUTTAPLEX_EA12_1);
            var translations = suttaplex.translations;
            should(translations).instanceOf(Array);
            should.deepEqual(translations, TRANSLATIONS_EA12_1_2019);
            var translation = suttaplex.translations[0];
            var segments = sutta.segments;
            var i = 0;
            should(segments[i].scid).match(/ea12.1:0.1/um);
            should(segments[i].en).match(/Ekottarikāgama \(1st\) 12.1/um);
            i += 1;
            should(segments[i].scid).match(/ea12.1:0.2/um);
            should(segments[i].en).match(/The One Way In Sūtra/um);
            should(segments[i].lzh).match(/ ?/um);
            i += 1;
            should(segments[i].scid).match(/ea12.1:1.0.1$/um);
            should(segments[i].en).match(/Ekottarikāgama 12.1/um);
            //should(segments[i].en).match(/^Introduction$/um);
            i += 1;
            should(segments[i].scid).match(/ea12.1:1.0.2/um);
            should(segments[i].en).match(/^The One Way In/um);
            i += 1;
            should(segments[i].scid).match(/ea12.1:2.0.3/um);
            should(segments[i].en).match(/^Introduction/um);
            i += 1;
            should(segments[i].scid).match(/ea12.1:2.0.4/um);
            should(segments[i].en).match(/^I heard these words[^]*assembly of monks:/um);
            should(sutta.metaarea).match(/Translated from Sanskrit[^]*Bhikkhu Sujato[^]*/um);
            should(segments.length).equal(54);
            done();
        } catch(e) {done(e);} })();
    });
    it("loadSutta(opts) returns Error if sutta not found", function(done) {
        (async function() { try {
            var scr = await new SuttaCentralApi(SCAPI_2019).initialize();

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
        done(); return; // TBD staging problem dbg
        (async function() { try {
            var scr = await new SuttaCentralApi(SCAPI_2019).initialize();
            var language = 'en';
            var sutta = await scr.loadSutta('an2.12');
            should(sutta).instanceOf(Sutta);
            should.deepEqual(sutta.support, Definitions.SUPPORT_LEVELS.Supported);
            should(sutta.suttaplex.uid).equal('an2.11-20');
            should(sutta.sutta_uid).equal('an2.11-20');
            var suttaplex = sutta.suttaplex;
            should(suttaplex).properties(SUTTAPLEX_AN2_12_2019);
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
            var scr = await new SuttaCentralApi(SCAPI_2019).initialize();
            should.deepEqual(scr.expandAbbreviation('sk'), [
              "Sk",
              "Sekhiya"
            ]);
            done();
        } catch(e) {done(e);} })();
    });
    it("loadSutta(opts) loads MN79", function(done) {
        done(); return; // TBD staging problem dbg
        this.timeout(5*1000);
        logger.level = 'info';
        (async function() { try {
            var scr = await new SuttaCentralApi(SCAPI_2019).initialize();
            var sutta = await scr.loadSutta("mn79", "en", "sujato");

            should.deepEqual(sutta.segments[0], {
                scid: 'mn79:0.1',
                en: 'Middle Discourses 79',
                pli: 'Majjhima Nikāya 79'
            });
            should.deepEqual(sutta.segments[100], {
                en: "“What do you think, Udāyī? ",
                pli: "“Taṃ kiṃ maññasi, udāyi, ",
                scid: "mn79:16.1",
            });
            should(sutta.segments.length).equal(200);
            should.deepEqual(Object.keys(sutta).sort(), [
                'suttaCode', 'translation', 'sutta_uid', 'author_uid', 'support', 
                'sections', 'suttaplex',
                //'metaarea', 
            ].sort());

            done();
        } catch(e) { done(e); } })();
    });
    it("loadSutta(opts) returns same sutta as Pootl", function(done) {
        done(); return; // Pootl content is obsolete and now differs from current
        this.timeout(5*1000);
        (async function() { try {
            var scr = await new SuttaCentralApi(SCAPI_2019).initialize();
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
                'suttaCode', 'translation', 'sutta_uid', 'author_uid', 'support', 
                'sections', 'suttaplex',
                //'metaarea', 
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
    it("suttaFromHtml(html, opts) should parse HTML", function(done) {
        (async function() { try {
            var scr = await new SuttaCentralApi(SCAPI_2019).initialize();
            var text = [
                'hello',
                'there\n',
            ].join('\n');
            var sutta = scr.suttaFromHtml(text, {
                uid: 'sn12.23',
                suttaplex: {
                    uid: 'sn12.23',
                    original_title: 'Sudattasutta',
                },
                translation: {
                    title: '8. Mit Sudatta',
                    author_uid: 'sabbamitta',
                    lang: 'de',
                },
            });
            should.deepEqual(Object.keys(sutta).sort(), [
                'author_uid', 'sections', 'support', 'suttaCode', 'sutta_uid', 
                'translation',
            ].sort());
            should(sutta.author_uid).equal('sabbamitta');
            should(sutta.sections.length).equal(2);
            should(sutta.sutta_uid).equal('sn12.23');
            should(sutta.segments.length).equal(4);
            should.deepEqual(sutta.segments[0], {
                scid: 'sn12.23:0.1',
                de: 'Saṃyutta Nikāya 12.23',
            });
            should.deepEqual(sutta.segments[1], {
                scid: 'sn12.23:0.2',
                de: '8. Mit Sudatta',
                pli: 'Sudattasutta',
            });
            should.deepEqual(sutta.segments[2], {
                scid: 'sn12.23:1.0.1',
                de: 'hello',
            });
            should.deepEqual(sutta.segments[3], {
                scid: 'sn12.23:1.0.2',
                de: 'there',
            });
            done();
        } catch(e) { done(e); } })();
    });
})
