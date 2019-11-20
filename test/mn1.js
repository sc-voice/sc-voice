(typeof describe === 'function') && describe("mn1", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { logger } = require('rest-bundle');
    const {
        Playlist,
        Section,
        Sutta,
        SuttaStore,
        SuttaFactory,
        SuttaCentralId,
        SuttaCentralApi,
        Voice,
        Words,
    } = require("../index");
    const LOCAL = path.join(__dirname, '../local');
    const SC = path.join(LOCAL, 'sc');
    const logLevel = false;

    var suttaStore = new SuttaStore({logLevel});

    it("loadSutta(scid) parses mn1/bodhi", function(done) {
        (async function() { try {
            var scapi = await new SuttaCentralApi().initialize();
            var factory = new SuttaFactory({
                suttaCentralApi: scapi,
                logLevel,
            });
            var sutta = await factory.loadSutta({
                scid: 'mn1',
                translator: 'bodhi',
                language: 'en',
            });
            should.deepEqual(Object.keys(sutta).sort(), [
                'translation', 'suttaCode', 'sutta_uid', 'author_uid', 
                'metaarea', 'sections', 'support', 'suttaplex','lang',
                'author', 'titles',
            ].sort());
            should(sutta.suttaCode).equal('mn1/en/bodhi');
            should(sutta.support.value).equal('Legacy');
            should(sutta.metaarea).match(/.*Bhikkhu Bodhi,[^]*Blake Walsh.*/);
            should(sutta.suttaplex).properties({
                type:'text',
                root_lang: 'pli',
            });
            should(sutta.suttaplex.translated_title).match(/The Root of All Things/);
            done();
        } catch(e) { done(e); } })();
    });
    it("expandSutta(sutta) expands mn1", function(done) {
        this.timeout(10*1000);
        (async function() { try {
            await suttaStore.initialize();
            var sutta = await suttaStore.loadSutta('mn1');
            should(sutta.lang).equal('en');
            var factory = new SuttaFactory({logLevel});
            should.deepEqual(Object.keys(sutta).sort(), [
                'translation', 'suttaCode', 'sutta_uid', 'author_uid', 
                'titles',
                'sections', 'support', 'suttaplex', 'lang', 'author',
            ].sort());
            var sutta2 = factory.expandSutta(sutta);
            should(sutta2).instanceOf(Sutta);
            should.deepEqual(Object.keys(sutta2).sort(), [
                'translation', 'suttaCode', 'sutta_uid', 'author_uid', 
                'sections', 'support', 'suttaplex', 'lang', 'author',
                'titles',
            ].sort());
            should(sutta2.suttaplex.blurb)
                .match(/^The Buddha[^]*without attachment.$/um);
            should(sutta2.author_uid).match('sujato');
            should(sutta2.lang).equal('en');
            var sections = sutta2.sections;
            should(sections.length).equal(10);
            should.deepEqual(sections.map(section => section.expandable), [
                false, false, false, false, false, false, 
                false, false, false, false,
            ]);
            should.deepEqual(sections.map(s => s.segments.length), [
                2, 10, 98, 97, 97, 97, 97, 97, 97, 148,
            ]);
            should.deepEqual(sections.map(section => section.expanded), [
                false, false, 
                true, true, true, true, true, true, true, true,
            ]);
            var sectSegs = sections.reduce((acc,section) => {
                section.segments.forEach(seg => acc.push(seg));
                return acc;
            }, []);
            should.deepEqual(sectSegs, sutta2.segments);

            var jsonPath = path.join(__dirname, 
                '../public/sutta/test1/en/sujato');
            fs.writeFileSync(jsonPath, JSON.stringify(sutta2, null, 2));

            done();
        } catch(e) { done(e); } })();
    });
    it("speak() generates mn1 sounds", function(done) {
        console.log("mn1.speak()  may take 1-2 minutes...");
        this.timeout(120*1000); 
        /*
         * This is real-world system test that exercises and requires:
         * 1. AWS Polly
         * 2. Internet connection
         * 3. An actual section of MN1
         * 4. The local sound cache
         * 5. >5MB of local disk for sound storage
         */
        (async function() { try {
            var msStart = Date.now();
            var suttaCentralApi = await new SuttaCentralApi().initialize();
            this.suttaFactory = new SuttaFactory({
                suttaCentralApi,
                autoSection: true,
            });
            var voice = Voice.createVoice({
                name: "amy",
                localeIPA: "pli",
            });
            var store = await new SuttaStore({
                suttaCentralApi,
                suttaFactory,
                voice,
            }).initialize();
            var pl = await store.createPlaylist({
                pattern: 'mn1',
                languages: ['en'], // speaking order 
            });
            var result = await pl.speak({
                voices: {
                    en: voice,
                },
                volume: 'test-mn1',
            });
            should(result.signature.guid)
                .match(/261231109fb4d82fc996ea6a0f916903/);
            console.log(`mn1.speak() done`, ((Date.now() - msStart)/1000).toFixed(1));
            done();
        } catch(e) { done(e); } })();
    });
});

