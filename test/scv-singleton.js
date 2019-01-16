(typeof describe === 'function') && describe("scv-singleton", function() {
    const should = require("should");
    const ScvSingleton = require("../src/components/scv-singleton");
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
    };
    Object.defineProperty(g, "vueRoot", {
        get() {
            return mockVueRoot;
        }
    });
    Object.defineProperty(g, "Vue", {
        get() {
            return mockVue;
        }
    });

    it("TESTTESTScvSingleton() creates the SCV Vue singleton", function() {
        var scv = new ScvSingleton(g);
        should(scv).properties({
            showId: false,
            iVoice: 0,
            scid: null,
            showLang: 0,
            search: null,
            maxResults: 5,
            ips: 4,
            lang: 'en',
        });
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
    it("TESTTESTdeleteCookies() deletes ScvSingleton cookies", function() {
        mockVueRoot.$cookie.otherCookie = 'hello';
        mockVueRoot.$cookie.useCookies = true;
        mockVueRoot.$cookie.maxResults = 7;

        var scv = new ScvSingleton(g);
        scv.deleteCookies();
        should.deepEqual(mockVueRoot.$cookie, {
            otherCookie: 'hello',
        });
    });
    it("TESTTESTloadCookie(prop) loads cookie value", function() {
        mockVueRoot.$cookie.maxResults = 7;
        delete mockVueRoot.$cookie.ips;

        var scv = new ScvSingleton(g);
        should(scv.maxResults).equal(5);
        should(scv.ips).equal(4);
        scv.loadCookie('maxResults');
        should(scv.maxResults).equal(7);
        should(scv.ips).equal(4);
    });
    it("TESTTESTchanged(prop) propagates properties to cookies", function() {
        var scv = new ScvSingleton(g);
        Object.keys(scv).forEach(key => {
            delete mockVueRoot.$cookie[key];
        });
        
        should.deepEqual(mockVueRoot.$cookie, {
            otherCookie: 'hello',
        });


        // When useCookies is set to true, save all the properties
        scv.useCookies = true;
        scv.changed('useCookies');
        should.deepEqual(mockVueRoot.$cookie, {
            otherCookie: 'hello',
            iVoice: "0",
            ips: "4",
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
            ips: "4",
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
    it("TESTTESThash(opts) returns URL hash path", function() {
        var scv = new ScvSingleton(g);
        Object.keys(scv).forEach(key => {
            delete mockVueRoot.$cookie[key];
        });

        // default is to use own properties
        should(scv.hash()).equal([
            "#/?iVoice=0",
            "ips=4",
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
            "ips=4",
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
            "ips=4",
            "lang=en",
            "maxResults=2",
            "search=asdf",
            "showId=false",
            "showLang=0",
        ].join('&'));

    });
    it("TESTTESTipsChoices returns array of ips choices", function() {
        var scv = new ScvSingleton(g);
        should.deepEqual(scv.ipsChoices[1], {
            url: '/audio/rainforest-ambience-glory-sunz-public-domain.mp3',
            label: "Launch Sutta Player with Rainforest "+
                "Ambience Glory Sunz (Public Domain)",
            volume: 0.1,
            value: 1,
        });
    });
    it("TESTTESThas unenumerable properties", function() {
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
            ips: 4,
            lang: 'en',
        });
    });
    it("TESTTESTurl(opts) returns url", function() {
        var scv = new ScvSingleton(g);

        // default
        should(scv.url()).match(new RegExp([
            "test-origin/test-path\\?r=[0-9.]*#/\\?iVoice=0",
            "ips=4",
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
            "ips=4",
            "lang=en",
            "maxResults=6",
            "showId=false",
            "showLang=0",
        ].join('&')));
    });
    it("TESTTESTreload(opts) sets window location", function() {
        var scv = new ScvSingleton(g);

        g.window.location.href = null;

        // default
        scv.reload();
        should(g.window.location.href).match(new RegExp([
            "test-origin/test-path\\?r=[0-9.]*#/\\?iVoice=0",
            "ips=4",
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
            "ips=4",
            "lang=de",
            "maxResults=9",
            "showId=false",
            "showLang=0",
        ].join('&')));
    });
    it("TESTTESTmounted() loads properties from cookies", function() {
        var scv = new ScvSingleton(g);
        Object.assign(g.vueRoot.$cookie, {
            showId: "true",
            iVoice: 3,
            scid: "abc123",
            showLang: "2",
            search: "test-pat",
            maxResults: "9",
            ips: "6",
            lang: 'de',
        });

        // useCookies not true
        scv.mounted();
        should(scv).properties({
            showId: false,
            iVoice: 0,
            scid: null,
            showLang: 0,
            search: null,
            maxResults: 5,
            ips: 4,
            lang: 'en',
        });

        // useCookies not true
        g.vueRoot.$cookie.useCookies = "true";
        scv.mounted();
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
});

