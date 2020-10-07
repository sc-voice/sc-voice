(typeof describe === 'function') && describe("sutta-factory", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Section,
        SectionParser,
        Sutta,
        SuttaFactory,
        SuttaCentralId,
        SuttaCentralApi,
        SuttaStore,
        Words,
    } = require("../index");
    const {
        MLDoc,
    } = require("scv-bilara");
    const { logger } = require('log-instance');
    const SC = path.join(__dirname, '../local/sc');
    const TEST_DATA = path.join(__dirname, 'data');
    logger.logLevel = 'warn';
    this.timeout(5*1000);

    var suttaStore = new SuttaStore();
    var suttaFactory = new SuttaFactory({
        suttaLoader: opts => suttaStore.loadBilaraSutta(opts),
    });

    function testSutta(suid='an1.3') {
        var testPath = path.join(TEST_DATA, `${suid}.json`);
        var json = JSON.parse(fs.readFileSync(testPath));
        var mld = new MLDoc(json);
        var segments = mld.segments();
        return new Sutta({
            sutta_uid: suid,
            lang: mld.lang, 
            segments,
        });
    }

    it("default ctor", ()=>{
        var factory = new SuttaFactory();
        should(factory).properties({
            lang: 'en',
            prop: 'en',
        });
    });
    it("custom ctor", ()=>{
        var factory = new SuttaFactory({
            lang: 'de',
        });
        should(factory).properties({
            lang: 'de',
            prop: 'de',
        });
    });
    it("loadSutta(...) returns a Sutta from SuttaCentral api", done=>{
        (async function() { try {
            await suttaStore.initialize();
            await suttaFactory.initialize();
            var sutta = await suttaFactory.loadSutta('mn1');
            var end = 21;
            var header = sutta.excerpt({
                start: 0,
                end: 2,
                prop: 'pli',
            });
            var excerpt = sutta.excerpt({
                start: 0,
                end,
                prop: 'en',
            });
            var i = 0;
            should(excerpt[i++])
                .match(/Middle Discourses 1/); // autoterminate segment
            should(excerpt[i++])
                .match(/The Root of All Things/); // end group
            should(excerpt[i++]).match(/So I have heard./);
            should(excerpt[end-2]).match(/Why is that?/);
            should(sutta.sections).instanceOf(Array);
            should(sutta.sections[0]).instanceOf(Section);
            done();
        } catch(e) { done(e); } })();
    });
    it("loadSutta(...) returns mn1", function(done) {
        (async function() { try {
            await suttaStore.initialize();
            await suttaFactory.initialize();
            var sutta = await suttaFactory.loadSutta('mn1');
            var end = 21;
            var header = sutta.excerpt({
                start: 0,
                end: 2,
                prop: 'pli',
            });
            var excerpt = sutta.excerpt({
                start: 0,
                end,
                prop: 'en',
            });
            var i = 0;
            should(excerpt[i++])
                .match(/Middle Discourses 1/); // autoterminate segment
            should(excerpt[i++])
                .match(/The Root of All Things/); // end group
            should(excerpt[i++])
                .match(/So I have heard./);
            should(excerpt[end-2])
                .match(/Why is that?/);
            should(sutta.sections).instanceOf(Array);
            should(sutta.sections[0]).instanceOf(Section);
            done();
        } catch(e) { done(e); } })();
    });
    it("loadSutta(...) loads an3.163-182", function(done) {
        (async function() { try {
            await suttaStore.initialize();
            await suttaFactory.initialize();
            var sutta = await suttaFactory.loadSutta('an3.163-182');
            should(sutta.sections[0].segments[0].en)
                .match(/Numbered Discourses 3/);
            should(sutta.sections[0].segments[1].en)
                .match(/17. Ways of Performing Deeds/);
            done();
        } catch(e) { done(e); } })();
    });
    it("loadSutta(...) loads dn7", function(done) {
        (async function() { try {
            await suttaStore.initialize();
            await suttaFactory.initialize();
            var sutta = await suttaFactory.loadSutta('dn7');
            should(sutta.sections[0].segments[0].en)
                .match(/Long Discourses 7/);
            should(sutta.sections[0].segments[1].en)
                .match(/With Jāliya/);
            done();
        } catch(e) { done(e); } })();
    });
    it("loadSutta(...) loads sn22.1", function(done) {
        (async function() { try {
            await suttaStore.initialize();
            await suttaFactory.initialize();
            var sutta = await suttaFactory.loadSutta('sn22.1');
            should(sutta.sections[0].segments[0].en)
                .match(/Linked Discourses 22/);
            should(sutta.sections[0].segments[1].en)
                .match(/1. Nakula/);
            done();
        } catch(e) { done(e); } })();
    });
    it("supportedSuttas() returns hierarchy of supported suttas", function(done) { 
        (async function() { try {
            await suttaStore.initialize();
            await suttaFactory.initialize();
            var suttas = await suttaFactory.supportedSuttas();
            Object.keys(suttas).forEach(coll => {
                console.log(`supported Suttas ${coll}`, suttas[coll].length);
            });
            done();
        } catch(e) { done(e); } })();
    });
    it("loadSutta(...) automatically sections a Sutta", function(done) {
        (async function() { try {
            await suttaStore.initialize();
            var factory = new SuttaFactory({
                autoSection: true,
                suttaLoader: opts => suttaStore.loadBilaraSutta(opts),
            });
            should(factory.autoSection).equal(true);
            var sutta = await factory.loadSutta('sn35.66');
            should(sutta.sections).instanceOf(Array);
            should(sutta.sections.length).equal(2);
            should(sutta.sections[0].segments.length + 
                sutta.sections[1].segments.length)
                .equal(sutta.segments.length);
            should(sutta.sections[0].segments[0].en)
                .match(/Linked Discourses 35/);
            should(sutta.sections[1].segments[0].en)
                .match(/Sir, they speak of this thing/);

            var sutta = await factory.loadSutta('dn2');
            should(sutta.sections).instanceOf(Array);
            should(sutta.sections.length).equal(37);
            should(sutta.sections[0].segments.length).equal(3);
            should(sutta.sections[0].segments[0].en)
                .match(/Long Discourses 2/);
            should(sutta.sections[0].segments[1].en)
                .match(/The Fruits of the Ascetic Life/);
            should(sutta.sections[0].segments[2].en)
                .match(/A Discussion With the King/);
            should(sutta.sections[1].segments[0].en)
                .match(/So I have heard/);
            done();
        } catch(e) { done(e); } })();
    });
    it("translators(opts) returns supported translators", (done)=>{
        (async function() { try {
            await suttaStore.initialize();
            await suttaFactory.initialize();
            var factory = suttaFactory;
            const EN_TRANSLATORS = [
                'sujato',
                'brahmali',
                'bodhi',
                'thanissaro',
                'sujato-walton',
                'caf-rhysdavids',
                'horner',
            ];
            const DE_TRANSLATORS = [
                'sabbamitta',
                'mettiko',
                'geiger',
                'nyanaponika',
                'hecker',
                'nyanatiloka',
                'kusalagnana-maitrimurti-traetow',
                'franke',
                'vri',
            ];

            should.deepEqual(factory.translators(), EN_TRANSLATORS)
            should.deepEqual(factory.translators({
                language: 'en',
            }), EN_TRANSLATORS)
            should.deepEqual(factory.translators({
                language: 'de',
            }), DE_TRANSLATORS)
            should.deepEqual(factory.translators({
                translator: 'bodhi',
            }), [
                'bodhi',
                'sujato',
                'brahmali',
                'thanissaro',
                'sujato-walton',
                'caf-rhysdavids',
                'horner',
            ]);
            should.deepEqual(factory.translators({
                language: 'de',
                translator: 'sabbamitta',
            }), [
                'sabbamitta',
                'mettiko',
                'geiger',
                'nyanaponika',
                'hecker',
                'nyanatiloka',
                'kusalagnana-maitrimurti-traetow',
                'franke',
                'vri',
            ])
            should.deepEqual(factory.translators({
                language: 'de',
                translator: 'geiger',
            }), [
                'geiger',
                'sabbamitta',
                'mettiko',
                'nyanaponika',
                'hecker',
                'nyanatiloka',
                'kusalagnana-maitrimurti-traetow',
                'franke',
                'vri',
            ])
        
            done();
        } catch(e) { done(e); } })();
    });
    it("loadSutta() loads dn22/de/vri", function(done) {
        (async function() { try {
            await suttaStore.initialize();
            var suttaCentralApi = await new SuttaCentralApi().initialize();
            var factory = await new SuttaFactory({
                suttaCentralApi,
                suttaLoader: opts => suttaStore.loadBilaraSutta(opts),
            }).initialize();

            var sutta = await factory.loadSutta({
                scid: 'dn22',
                language: 'de',
                translator: 'vri',
            });

            // Bodhi translation doesn't exist, expect Sujato translation
            should(sutta.author_uid).equal('vri');
            should(sutta.sutta_uid).equal('dn22');

            done();
        } catch(e) { done(e); } })();
    });
    it("sectionSutta(...) adds sections", function(done) {
        (async function() { try {
            await suttaStore.initialize();
            await suttaFactory.initialize();
            var factory = suttaFactory;
            var sutta = testSutta('an1.3');
            should(sutta.lang).equal('de');
            should.deepEqual(
                sutta.sections.map(s=> ({
                    prop: s.prop,
                })), [{
                    prop: 'de',
                },{
                    prop: 'de',
                }]);
            var res = factory.sectionSutta(sutta);
            should(res).equal(sutta); // sutta was already sectioned

            // collapse sections and resection
            var suttaNew = testSutta('an1.3');
            var sections = suttaNew.sections;
            sections[0].segments = [
                ...sections[0].segments,
                ...sections[1].segments];
            sections.pop();
            var sectionedSutta = factory.sectionSutta(sutta);
            should(sectionedSutta).not.equal(suttaNew); 
            should.deepEqual(sectionedSutta, sutta);

            done();
        } catch(e) { done(e); } })();
    });

});

