(typeof describe === 'function') && describe("scv-singleton", function() {
    const should = require("should");
    const ScvSingleton = require("../public/js/scv-singleton");
    const {
        Playlist,
        Sutta,
    } = require('../index');
    const mockVue = {
    };
    Object.defineProperty(mockVue, 'set', {
        get() { return (obj, prop, val) => {
            obj[prop] = val;
        }},
    });
    const mockVueRoot = {
        $cookie: {
        },
    };
    Object.defineProperty(mockVueRoot.$cookie, 'delete', {
        get() { return (cookie) => {
            delete this[cookie];
        }},
    });
    Object.defineProperty(mockVueRoot.$cookie, 'get', {
        get() { return (cookie) => {
            return this[cookie];
        }},
    });
    Object.defineProperty(mockVueRoot.$cookie, 'set', {
        get() { return (cookie, value) => {
            this[cookie] = `${value}`;
        }},
    });
    const g = {
        window: {
            location: {
                origin: 'test-origin',
                pathname: '/test-path',
            },
        },
        vueRoot: mockVueRoot,
        Vue: mockVue,
    };
    var suttas = [
        new Sutta({
            sutta_uid: 'test1',
            author_uid: 'test',
            sections: [{
                segments: [{
                    scid: 'test1:1.1',
                    pli: 'test1:pli1.1',    // 12
                    en:  'test1:en1.1 a',   // 13
                    de:  'test1:de1.1 ab',  // 14
                },{
                    scid: 'test1:1.2',
                    pli: 'test1:pli1.2 abc',    // 16
                    de:  'test1:de1.2  abcd',   // 17
                }],
            }],
        }),
        new Sutta({
            sutta_uid: 'test2',
            author_uid: 'test',
            sections: [{
                segments: [{
                    scid: 'test2:1.1',
                    pli: 'test2:pli1.1 abcde',  // 18
                    en:  'test2:en1.1  abcdef', // 19
                },{
                    scid: 'test2:1.2',
                    pli: 'test2:pli1.2 abcdefg',    // 20
                    en:  'test2:en1.2  abcdefgh',   // 21
                }],
            }],
        }),
    ];

    it("ScvSingleton() creates the SCV Vue singleton", function() {
        var scv = new ScvSingleton(g);
        should(scv).properties({
            showId: false,
            iVoice: 0,
            scid: null,
            showLang: 0,
            search: null,
            maxResults: 5,
            ips: 6,
            lang: 'en',
        });
        scv.mounted(mockVueRoot);
        should.deepEqual(Object.keys(scv).sort(), [
            "showId",
            "iVoice",
            "scid",
            "showLang",
            "search",
            "maxResults",
            "ips",
            "lang",
        ].sort());
        should.deepEqual(scv.voices[0], {
            label: 'Amy (slower)',
            name: 'Amy',
            value: 'recite',
        });
    });
    it("deleteCookies() deletes ScvSingleton cookies", function() {
        mockVueRoot.$cookie.otherCookie = 'hello';
        mockVueRoot.$cookie.useCookies = true;
        mockVueRoot.$cookie.maxResults = 7;

        var scv = new ScvSingleton(g);
        scv.mounted(mockVueRoot);

        scv.deleteCookies();
        should.deepEqual(mockVueRoot.$cookie, {
            otherCookie: 'hello',
        });
    });
    it("loadCookie(prop) loads cookie value", function() {
        mockVueRoot.$cookie.maxResults = 7;
        delete mockVueRoot.$cookie.ips;

        var scv = new ScvSingleton(g);
        scv.mounted(mockVueRoot);
        should(scv.maxResults).equal(5);
        should(scv.ips).equal(6);
        scv.loadCookie('maxResults');
        should(scv.maxResults).equal(7);
        should(scv.ips).equal(6);
    });
    it("changed(prop) propagates properties to cookies", function() {
        var scv = new ScvSingleton(g);
        mockVueRoot.$cookie.otherCookie = 'hello';
        mockVueRoot.$cookie.useCookies = true;
        Object.keys(scv).forEach(key => {
            delete mockVueRoot.$cookie[key];
        });
        delete mockVueRoot.$cookie.useCookies;
        should.deepEqual(mockVueRoot.$cookie, {
            otherCookie: 'hello',
        });

        scv.mounted(mockVueRoot);
        should.deepEqual(mockVueRoot.$cookie, {
            otherCookie: 'hello',
        });

        // When useCookies is set to true, save all the properties
        scv.useCookies = true;
        scv.changed('useCookies');
        should.deepEqual(mockVueRoot.$cookie, {
            otherCookie: 'hello',
            iVoice: "0",
            ips: "6",
            maxResults: "5",
            showId: "false",
            showLang: "0",
            useCookies: "true",
        });

        // save one property
        scv.maxResults = 6;
        scv.ips = 5;
        scv.changed('maxResults');
        should.deepEqual(mockVueRoot.$cookie, {
            otherCookie: 'hello',
            iVoice: "0",
            ips: "6",
            maxResults: "6",
            showId: "false",
            showLang: "0",
            useCookies: "true",
        });

        // When useCookies is set to false, delete the cookies
        scv.useCookies = false;
        scv.changed('useCookies');
        should.deepEqual(mockVueRoot.$cookie, {
            otherCookie: 'hello',
        });
    });
    it("hash(opts) returns URL hash path", function() {
        var scv = new ScvSingleton(g);
        scv.mounted(mockVueRoot);
        Object.keys(scv).forEach(key => {
            delete mockVueRoot.$cookie[key];
        });

        // default is to use own properties
        should(scv.hash()).equal([
            "#/?iVoice=0",
            "ips=6",
            "lang=en",
            "maxResults=5",
            "showId=false",
            "showLang=0",
        ].join('&'));

        // selected properties can be changed
        should(scv.hash({
            maxResults: 6,
        })).equal([
            "#/?iVoice=0",
            "ips=6",
            "lang=en",
            "maxResults=6",
            "showId=false",
            "showLang=0",
        ].join('&'));

        // search is a property
        scv.search = "asdf";
        should(scv.hash({
            maxResults: 2,
        })).equal([
            "#/?iVoice=0",
            "ips=6",
            "lang=en",
            "maxResults=2",
            "search=asdf",
            "showId=false",
            "showLang=0",
        ].join('&'));

    });
    it("ipsChoices returns array of ips choices", function() {
        var scv = new ScvSingleton(g);
        should.deepEqual(scv.ipsChoices[1], {
            url: '/audio/rainforest-ambience-glory-sunz-public-domain.mp3',
            label: "Play Rainforest "+
                "Ambience Glory Sunz (Public Domain)",
            volume: 0.1,
            value: 1,
        });
    });
    it("has unenumerable properties", function() {
        var scv = new ScvSingleton(g);
        scv.title = "titletest";
        should(scv.title).equal('titletest');
        should(scv).properties({
            showId: false,
            iVoice: 0,
            scid: null,
            showLang: 0,
            search: null,
            maxResults: 5,
            ips: 6,
            lang: 'en',
        });
        scv.mounted(mockVueRoot);
        should(scv).properties({
            showId: false,
            iVoice: 0,
            scid: null,
            showLang: 0,
            search: null,
            maxResults: 5,
            ips: 6,
            lang: 'en',
        });
    });
    it("url(opts) returns url", function() {
        var scv = new ScvSingleton(g);

        // default
        should(scv.url()).match(new RegExp([
            "test-origin/test-path\\?r=[0-9.]*#/\\?iVoice=0",
            "ips=6",
            "lang=en",
            "maxResults=5",
            "showId=false",
            "showLang=0",
        ].join('&')));

        // with options
        should(scv.url({
            maxResults: 6,
        })).match(new RegExp([
            "test-origin/test-path\\?r=[0-9.]*#/\\?iVoice=0",
            "ips=6",
            "lang=en",
            "maxResults=6",
            "showId=false",
            "showLang=0",
        ].join('&')));
    });
    it("reload(opts) sets window location", function() {
        var scv = new ScvSingleton(g);

        g.window.location.href = null;

        // default
        scv.reload();
        should(g.window.location.href).match(new RegExp([
            "test-origin/test-path\\?r=[0-9.]*#/\\?iVoice=0",
            "ips=6",
            "lang=en",
            "maxResults=5",
            "showId=false",
            "showLang=0",
        ].join('&')));

        // with options
        scv.reload({
            maxResults: 9,
            lang: 'de',
        });
        should(g.window.location.href).match(new RegExp([
            "test-origin/test-path\\?r=[0-9.]*#/\\?iVoice=0",
            "ips=6",
            "lang=de",
            "maxResults=9",
            "showId=false",
            "showLang=0",
        ].join('&')));
    });
    it("duration(nSegs) returns estimated playtime", function() {
        var scv = new ScvSingleton(g);

        should(scv.duration(0).display).equal('--');

        // Pali/English
        scv.showLang = 0;
        should.deepEqual(scv.duration(1), {
            aria: '17 seconds',
            display: '17s',
            hours: 0,
            minutes: 0,
            seconds: 17,
            totalSeconds: 17,
        });
        should(scv.duration(10)).properties({
            display: '2m 54s',
            aria: '2 minutes and 54 seconds',
        });
        should(scv.duration(1000)).properties({
            display: '4h 52m',
            aria: '4 hours and 52 minutes',
            totalSeconds: 4*3600 + 51*60 + 14,
        });

        // Pali
        scv.showLang = 1;
        should(scv.duration(1).display).equal('11s');
        should(scv.duration(10).display).equal('1m 52s');
        should(scv.duration(1000).display).equal('3h 8m');

        // English
        scv.showLang = 2;
        should(scv.duration(1).display).equal('6s');
        should(scv.duration(10).display).equal('1m 2s');
        should(scv.duration(1000).display).equal('1h 44m');
    });
    it("duration(chars) returns estimated playtime", function() {
        var scv = new ScvSingleton(g);

        should(scv.duration({
            en: 0,      // chars
            pli: 0,     // chars
        }).display).equal('--');

        // Pali/English
        scv.showLang = 0;
        should.deepEqual(scv.duration({
            en:196,
        }), {
            aria: '17 seconds',
            display: '17s',
            hours: 0,
            minutes: 0,
            seconds: 17,
            totalSeconds: 17,
        });
        should(scv.duration({
            en: 1000,
            pli: 800,
        })).properties({
            display: '2m 39s',
            aria: '2 minutes and 39 seconds',
        });
        should(scv.duration({
            en: 60000,
            pli: 48000,
        })).properties({
            display: '2h 40m',
            aria: '2 hours and 40 minutes',
            totalSeconds: 2*3600 + 39*60 + 16,
        });

        // Pali
        scv.showLang = 1;
        should(scv.duration(1).display).equal('11s');
        should(scv.duration(10).display).equal('1m 52s');
        should(scv.duration(1000).display).equal('3h 8m');

        // English
        scv.showLang = 2;
        should(scv.duration(1).display).equal('6s');
        should(scv.duration(10).display).equal('1m 2s');
        should(scv.duration(1000).display).equal('1h 44m');
    });
    it("showPali/showTrans are true for showing text", function() {
        var scv = new ScvSingleton(g);

        scv.showLang = 0;
        should(scv.showPali).equal(true);
        should(scv.showTrans).equal(true);

        scv.showLang = 1;
        should(scv.showPali).equal(true);
        should(scv.showTrans).equal(false);

        scv.showLang = 2;
        should(scv.showPali).equal(false);
        should(scv.showTrans).equal(true);
    });
    it("mounted() loads properties from cookies", function() {
        var scv = new ScvSingleton(g);
        Object.assign(mockVueRoot.$cookie, {
            showId: "true",
            iVoice: 3,
            scid: "abc123",
            showLang: "2",
            search: "test-pat",
            maxResults: "9",
            ips: "6",
            lang: 'de',
        });
        should(scv.useCookies).equal(false); // initial value

        // vueRoot is created in main.js
        scv.mounted(mockVueRoot);

        // useCookies not true
        should(scv).properties({
            showId: false,
            iVoice: 0,
            scid: null,
            showLang: 0,
            search: null,
            maxResults: 5,
            ips: 6,
            lang: 'en',
        });

        // useCookies not true
        g.vueRoot.$cookie.useCookies = "true";
        scv.mounted(mockVueRoot);
        should(scv).properties({
            showId: true,
            iVoice: 3,
            scid: 'abc123',
            showLang: 2,
            search: "test-pat",
            maxResults: 9,
            ips: 6,
            lang: 'de',
        });
    });
    it("user stores login credentials", function() {
        var scv = new ScvSingleton(g);
        should.deepEqual(scv.user, {
            username: null,
            token: null,
            isAdmin: false,
            isEditor: false,
            isTranslator: false,
        });
        scv.mounted(mockVueRoot);
        should.deepEqual(scv.user, {
            username: null,
            token: null,
            isAdmin: false,
            isEditor: false,
            isTranslator: false,
        });
        var user = {
            username: 'testuser',
            token: 'testtoken',
            isAdmin: true,
            isEditor: true,
            isTranslator: true,
        };
        scv.user = user;
        should.deepEqual(scv.user, user);
    });
    it("charsRemaining(tracks,...) returns characters remaining", function() {
        var scv = new ScvSingleton(g);
        var pl = new Playlist();
        pl.addSutta(suttas[0]);
        pl.addSutta(suttas[1]);
        should.deepEqual(scv.charsRemaining(pl.tracks, 0, 0), {
            en: 53,
            pli: 66,
        });
        should.deepEqual(scv.charsRemaining(pl.tracks, 1, 0), {
            en: 40,
            pli: 38,
        });
        should.deepEqual(scv.charsRemaining(pl.tracks, 0, 1), {
            en: 40,
            pli: 54,
        });
    });
    it("timeRemaining(tracks,...) returns time remaining", function() {
        var scv = new ScvSingleton(g);
        should(scv.showTrans).equal(true);
        should(scv.showPali).equal(true);
        var pl = new Playlist();
        pl.addSutta(suttas[0]);
        pl.addSutta(suttas[1]);
        should.deepEqual(scv.timeRemaining(pl.tracks, 0, 0), {
            aria: "11 seconds",
            display: '11s',
            hours: 0,
            minutes: 0,
            seconds: 11,
            totalSeconds: 11,
            chars: {
                en: 53,
                pli: 66,
            },
        });
        should.deepEqual(scv.timeRemaining(pl.tracks, 1, 0), {
            aria: "7 seconds",
            display: '7s',
            hours: 0,
            minutes: 0,
            seconds: 7,
            totalSeconds: 7,
            chars: {
                en: 40,
                pli: 38,
            },
        });
        should.deepEqual(scv.timeRemaining(pl.tracks, 0, 1), {
            aria: "8 seconds",
            display: '8s',
            hours: 0,
            minutes: 0,
            seconds: 8,
            totalSeconds: 8,
            chars: {
                en: 40,
                pli: 54,
            },
        });

        // Show Pali
        scv.showLang = 1;
        should.deepEqual(scv.timeRemaining(pl.tracks, 0, 0), {
            aria: "6 seconds",
            display: '6s',
            hours: 0,
            minutes: 0,
            seconds: 6,
            totalSeconds: 6,
            chars: {
                en: 53,
                pli: 66,
            },
        });
        should.deepEqual(scv.timeRemaining(pl.tracks, 1, 0), {
            aria: "3 seconds",
            display: '3s',
            hours: 0,
            minutes: 0,
            seconds: 3,
            totalSeconds: 3,
            chars: {
                en: 40,
                pli: 38,
            },
        });
        should.deepEqual(scv.timeRemaining(pl.tracks, 0, 1), {
            aria: "5 seconds",
            display: '5s',
            hours: 0,
            minutes: 0,
            seconds: 5,
            totalSeconds: 5,
            chars: {
                en: 40,
                pli: 54,
            },
        });

        // Show translation
        scv.showLang = 2;
        should.deepEqual(scv.timeRemaining(pl.tracks, 0, 0), {
            aria: "5 seconds",
            display: '5s',
            hours: 0,
            minutes: 0,
            seconds: 5,
            totalSeconds: 5,
            chars: {
                en: 53,
                pli: 66,
            },
        });
        should.deepEqual(scv.timeRemaining(pl.tracks, 1, 0), {
            aria: "3 seconds",
            display: '3s',
            hours: 0,
            minutes: 0,
            seconds: 3,
            totalSeconds: 3,
            chars: {
                en: 40,
                pli: 38,
            },
        });
        should.deepEqual(scv.timeRemaining(pl.tracks, 0, 1), {
            aria: "3 seconds",
            display: '3s',
            hours: 0,
            minutes: 0,
            seconds: 3,
            totalSeconds: 3,
            chars: {
                en: 40,
                pli: 54,
            },
        });
    });
});

