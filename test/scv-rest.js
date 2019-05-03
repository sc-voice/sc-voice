(typeof describe === 'function') && describe("scv-rest", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const supertest = require('supertest');
    const jwt = require('jsonwebtoken');
    const {
        logger,
        UserStore,
    } = require('rest-bundle');
    logger.level = 'info';
    const {
        Definitions,
        ScvRest,
        Section,
        SoundStore,
        Sutta,
        SuttaCentralApi,
        SuttaCentralId,
        SuttaFactory,
        Words,
    } = require("../index");
    const TEST_ADMIN = {
        username: "test-admin",
        isAdmin: true,
    };
    const Queue = require('promise-queue');
    const PUBLIC = path.join(__dirname, '../public');
    const SC = path.join(__dirname, '../local/sc');
    const app = require("../scripts/sc-voice.js"); // access cached instance 

    it("ScvRest must be initialized", function(done) {
        (async function() { try {
            var scvRest = app.locals.scvRest;
            await(scvRest.initialize());
            should(scvRest.initialized).equal(true);
            done();
        } catch(e) {done(e);} })();
    });
    it("ScvRest maintains a SoundStore singleton", function() {
        var scvRest = app.locals.scvRest;
        should(scvRest).instanceOf(ScvRest);
        var soundStore = scvRest.soundStore;
        should(soundStore).instanceOf(SoundStore);
        should(scvRest.voicePali.soundStore).equal(soundStore);
        should(scvRest.voicePali.services.recite.soundStore).equal(soundStore);
        should(scvRest.voicePali.services.review.soundStore).equal(soundStore);
    });
    it("GET /identity returns restbundle identity JSON", function(done) {
        var async = function* () { try {
            var response = yield supertest(app).get("/scv/identity").expect((res) => {
                res.statusCode.should.equal(200);
                var keys = Object.keys(res.body).sort();
                should.deepEqual(keys, [
                    'diskavail', 'diskfree', 'disktotal',
                    'freemem', 'hostname', 'loadavg', 'name', 
                    'package', 'totalmem', 'uptime', 'version'
                ]);
            }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /sutta/mn1/en/sujato returns sutta", function(done) {
        this.timeout(5*1000);
        var async = function* () { try {
            var response = yield supertest(app).get("/scv/sutta/mn1/en/sujato").expect((res) => {
                res.statusCode.should.equal(200);
                var sutta = res.body;
                should.deepEqual(Object.keys(sutta).sort(), [
                    'translation', 'suttaCode', 'sutta_uid', 'author_uid', 
                    "sections", "suttaplex", "support",
                ].sort());
                should.deepEqual(sutta.support, Definitions.SUPPORT_LEVELS.Supported);
                var sections = sutta.sections;
                should(sections.length).equal(10);
                should(sections[2].expandable).equal(false);
                should(sections[2].expanded).equal(true);
                should(sections[2].prefix).equal("");
                should(sections[2].prop).equal("en");
                should.deepEqual(sections[2].template, []);
                should(sections[2].title).match(/.Take an uneducated.*/u);
                should(sections[2].type).equal("Section");
                should.deepEqual(sections[2].values, []);
            }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /sutta/mn100/en/sujato returns sutta", function(done) {
        this.timeout(5*1000);
        var async = function* () { try {
            var response = yield supertest(app).get("/scv/sutta/mn100/en/sujato").expect((res) => {
                res.statusCode.should.equal(200);
                should(res.body).properties([
                    "sections"
                ]);
                var sections = res.body.sections;
                should(sections.length).equal(2);
                should.deepEqual(sections[0], {
                    expandable: false,
                    expanded: false,
                    prefix: "",
                    prop: 'en',
                    template: [],
                    title: `Middle Discourses 100`,
                    type: 'Section',
                    values: [],
                    segments: [{
                        en: 'Middle Discourses 100',
                        pli: 'Majjhima Nikāya 100',
                        scid: 'mn100:0.1',
                    },{
                        en: 'With Saṅgārava',
                        pli: 'Saṅgāravasutta',
                        scid: 'mn100:0.2',
                    }],
                });
            }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /recite/section/mn1/en/sujato/2 returns recitation", function(done) {
        this.timeout(15*1000);
        var async = function* () { try {
            var response = yield supertest(app).get("/scv/recite/section/mn1/en/sujato/2")
                .expect((res) => {
                    res.statusCode.should.equal(200);
                    should(res.body).properties([
                        'guid', 
                    ]);
                    should(res.body).properties({
                        language: 'en',
                        name: 'Amy',
                        section: 2,
                        sutta_uid: 'mn1',
                        translator: 'sujato', 
                        usage: 'recite', 
                    });
                }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /recite/sutta/mn100/en/sujato/1 returns recitation", function(done) {
        this.timeout(15*1000);
        var async = function* () { try {
            var response = yield supertest(app).get("/scv/recite/section/mn100/en/sujato/1")
                .expect((res) => {
                //console.log(res);
                    res.statusCode.should.equal(200);
                    should(res.body).properties([
                        'guid', 
                    ]);
                    should(res.body).properties({
                        language: 'en',
                        name: 'Amy',
                        section: 1,
                        sutta_uid: 'mn100',
                        translator: 'sujato', 
                        usage: 'recite', 
                    });
                }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /download/sutta/mn100/en/sujato/review returns download", function(done) {
        this.timeout(15*1000);
        var scvRest = app.locals.scvRest;
        var async = function* () { try {
            var apiModel = yield  scvRest.initialize()
                .then(r=>async.next(r)).catch(e=>async.throw(e));
            var response = yield supertest(app)
                .get("/scv/download/sutta/mn100/en/sujato/review")
                .expect('Content-Type', /audio\/mp3/)
                .expect('Content-Disposition', /attachment; filename=mn100-en-sujato.mp3/)
                .end((e,r) => e ? async.throw(e) : async.next(r));
            var contentLength = Number(response.headers['content-length']);
            should(contentLength).above(9400000);
            should(contentLength).below(9600000);
            should(response.statusCode).equal(200);
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /download/playlist/pli+en/amy/an3.76-77 returns mp3", function(done) {
        var scvRest = app.locals.scvRest;
        this.timeout(20*1000);
        var async = function* () { try {
            var apiModel = yield  scvRest.initialize()
                .then(r=>async.next(r)).catch(e=>async.throw(e));
            var res = yield supertest(app)
                .get("/scv/download/playlist/pli+en/amy/an3.76-77")
                .expect('Content-Type', /audio\/mp3/)
                .expect('Content-Disposition', 
                    'attachment; filename=an3.76-77_pli+en_amy.mp3')
                .end((e,r) => e ? async.throw(e) : async.next(r));
            var contentLength = Number(res.headers['content-length']);
            should(contentLength).above(3400000);
            should(contentLength).below(4600000);
            should(res.statusCode).equal(200);
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /sutta/an2.1-10/en/sujato returns sutta", function(done) {
        done(); return; // TODO
        var async = function* () { try {
            var response = yield supertest(app)
                .get("/scv/sutta/an2.1-10/en/sujato").expect((res) => {
                res.statusCode.should.equal(200);
                should(res.body).properties([
                    "sections"
                ]);
                var sections = res.body.sections;
                should(sections.length).equal(2);
                should.deepEqual(sections[0], {
                    expandable: false,
                    prefix: "",
                    prop: 'en',
                    template: [],
                    title: `Middle Discourses 100${Words.U_ELLIPSIS}`,
                    type: 'Section',
                    values: [],
                    segments: [{
                        en: 'Middle Discourses 100',
                        pli: 'Majjhima Nikāya 100',
                        scid: 'mn100:0.1',
                    },{
                        en: 'With Saṅgārava',
                        pli: 'Saṅgāravasutta',
                        scid: 'mn100:0.2',
                    }],
                });
            }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("Queue handles promises", function(done) {
        (async function() { try {
            var monitor = [];
            var q = new Queue(3, Infinity);
            var doit = (ms) => new Promise((resolve, reject) => {
                setTimeout(() => {
                    monitor.push(ms);
                    resolve(ms);
                }, ms);
            });
            var queuedPromises = [1,2,3,4,5,6,7].map(i => q.add(() => doit(i)));
            var all = Promise.all(queuedPromises);
            should(q.getQueueLength()).equal(4); // waiting
            should(q.getPendingLength()).equal(3); // processing
            should.deepEqual(monitor, []);
            var r1 = await(queuedPromises[1]);
            should(r1).equal(2);
            should.deepEqual(monitor, [1,2]);
            should(q.getQueueLength()).equal(2); // waiting
            should(q.getPendingLength()).equal(3); // processing
            var r2 = await(queuedPromises[2]);
            should(r2).equal(3);
            should(q.getQueueLength()).equal(1); // waiting
            should(q.getPendingLength()).equal(3); // processing
            var r3 = await(queuedPromises[3]);
            should(r3).equal(4);
            should(q.getQueueLength()).equal(0); // waiting
            should(q.getPendingLength()).equal(3); // processing
            var allResult = await(all);
            should.deepEqual(allResult, [1,2,3,4,5,6,7]);
            done();
        } catch(e) {done(e);} })();
    });
    it("GET /search/:pattern returns suttaplexes found", function(done) {
        this.timeout(10*1000);
        var async = function* () { try {
            var maxResults = 3;
            var pattern = `root of suffering`;

            var url = `/scv/search/${pattern}?maxResults=${maxResults}`;
            var response = yield supertest(app).get(url).expect((res) => {
                res.statusCode.should.equal(200);
                var {
                    method,
                    results,
                } = res.body;
                should(method).equal('phrase');
                should(results).instanceOf(Array);
                should(results.length).equal(3);
                should.deepEqual(results.map(r => r.uid),[
                    'sn42.11', 'mn105', 'mn1',
                ]);
                should.deepEqual(results.map(r => r.count),[ 5,3,2, ]);
            }).end((e,r) => e ? async.throw(e) : async.next(r));

            // use default maxResults
            var url = `/scv/search/${pattern}`;
            var response = yield supertest(app).get(url).expect((res) => {
                res.statusCode.should.equal(200);
                var {
                    method,
                    results,
                } = res.body;
                should(method).equal('phrase');
                should(results).instanceOf(Array);
                should(results.length).equal(5);
                should.deepEqual(results[0].audio,undefined);
                should.deepEqual(results.map(r => r.uid),[
                    'sn42.11', 'mn105', 'mn1', 'sn56.21', 'mn66',
                ]);
                should.deepEqual(results.map(r => r.count),[ 5,3,2,1,1 ]);
            }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /scv/play/section/... returns playable section", function(done) {
        this.timeout(30*1000);
        (async function() { try {
            var iSection = 2;
            var iVoice = 0;
            var url = `/scv/play/section/mn1/en/sujato/${iSection}/${iVoice}`;
            var res = await supertest(app).get(url);
            res.statusCode.should.equal(200);
            var section = res.body instanceof Buffer ? JSON.parse(res.body) : res.body;
            should(section.segments.length).equal(98);
            should(section.sutta_uid).equal('mn1');
            should(section.voiceLang).equal('Amy');
            should(section.voicePali).equal('Aditi');
            should(section.section).equal(iSection);
            should(section.nSections).equal(10);
            should(section.iVoice).equal(iVoice);
            should(section.language).equal('en');
            should(section.translator).equal('sujato');
            should.deepEqual(section.segments[0].audio, {});
            var testPath = path.join(PUBLIC,
                `play/section/mn1/en/sujato/${iSection}/${iVoice}`);
            fs.writeFileSync(testPath, JSON.stringify(section, null,2));
            done();
        } catch(e) {done(e);} })();
    });
    it("GET /play/segment/... returns playable segment", function(done) {
        this.timeout(30*1000);
        (async function() { try {
            var iVoice = 0;
            var scid = "mn1:0.1";
            var url = `/scv/play/segment/mn1/en/sujato/${scid}/${iVoice}`;
            var res = await supertest(app).get(url);
            res.statusCode.should.equal(200);
            var data = res.body instanceof Buffer ? JSON.parse(res.body) : res.body;
            should(data.segment.en).match(/^Middle Discourses 1/);
            should(data.segment.audio.pli).match(/6ba33aa963c46b629d0ec036d570ef19/); // no numbers

            if (0) {
                var scid = "mn1:52-74.23";
                var url = `/scv/play/segment/mn1/en/sujato/${scid}/${iVoice}`;
                var res = await supertest(app).get(url);
                res.statusCode.should.equal(200);
                var data = res.body instanceof Buffer ? JSON.parse(res.body) : res.body;
                should(data.sutta_uid).equal('mn1');
                should(data.voiceLang).equal('Amy');
                should(data.voicePali).equal('Aditi');
                should(data.iSegment).equal(299);
                should(data.section).equal(4);
                should(data.nSections).equal(10);
                should(data.iVoice).equal(iVoice);
                should(data.language).equal('en');
                should(data.translator).equal('sujato');
                should(data.segment.en).match(/^They directly know extinguishment as/);
                should(data.segment.audio.en).match(/^3f8996/);
                should(data.segment.audio.pli).match(/^a777fb/);
            }


            if (1) {
                var scid = "mn1:3.1";
                var url = `/scv/play/segment/mn1/en/sujato/${scid}/${iVoice}`;
                var res = await supertest(app).get(url);
                res.statusCode.should.equal(200);
                var data = res.body instanceof Buffer ? JSON.parse(res.body) : res.body;
                should(data.segment.en).match(/^.Take an uneducated ordinary/);
                var testPath = path.join(PUBLIC,
                    `play/segment/mn1/en/sujato/${scid}/${iVoice}`);
                fs.writeFileSync(testPath, JSON.stringify(data, null,2));
            }

            if (0) {
                var scid = "mn1:3.2";
                var url = `/scv/play/segment/mn1/en/sujato/${scid}/${iVoice}`;
                var res = await supertest(app).get(url);
                res.statusCode.should.equal(200);
                var data = res.body instanceof Buffer ? JSON.parse(res.body) : res.body;
                should(data.segment.en).match(/^They perceive earth as earth/);
                var testPath = path.join(PUBLIC,
                    `play/segment/mn1/en/sujato/${scid}/${iVoice}`);
                fs.writeFileSync(testPath, JSON.stringify(data, null,2));
            }

            done();
        } catch(e) {done(e);} })();
    });
    it("GET /play/audio/:suid/:lang/:trans/:voice/:guid returns audio", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            done();
        } catch(e) {done(e);} })();
    });
    it("GET /play/segment/... handles large segment", function(done) {
        this.timeout(30*1000);
        (async function() { try {
            var scid = "an2.280-309:281.1.1";
            var sutta_uid = scid.split(":")[0];
            var iVoice = 0;
            var url = `/scv/play/segment/${sutta_uid}/en/sujato/${scid}/${iVoice}`;
            var res = await supertest(app).get(url);
            res.statusCode.should.equal(200);
            var data = res.body instanceof Buffer ? JSON.parse(res.body) : res.body;
            should(data.sutta_uid).equal('an2.280-309');
            should(data.voiceLang).equal('Amy');
            should(data.voicePali).equal('Aditi');
            should(data.iSegment).equal(8);
            should(data.section).equal(2);
            should(data.nSections).equal(3);
            should(data.iVoice).equal(iVoice);
            should(data.language).equal('en');
            should(data.translator).equal('sujato');
            should(data.segment.en).match(/^.For two reasons the Realized One/);
            should(data.segment.audio.en).match(/^7120fcf/);
            should(data.segment.audio.pli).match(/a0b4f88de826346a033a8cc63617e25a/);

            done();
        } catch(e) {done(e);} })();
    });
    it("GET /examples/:n return search examples", function(done) {
        this.timeout(3*1000);
        (async function() { try {
            var n = 3;
            var url = `/scv/examples/${n}`;
            var res = await supertest(app).get(url);
            res.statusCode.should.equal(200);
            var data = res.body instanceof Buffer ? JSON.parse(res.body) : res.body;
            should(data instanceof Array);
            should(data.length).equal(3);
            for (var i = 3; i-- > 0; ) { // at least one trial must be different
                var res2 = await supertest(app).get(url);
                try {
                    res2.statusCode.should.equal(200);
                    var data2 = res2.body instanceof Buffer 
                        ? JSON.parse(res2.body) : res2.body;
                    should(data).not.eql(data2);
                    break;
                } catch(e) {
                    if (i === 0) {
                        throw e;
                    }
                }
            }
            done();
        } catch(e) {done(e);} })();
    });
    it("GET /wiki-aria/:page return Aria for wiki page", function(done) {
        this.timeout(3*1000);
        (async function() { try {
            var url = `/scv/wiki-aria/Home.md`;
            var res = await supertest(app).get(url);
            res.statusCode.should.equal(200);
            var html = res.body.html;
            var WIKIURL = 'https://raw.githubusercontent.com/wiki/sc-voice/sc-voice';
            should(res.body.url).equal(`${WIKIURL}/Home.md`);
            var html = res.body.html;
            should(html).match(/<summary>Navigating the texts<.summary>/);
            done();
        } catch(e) {done(e);} })();
    });
    it("GET auth/sound-store/volume-info return stats", function(done) {
        this.timeout(3*1000);
        (async function() { try {
            var url = `/scv/auth/sound-store/volume-info`;
            var scvRest = app.locals.scvRest;
            var token = jwt.sign(TEST_ADMIN, ScvRest.JWT_SECRET);
            var res = await supertest(app).get(url)
                .set("Authorization", `Bearer ${token}`);
            res.statusCode.should.equal(200);
            var soundStore = scvRest.soundStore;
            should.deepEqual(res.body, soundStore.volumeInfo());
            done();
        } catch(e) {done(e);} })();
    });
    it("GET auth/sound-store/clear-volume clears volume cache", function(done) {
        this.timeout(3*1000);
        (async function() { try {
            var scvRest = app.locals.scvRest;
            var soundStore = scvRest.soundStore;
            var volume = 'test-clear-volume';
            var fpath = soundStore.guidPath({
                volume,
                guid:'12345',
            });
            fs.writeFileSync(fpath, '12345data');
            should(fs.existsSync(fpath)).equal(true);
            var url = `/scv/auth/sound-store/clear-volume`;
            var scvRest = app.locals.scvRest;
            var token = jwt.sign(TEST_ADMIN, ScvRest.JWT_SECRET);

            var data = { volume, };
            var res = await supertest(app).post(url)
                .set("Authorization", `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(data);
            res.statusCode.should.equal(200);
            should.deepEqual(res.body, {
                filesDeleted:1,
            });
            should(fs.existsSync(fpath)).equal(false);

            var data = { volume:'invalid-volume', };
            logger.error(`EXPECTED ERROR BEGIN`);
            var res = await supertest(app).post(url)
                .set("Authorization", `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(data);
            res.statusCode.should.equal(500);
            logger.error(`EXPECTED ERROR END`);

            done();
        } catch(e) {done(e);} })();
    });
    it("GET audio-url/... returns supported audio url", function(done) {
        this.timeout(3*1000);
        (async function() { try {
            // short url
            var url = '/scv/audio-urls/sn1.23';
            var res = await supertest(app).get(url)
            res.statusCode.should.equal(200);

            should.deepEqual(res.body.map(src=>src.url), [
                'https://sc-opus-store.sgp1.cdn.digitaloceanspaces.com/'+
                    'pli/sn/sn1/sn1.23-pli-mahasangiti-sujato.webm',
                'https://sc-opus-store.sgp1.cdn.digitaloceanspaces.com/'+
                    'en/sn/sn1/sn1.23-en-sujato-sujato.webm',
            ]);

            done();
        } catch(e) {done(e);} })();
    });
});

