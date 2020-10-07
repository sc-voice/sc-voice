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
    const { Definitions } = require('suttacentral-api');
    const {
        SCAudio,
        ScvRest,
        Section,
        SoundStore,
        Sutta,
        SuttaCentralApi,
        SuttaCentralId,
        SuttaFactory,
        VoiceFactory,
        Words,
    } = require("../index");
    const TEST_ADMIN = {
        username: "test-admin",
        isAdmin: true,
    };
    const Queue = require('promise-queue');
    const PUBLIC = path.join(__dirname, '../public');
    const LOCAL = path.join(__dirname, '../local');
    const SC = path.join(LOCAL, 'sc');
    const app = require("../scripts/sc-voice.js"); // access cached instance 
    this.timeout(15*1000);


    function testServerReady(ms=600) {
        // The testing server takes a while to wakeup
        // and will report 404 until it's ready
        return new Promise(resolve=>setTimeout(()=>resolve(),ms)); 
    }

    function testAuthPost(url, data) {
        var token = jwt.sign(TEST_ADMIN, ScvRest.JWT_SECRET);
        return supertest(app).post(url)
            .set("Authorization", `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(data);
    }

    function testAuthGet(url, contentType='application/json', accept=contentType) {
        var token = jwt.sign(TEST_ADMIN, ScvRest.JWT_SECRET);
        return supertest(app).get(url)
            .set("Authorization", `Bearer ${token}`)
            .set('Content-Type', contentType)
            .set('Accept', accept)
            .expect('Content-Type', new RegExp(contentType))
            ;
    }

    function testGet(url, contentType='application/json', accept=contentType) {
        return supertest(app).get(url)
            .set('Content-Type', contentType)
            .set('Accept', accept)
            .expect('Content-Type', new RegExp(contentType))
            ;
    }

    function testScvRest() {
        // Wait for server to start
        return new Promise(resolve=>(async function(){
            await app.locals.scvRest.initialize();
            setTimeout(()=>{
                resolve(app.locals.scvRest);
            },200);
        })());
    }

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
        var voiceFactory = scvRest.voiceFactory;
        should(voiceFactory).instanceOf(VoiceFactory);
        should(voiceFactory.soundStore).equal(soundStore);
    });
    it("GET /identity => restbundle identity JSON", done=>{
        var async = function* () { try {
            var response = yield supertest(app)
                .get("/scv/identity").expect((res) => {
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
        var async = function* () { try {
            var response = yield supertest(app).get("/scv/sutta/mn1/en/sujato")
            .expect((res) => {
                res.statusCode.should.equal(200);
                var sutta = res.body;
                should.deepEqual(Object.keys(sutta).sort(), [
                    'translation', 'suttaCode', 'sutta_uid', 
                    'author', 'author_uid', 'titles', 'blurb',
                    "sections", "suttaplex", "support", 'lang',
                ].sort());
                should.deepEqual(sutta.support, 
                    Definitions.SUPPORT_LEVELS.Supported);
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
                should(sutta.blurb).match(
                    /Buddha examines how the notion of a permanent/);
            }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /sutta/mn100/en/sujato returns sutta", function(done) {
        var async = function* () { try {
            var response = yield supertest(app).get("/scv/sutta/mn100/en/sujato")
            .expect((res) => {
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
                    title: `Middle Discourses 100 `,
                    type: 'Section',
                    values: [],
                    segments: [{
                        en: 'Middle Discourses 100 ',
                        pli: 'Majjhima Nikāya 100 ',
                        scid: 'mn100:0.1',
                    },{
                        en: 'With Saṅgārava ',
                        pli: 'Saṅgāravasutta ',
                        scid: 'mn100:0.2',
                    }],
                });
            }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /recite/section/mn1/en/sujato/2 returns recitation", function(done) {
        var async = function* () { try {
            var response = yield supertest(app)
            .get("/scv/recite/section/mn1/en/sujato/2")
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
        var async = function* () { try {
            var response = yield supertest(app)
            .get("/scv/recite/section/mn100/en/sujato/1")
            .expect((res) => {
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
    it("GET download human audio playlist", function(done) {
        console.log(`TODO`, __filename); done(); return; 
        var scvRest = app.locals.scvRest;
        logger.level = 'info';
        var async = function* () { try {
            var apiModel = yield  scvRest.initialize()
                .then(r=>async.next(r)).catch(e=>async.throw(e));
            var url = `/scv/download/playlist/en/sujato_en/sn2.3%2Fen%2Fsujato`;
            var res = yield supertest(app)
                .get(url)
                .expect('Content-Type', /audio\/mp3/)
                .expect('Content-Disposition', 
                    'attachment; filename=sn2.3-en-sujato_en_sujato_en.mp3')
                .end((e,r) => e ? async.throw(e) : async.next(r));
            var contentLength = Number(res.headers['content-length']);
            should(contentLength).above(3400000);
            should(contentLength).below(4600000);
            should(res.statusCode).equal(200);
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /download/playlist/pli+en/amy/an3.76-77 returns mp3", function(done) {
        var scvRest = app.locals.scvRest;
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
        console.log("TODO", __filename); done(); return; 
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
        (async function() { try { await testServerReady();
            var maxResults = 3;
            var pattern = `root%20of%20suffering`;

            var url = `/scv/search/${pattern}?maxResults=${maxResults}`;
            var res = await supertest(app).get(url);
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
            should.deepEqual(results.map(r => r.count),
                [ 5.091, 3.016, 2.006  ]);

            // use default maxResults
            var url = `/scv/search/${pattern}`;
            var res = await supertest(app).get(url);
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
                'sn42.11', 'mn105', 'mn1', 'sn56.21', 'mn116',
            ]);
            done();
        } catch (e) { done(e); } })();
    });
    it("GET /scv/play/section/... => playable section", done=>{
        (async function() { try {
            await new Promise(resolve=>setTimeout(()=>resolve(),1000));
            var iSection = 1;
            var vnameTrans = 'Raveena';
            var vnameRoot = 'Aditi';
            var url = `/scv/play/section/mn1/en/sujato/`+
                `${iSection}/${vnameTrans}/${vnameRoot}`;
            var res = await supertest(app).get(url);
            res.statusCode.should.equal(200);
            var section = res.body instanceof Buffer 
                ? JSON.parse(res.body) : res.body;
            should(section.segments.length).equal(332);
            should(section.sutta_uid).equal('mn1');
            should(section.vnameTrans).equal(vnameTrans);
            should(section.vnameRoot).equal(vnameRoot);
            should(section.section).equal(iSection);
            should(section.nSections).equal(2);
            should(section.language).equal('en');
            should(section.translator).equal('sujato');
            should.deepEqual(section.segments[0].audio, {});
            var testPath = path.join(PUBLIC,
                `play/section/mn1/en/sujato/${iSection}/${vnameTrans}`);
            fs.writeFileSync(testPath, JSON.stringify(section, null,2));
            done();
        } catch(e) {done(e);} })();
    });
    it("GET /play/segment/... => playable segment", done=>{
        (async function() { try {
            await new Promise(resolve=>setTimeout(()=>resolve(),1000));
            var voicename = 'Matthew';
            var scid = "mn1:0.1";
            var url = 
                `/scv/play/segment/mn1/en/sujato/${scid}/${voicename}`;
            var res = await supertest(app).get(url);
            res.statusCode.should.equal(200);
            var data = res.body instanceof Buffer 
                ? JSON.parse(res.body) : res.body;
            should(data.segment.en).match(/^Middle Discourses 1/);
            should(data.segment.audio.pli)
                .match(/eb2c6cf0626c7a0f422da93a230c4ab7/); // no numbers

            var scid = "mn1:3.1";
            var url = 
                `/scv/play/segment/mn1/en/sujato/${scid}/${voicename}`;
            var res = await supertest(app).get(url);
            res.statusCode.should.equal(200);
            var data = res.body instanceof Buffer 
                ? JSON.parse(res.body) : res.body;
            should(data.segment.en).match(/^.Take an uneducated ordinary/);
            if (0) { // simulate REST response using static file
                var testPath = path.join(PUBLIC,
                    `play/segment/mn1/en/sujato/${scid}/${voicename}`);
                fs.writeFileSync(testPath, JSON.stringify(data, null,2));
            }

            done();
        } catch(e) {done(e);} })();
    });
    it("GET /play/segment/... => playable segment", done=>{
        (async function() { try {
            var voicename = '0';
            var scid = "mn1:0.1";
            var url = `/scv/play/segment/mn1/en/sujato/${scid}/${voicename}`;
            var res = await supertest(app).get(url);
            res.statusCode.should.equal(200);
            var data = res.body instanceof Buffer ? JSON.parse(res.body) : res.body;
            should(data.segment.en).match(/^Middle Discourses 1/);
            should(data.segment.audio.pli).match(/eb2c6cf0626c7a0f422da93a230c4ab7/); // no numbers

            if (0) {
                var scid = "mn1:52-74.23";
                var url = `/scv/play/segment/mn1/en/sujato/${scid}/${voicename}`;
                var res = await supertest(app).get(url);
                res.statusCode.should.equal(200);
                var data = res.body instanceof Buffer ? JSON.parse(res.body) : res.body;
                should(data.sutta_uid).equal('mn1');
                should(data.vnameLang).equal('Amy');
                should(data.vnameRoot).equal('Aditi');
                should(data.iSegment).equal(299);
                should(data.section).equal(4);
                should(data.nSections).equal(10);
                should(data.voicename).equal(voicename);
                should(data.language).equal('en');
                should(data.translator).equal('sujato');
                should(data.segment.en).match(/^They directly know extinguishment as/);
                should(data.segment.audio.en).match(/^3f8996/);
                should(data.segment.audio.pli).match(/^a777fb/);
            }


            if (1) {
                var scid = "mn1:3.1";
                var url = `/scv/play/segment/mn1/en/sujato/${scid}/${voicename}`;
                var res = await supertest(app).get(url);
                res.statusCode.should.equal(200);
                var data = res.body instanceof Buffer ? JSON.parse(res.body) : res.body;
                should(data.segment.en).match(/^.Take an uneducated ordinary/);
                var testPath = path.join(PUBLIC,
                    `play/segment/mn1/en/sujato/${scid}/${voicename}`);
                fs.writeFileSync(testPath, JSON.stringify(data, null,2));
            }

            if (0) {
                var scid = "mn1:3.2";
                var url = `/scv/play/segment/mn1/en/sujato/${scid}/${voicename}`;
                var res = await supertest(app).get(url);
                res.statusCode.should.equal(200);
                var data = res.body instanceof Buffer ? JSON.parse(res.body) : res.body;
                should(data.segment.en).match(/^They perceive earth as earth/);
                var testPath = path.join(PUBLIC,
                    `play/segment/mn1/en/sujato/${scid}/${voicename}`);
                fs.writeFileSync(testPath, JSON.stringify(data, null,2));
            }

            done();
        } catch(e) {done(e);} })();
    });
    it("GET /play/audio/:suid/:lang/:trans/:voice/:guid returns audio", function(done) {
        (async function() { try {
            done();
        } catch(e) {done(e);} })();
    });
    it("TESTTESTGET /play/segment/... handles large segment", done=>{
        console.log(`TODO`, __filename); done(); return; 
        (async function() { try {
            await new Promise(resolve=>setTimeout(()=>resolve(),1000));
            var scid = "an2.281-309:1.1";
            var sutta_uid = scid.split(":")[0];
            var vnameTrans = "1"; // Matthew
            var url = `/scv/play/segment/${sutta_uid}/`+
                `en/sujato/${scid}/${vnameTrans}`;
            var res = await supertest(app).get(url);
            res.statusCode.should.equal(200);
            var data = res.body instanceof Buffer 
                ? JSON.parse(res.body) : res.body;
            should(data.sutta_uid).equal('an2.281-309');
            should(data.vnameTrans).equal('Brian');
            should(data.vnameRoot).equal('Aditi');
            should(data.iSegment).equal(9);
            should(data.nSections).equal(3);
            should(data.language).equal('en');
            should(data.translator).equal('sujato');
            should(data.segment.en)
                .match(/^.For two reasons the Realized One/);
            should(data.segment.audio.en)
                .match(/4341471c187e12334475901a9599698c/);
            should(data.segment.audio.pli)
                .match(/7bd718c9fbda06ab56b2d09a05776353/);

            done();
        } catch(e) {done(e);} })();
    });
    it("GET /play/segment/... handles HumanTts dn33", done=>{
        (async function() { try {
            var scid = "dn33:0.1";
            var sutta_uid = scid.split(":")[0];
            var langTrans = 'en';
            var vnameTrans = "sujato_en";
            var vnameRoot = "sujato_pli";
            var url = [
                `/scv/play/segment`,
                sutta_uid,
                langTrans,
                'sujato',
                scid,
                vnameTrans,
                vnameRoot,
            ].join('/');
            var res = await supertest(app).get(url);
            res.statusCode.should.equal(200);
            var data = res.body instanceof Buffer 
                ? JSON.parse(res.body) : res.body;
            should(data.sutta_uid).equal(scid.split(':')[0]);
            should(data.vnameTrans).equal(vnameTrans);
            should(data.vnameRoot).equal(vnameRoot);
            should(data.iSegment).equal(0);
            should(data.section).equal(0);
            should(data.nSections).equal(12);
            should(data.language).equal('en');
            should(data.translator).equal('sujato');
            should(data.segment.pli).match(/^Dīgha Nikāya 33/);
            should(data.segment.audio.vnamePali).equal('Aditi');
            should(data.segment.audio.vnameTrans).equal('Amy');
            should(data.segment.audio.en)
                .match(/b06d3e95cd46714448903fa8bcb12004/);
            should(data.segment.audio.pli)
                .match(/899e4cd12b700b01200f295631b1576b/);

            done();
        } catch(e) {done(e);} })();
    });
    it("GET /play/segment/... handles HumanTts sn1.9", done=>{
        (async function() { try {
            var scid = "sn1.9:1.1";
            var sutta_uid = scid.split(":")[0];
            var langTrans = 'en';
            var vnameTrans = "Matthew";
            var vnameRoot = "sujato_pli";
            var url = [
                `/scv/play/segment`,
                sutta_uid,
                langTrans,
                'sujato',
                scid,
                vnameTrans,
                vnameRoot,
            ].join('/');
            var res = await supertest(app).get(url);
            res.statusCode.should.equal(200);
            var data = res.body instanceof Buffer 
                ? JSON.parse(res.body) : res.body;
            should(data.sutta_uid).equal(scid.split(':')[0]);
            should(data.vnameTrans).equal('Matthew');
            should(data.vnameRoot).equal('sujato_pli');
            should(data.iSegment).equal(3);
            should(data.nSections).equal(2);
            //should(data.section).equal(1);
            should(data.language).equal('en');
            should(data.translator).equal('sujato');
            should(data.segment.pli).match(/Sāvatthinidānaṁ.*/);
            should(data.segment.audio.en)
                .match(/e5f5e2ec93f9f41908924177d5ee63ca/);
            should(data.segment.audio.pli)
                .match(/57eacb73319677cbe42256c332630451/);
            should(data.segment.audio.vnamePali).equal(undefined);

            done();
        } catch(e) {done(e);} })();
    });
    it("GET /play/segment/... handles HumanTts sn12.1", done=>{
        (async function() { try {
            var scid = "sn12.1:1.2";
            var sutta_uid = scid.split(":")[0];
            var langTrans = 'en';
            var vnameTrans = "Matthew";
            var vnameRoot = "sujato_pli";
            var url = [
                `/scv/play/segment`,
                sutta_uid,
                langTrans,
                'sujato',
                scid,
                vnameTrans,
                vnameRoot,
            ].join('/');
            logger.warn("EXPECTED ERROR BEGIN");
            var res = await supertest(app).get(url);
            logger.warn("EXPECTED ERROR END");
            res.statusCode.should.equal(200);
            var data = res.body instanceof Buffer 
                ? JSON.parse(res.body) : res.body;
            should(data.sutta_uid).equal(scid.split(':')[0]);
            should(data.vnameTrans).equal('Matthew');
            should(data.vnameRoot).equal('sujato_pli');
            should(data.language).equal('en');
            should(data.translator).equal('sujato');
            should(data.segment.pli)
                .match(/ekaṁ samayaṁ bhagavā sāvatthiyaṁ.*/);
            should(data.segment.audio.en)
                .match(/d0a8567a6fca2fbeaa5d14e610304826/);
            should(data.segment.audio.pli)
                .match(/a11ebc9a6bbe583d36e375ca163b6351/);
            should(data.segment.audio.vnamePali).equal('Aditi');

            done();
        } catch(e) {done(e);} })();
    });
    it("GET /examples/:n return search examples", function(done) {
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
    it("GET /wiki-aria/:page return Aria for wiki page", done=>{
        var WIKIURL = `https://raw.githubusercontent.com/wiki/`+
            `sc-voice/sc-voice`;
        (async function() { try {
            var url = `/scv/wiki-aria/Home.md`;
            var res = await supertest(app).get(url);
            res.statusCode.should.equal(200);
            var html = res.body.html;
            should(res.body.url).equal(`${WIKIURL}/Home.md`);
            var html = res.body.html;
            should(html).match(/These wiki pages/ui);
            done();
        } catch(e) {done(e);} })();
    });
    it("GET auth/sound-store/volume-info return stats", function(done) {
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
    it("POST auth/sound-store/clear-volume clears volume cache", done=>{
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
            var res = await testAuthPost(url, data);
            res.statusCode.should.equal(200);
            should.deepEqual(res.body, {
                filesDeleted:1,
            });
            should(fs.existsSync(fpath)).equal(false);

            var data = { volume:'invalid-volume', };
            logger.error(`EXPECTED ERROR BEGIN`);
            var res = await testAuthPost(url, data);
            res.statusCode.should.equal(500);
            logger.error(`EXPECTED ERROR END`);

            done();
        } catch(e) {done(e);} })();
    });
    it("GET audio-url/... returns supported audio url", function(done) {
        (async function() { try {
            // short url
            var url = '/scv/audio-urls/sn1.23';
            var res = await supertest(app).get(url)
            res.statusCode.should.equal(200);
            should.deepEqual(res.body.map(src=>src.url), [
`https://${SCAudio.SC_OPUS_STORE}.sgp1.cdn.digitaloceanspaces.com/`+
                    'pli/sn/sn1/sn1.23-pli-mahasangiti-sujato.webm',
`https://${SCAudio.SC_OPUS_STORE}.sgp1.cdn.digitaloceanspaces.com/`+
                    'en/sn/sn1/sn1.23-en-sujato-sujato.webm',
            ]);

            done();
        } catch(e) {done(e);} })();
    });
    it("GET auth/vsm/s3-credentials => sanitized vsm-s3.json", done=>{
        var vsmS3Path = path.join(LOCAL, 'vsm-s3.json');
        if (!fs.existsSync(vsmS3Path)) {
            logger.warn('skipping vsm/s3-credentials GET test');
            done();
            return;
        }
        (async function() { try {
            var url = `/scv/auth/vsm/s3-credentials`;
            var goodCreds = JSON.parse(fs.readFileSync(vsmS3Path));

            // Returns obfuscated credentials
            var res = await testAuthGet(url);
            res.statusCode.should.equal(200);
            var actualCreds = res.body;
            should(actualCreds.Bucket)
                .equal(goodCreds.Bucket||goodCreds.Bucket);
            should(actualCreds.s3.endpoint).equal(goodCreds.s3.endpoint);
            should(actualCreds.s3.region).equal(goodCreds.s3.region);
            should(actualCreds.s3.accessKeyId.substr(0,5)).equal('*****');
            should(actualCreds.s3.secretAccessKey.substr(0,5)).equal('*****');

            done();
        } catch(e) {done(e);} })();
    });
    it("POST auth/vsm/s3-credentials configures vsm-s3.json", done=>{
        var vsmS3Path = path.join(LOCAL, 'vsm-s3.json');
        if (!fs.existsSync(vsmS3Path)) {
            logger.warn('skipping vsm/s3-credentials POST test');
            done();
            return;
        }
        (async function() { try {
            var url = `/scv/auth/vsm/s3-credentials`;

            // save good creds and make bad creds
            var goodCreds = JSON.parse(fs.readFileSync(vsmS3Path));
            var badCreds = Object.assign({}, goodCreds);
            badCreds.s3 = Object.assign({}, goodCreds.s3, {
                secretAccessKey: "wrong-key",
            });
            await fs.promises.writeFile(vsmS3Path, JSON.stringify(badCreds, null, 2));

            // Good credentials are saved
            var res = await testAuthPost(url, goodCreds);
            var actualCreds = JSON.parse(await fs.promises.readFile(vsmS3Path));
            await fs.promises.writeFile(vsmS3Path, JSON.stringify(goodCreds, null, 2));
            res.statusCode.should.equal(200);
            should.deepEqual(actualCreds, goodCreds);

            // Bad credentials are not saved
            logger.warn("EXPECTED WARNING BEGIN");
            var badCreds = JSON.parse(JSON.stringify(goodCreds));
            badCreds.s3.secretAccessKey = 'bad-secretAccessKey';
            var res = await testAuthPost(url, badCreds);
            logger.warn("EXPECTED WARNING END");
            res.statusCode.should.equal(500);
            var actualCreds = JSON.parse(fs.readFileSync(vsmS3Path));
            should.deepEqual(actualCreds, goodCreds);

            done();
        } catch(e) {
            logger.info(`TEST: restoring ${vsmS3Path}`);
            fs.writeFileSync(vsmS3Path, JSON.stringify(goodCreds, null, 2));
            done(e);
        } })();
    });
    it("GET auth/vsm/factory-task returns factory status", function(done) {
        (async function() { try {

            // Default Bucket
            var url = `/scv/auth/vsm/factory-task`;
            var res = await testAuthGet(url);
            res.statusCode.should.equal(200);
            should(res.body).properties({
                error: null,
                summary: 'VSMFactory created',
                name: 'VSMFactory',
                msActive: 0,
            });
            should.deepEqual(Object.keys(res.body).sort(), [
                'isActive', 'lastActive',
                'error', 'name', 'msActive', 'started', 'summary', 'uuid',
                'actionsTotal', 'actionsDone',
            ].sort());

            done();
        } catch(e) {done(e);} })();
    });
    it("GET auth/vsm/list-objects lists bucket objects", function(done) {
        var vsmS3Path = path.join(LOCAL, 'vsm-s3.json');
        if (!fs.existsSync(vsmS3Path)) {
            logger.warn("skipping auth/vsm/list-objects test");
            done();
            return;
        }
        (async function() { try {

            // Default Bucket
            var url = `/scv/auth/vsm/list-objects`;
            var res = await testAuthGet(url);
            res.statusCode.should.equal(200);
            var s3Result = res.body;
            should(s3Result).properties({
                Name: fs.existsSync(vsmS3Path)
                    ? 'sc-voice-vsm'
                    : 'sc-voice-test',
                MaxKeys: 1000,
                s3: {
                    endpoint: 'https://s3.us-west-1.amazonaws.com',
                    region: 'us-west-1',
                },
            });
            var c0 = s3Result.Contents[0];
            should(c0).properties([
                'Key', 'LastModified', 'ETag', 'Size', 'StorageClass', 'Owner',
                'upToDate',
            ]);
            if (c0.upToDate) {
                should(new Date(c0.restored))
                    .above(new Date(c0.LastModified));
            }
            should(s3Result.Contents[0].Key)
                .match(/[a-z]*_[a-z]*_[a-z]*_[a-z]*.tar.gz/iu);

            done();
        } catch(e) {done(e);} })();
    });
    it("POST auth/vsm/restore-s3-archives", done=>{
        // Restore VSM file
        console.log(`TODO`,__filename); done(); return; 
        var vsmS3Path = path.join(LOCAL, 'vsm-s3.json');
        if (!fs.existsSync(vsmS3Path)) {
            logger.warn('skipping vsm/s3-credentials POST test');
            done();
            return;
        }
        (async function() { try {
            var url = `/scv/auth/vsm/list-objects`;
            var resList = await testAuthGet(url);
            var {
                Contents,
            } = resList.body;

            var url = `/scv/auth/vsm/restore-s3-archives`;
            var restore = [{
                Key: 'kn_en_sujato_amy.tar.gz',
                ETag: '"e2141be1eddffebe4bded17b83aaa5ee"',
            }];
            var clearVolume = false;
            var data = {
                restore,
                clearVolume,
            };
            var res = await testAuthPost(url, data);
            res.statusCode.should.equal(200);
            should(res.body).properties({
                Bucket: 'sc-voice-vsm',
                clearVolume,
                restore,
            });

            done();
        } catch(e) {done(e);} })();
    });
    it("TESTTESTPOST auth/vsm/create-archive create VSM", done=>{
        console.log(`TODO`,__filename); done(); return; 
        (async function() { try {
            var url = `/scv/auth/vsm/create-archive`;
            var nikaya = 'kn';
            var author = 'sujato';
            var lang = 'pli';
            var voice = 'aditi';
            var maxSuttas = 1;
            var postArchive = false;
            var data = {
                nikaya,
                voice,
                lang,
                author,
                maxSuttas,
                postArchive,
            };

            // the response is immediate since processing is in the background
            var res = await testAuthPost(url, data);
            res.statusCode.should.equal(200);
            should(res.body).properties({
                postArchive,
                author,
                lang,
                nikaya,
                maxSuttas,
                voice,
            });
            var summary = 'Building VSM for nikaya:kn language:pli voice:aditi';
            should(res.body.task).properties({
                actionsTotal: 2,
                actionsDone: 0,
                summary,
                error: null,
                name: 'VSMFactory',
            });

            // an immediately following request should be busy 
            logger.warn("EXPECTED WARNING BEGIN");
            var res = await testAuthPost(url, data);
            logger.warn("EXPECTED WARNING END");
            res.statusCode.should.equal(500);
            should(res.body.error).match(/VSM Factory is busy/);
            var taskUrl = `/scv/auth/vsm/factory-task`;
            var res = await testAuthGet(taskUrl);
            res.statusCode.should.equal(200);
            should(res.body).properties({
                error: null,
                summary,
                name: 'VSMFactory',
                isActive: true,
            });

            // and after a while it should be done
            await new Promise((resolve, reject) => {
                setTimeout(() => resolve(true), 5000);
            });
            var res = await testAuthGet(taskUrl);
            res.statusCode.should.equal(200);
            should(res.body).properties({
                error: null,
                name: 'VSMFactory',
                isActive: false,
            });
            should(res.body.summary)
                .match(/kn_pli_mahasangiti_aditi suttas imported/);

            // and we can submit another request
            var res = await testAuthPost(url, data);
            res.statusCode.should.equal(200);

            done();
        } catch(e) {done(e);} })();
    });
    it("GET voices returns voices", function(done) {
        (async function() { try {
            // default
            var url = "/scv/voices";
            var res = await supertest(app).get(url)
            should(res.statusCode).equal(200);
            var voices = res.body;
            should.deepEqual(voices.map(v=>v.name).slice(0,8), [
                // en voices first
                'Amy', 'Brian', 'Raveena', 'Matthew', 'sujato_en', 
                // non-en voices
                'Vicki', 'Hans', 'Marlene', // de voices
                //'Ricardo', // pt
                //'Aditi', 'sujato_pli', // pli voices last
            ])
            should(voices[0]).properties({
                name: "Amy",
                iVoice: 0,
                usage: "recite",
            });

            // en
            var url = "/scv/voices/en";
            var res = await supertest(app).get(url)
            should(res.statusCode).equal(200);
            var voices = res.body;
            should.deepEqual(voices.map(v=>v.name), [
                'Amy', 'Brian', 'Raveena', 'Matthew', 'sujato_en', 
                'Aditi', 'sujato_pli', // pli voices last
            ])

            // de
            var url = "/scv/voices/de";
            var res = await supertest(app).get(url)
            should(res.statusCode).equal(200);
            var voices = res.body;
            should.deepEqual(voices.map(v=>v.name), [
                'Vicki', 'Hans', 'Marlene', // de voices
                'Aditi', 'sujato_pli', // pli voices last
            ])

            done();
        } catch(e) {done(e);} })();
    });
    it("GET authors returns authors", function(done) {
        (async function() { try {
            var scvRest = app.locals.scvRest;
            await scvRest.initialize();
            var url = "/scv/authors";
            var res = await supertest(app).get(url)
            should(res.statusCode).equal(200);
            var authors = res.body;
            should.deepEqual(authors.sabbamitta, {
                name: 'Anagarika Sabbamitta',
                lang: 'de',
                type: 'translator',
            })

            done();
        } catch(e) {done(e);} })();
    });
    it("GET auth/logs returns logfiles", function(done) {
        (async function() { try {
            var logDir = path.join(LOCAL, 'logs');
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir);
                fs.writeFileSync(path.join(logDir, 'test3'), 'test-log3');
                fs.writeFileSync(path.join(logDir, 'test2'), 'test-log2');
                fs.writeFileSync(path.join(logDir, 'test1'), 'test-log1');
            }
            var files = fs.readdirSync(logDir).sort((a,b) => -a.localeCompare(b));
            var url = "/scv/auth/logs";
            var res = await testAuthGet(url);
            should(res.statusCode).equal(200);
            var resFiles = res.body;
            should.deepEqual(resFiles.map(f=>f.name), files);
            should(resFiles[0]).properties(['size', 'mtime']);

            done();
        } catch(e) {done(e);} })();
    });
    it("GET auth/log/:ilog returns logfile", function(done) {
        (async function() { try {
            var logDir = path.join(LOCAL, 'logs');
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir);
                fs.writeFileSync(path.join(logDir, 'test3'), 'test-log3');
                fs.writeFileSync(path.join(logDir, 'test2'), 'test-log2');
                fs.writeFileSync(path.join(logDir, 'test1'), 'test-log1');
            }
            var files = fs.readdirSync(logDir).sort((a,b) => -a.localeCompare(b));
            var index = 0;
            if (files.length > index) {
                var url = `/scv/auth/log/${index}`;
                var res = await testAuthGet(url, 'text/plain');
                should(res.statusCode).equal(200);
                var log = fs.readFileSync(path.join(logDir, files[index])).toString();
                should(res.text).equal(log);
            }
            index++;
            if (files.length > index) {
                var url = `/scv/auth/log/${index}`;
                var res = await testAuthGet(url, 'text/plain');
                should(res.statusCode).equal(200);
                var log = fs.readFileSync(path.join(logDir, files[index])).toString();
                should(res.text).equal(log);
            }

            // error
            var url = `/scv/auth/log/asdf`;
            logger.warn('EXPECTED ERROR: BEGIN');
            var res = await testAuthGet(url, 'text/plain');
            logger.warn('EXPECTED ERROR: END');
            should(res.statusCode).equal(500);
            should(res.text).match(/Log file not found:asdf/);

            done();
        } catch(e) {done(e);} })();
    });
    it("GET /search/:pattern/:lang returns German", function(done) {
        (async function() { try { await testServerReady();
            var maxResults = 3;
            var pattern = `dn7`;
            var lang = 'de'

            var url = `/scv/search/${pattern}/${lang}?maxResults=${maxResults}`;
            var response = await supertest(app).get(url);
            response.statusCode.should.equal(200);
            var {
                method,
                results,
            } = response.body;
            should(method).equal('sutta_uid-legacy');
            should(results).instanceOf(Array);
            should(results.length).equal(1);
            should.deepEqual(results.map(r => r.uid),[
                'dn7', 
            ]);
            should(results[0].sutta.author_uid)
                .equal('kusalagnana-maitrimurti-traetow');
            done();
        } catch (e) { done(e); } })();
    });
    it("POST auth/update-bilara", done=>{
        (async function() { try {
            var scvRest = await(testScvRest());
            var url = `/scv/auth/update-bilara`;
            var data = { };
            var res = await testAuthPost(url, data);
            res.statusCode.should.equal(200);
            should(res.body).properties({
                error: null,
                summary: 'Update completed',
            });
            should(res.body.elapsed).above(0);

            done();
        } catch(e) {done(e);} })();
    });
    it("GET audio info", done=>{
        (async function() { try {
            var scvRest = await(testScvRest());
            var guid = `e0bd9aadd84f3f353f17cceced97ff13`;
            var url = `/scv/auth/audio-info/an_en_sujato_amy/${guid}`;
            var res = await testAuthGet(url);
            var {
                statusCode,
                body: infoArray,
            } = res;
            statusCode.should.equal(200);
            should(infoArray).instanceOf(Array);
            should.deepEqual(infoArray.map(i=>i.api), [
                "aws-polly",]);
            should.deepEqual(infoArray.map(i=>i.voice), [
                "Amy",]);
            should.deepEqual(infoArray.map(i=>i.guid), [
                "e0bd9aadd84f3f353f17cceced97ff13", 
            ]);

            done();
        } catch(e) {done(e);} })();
    });
});

