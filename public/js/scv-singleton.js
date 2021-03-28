(function(exports) {
    const DN33_EN_SECONDS = 2*3600 + 0*60 + 27;
    const DN33_EN_SECONDS_PER_SEGMENT = DN33_EN_SECONDS/(1158);
    const DN33_PLI_SECONDS_PER_SEGMENT = 1.8 * DN33_EN_SECONDS_PER_SEGMENT;
    const DN33_EN_SECONDS_PER_CHAR = DN33_EN_SECONDS/(83588);
    const DN33_PLI_SECONDS_PER_CHAR = DN33_EN_SECONDS/(79412);
    const IPS_CHOICES = [{
        url: '',
        i18n: 'bellNone',
        value: 0,
    },{
        url: '/audio/rainforest-ambience-glory-sunz-public-domain.mp3',
        i18n: 'bellRainforest',
        volume: 0.1,
        value: 1,
        hide: true,
    },{
        url: '/audio/indian-bell-flemur-sampling-plus-1.0.mp3',
        i18n: 'bellIndian',
        volume: 0.1,
        value: 2,
    },{
        url: '/audio/tibetan-singing-bowl-horst-cc0.mp3',
        i18n: "bellTibetan",
        volume: 0.3,
        value: 3,
    },{
        url: '/audio/jetrye-bell-meditation-cleaned-CC0.mp3',
        i18n: "bellMeditation",
        volume: 0.1,
        value: 4,
        hide: true,
    },{
        url: '/audio/STE-004-Coemgenu.mp3',
        i18n: "bellMidrange",
        volume: 0.5,
        value: 5,
    },{
        url: '/audio/simple-bell.mp3',
        i18n: "bellSimple",
        volume: 0.5,
        value: 6,
    }];

    const COOKIE_SETTINGS = {
        expires: "100Y",
        SameSite: "Strict",
    };

    const WEB_LANGUAGES = [{
        name: 'cs',
        label: 'Čeština / CS',
    }, {
        name: 'da',
        label: 'Dansk / DA',
    }, {
        name: 'de',
        label: 'Deutsch / DE',
    }, {
        name: 'en',
        label: 'English / EN',
    }, {
        name: 'fr',
        label: 'Français / FR',
    }, {
        name: 'hi',
        label: 'हिंदी / HI',
    }, {
        name: 'is',
        label: 'Íslenska / IS',
    }, {
        name: 'ja',
        label: '日本語 / JA',
    }, {
        name: 'nb',
        label: 'Norsk / NB',
    }, {
        name: 'nl',
        label: 'Nederlands / NL',
    }, {
        name: 'pl',
        label: 'Polski / PL',
    }, {
        name: 'pt',
        label: 'Português / PT',
    }, {
        name: 'ro',
        label: 'Română / RO',
    }, {
        name: 'si',
        label: 'සිංහල / SI',
    }, {
        name: 'vi',
        label: 'Tiếng Việt / VI',
    }];

    class ScvSingleton { 
        constructor(g) {
            this.showId = false;

            // default voices
            this.vnameRoot = 'Aditi';
            this.vnameTrans = 'Amy';

            // Default language may change default vnameTrans
            var navLang = g.navigator && g.navigator.language;
            var navLang = g.navigator && g.navigator.language;
            this.locale = navLang && navLang.split('-')[0] || 'en';
            this.lang = this.locale;
            this.changed('lang');
            this.checkVoiceLang(false);
            console.log(`ScvSingleton.ctor`,
                `navLang:${navLang}`,
                `vnameTrans:${this.vnameTrans}`,
                '');

            this.scid = null;
            this.showLang = this.SHOWLANG_BOTH;
            this.fullLine = false;
            this.search = null;
            this.maxResults = 5;
            this.audio = this.AUDIO_OPUS;
            this.ips = 6;
            if (g == null) {
                throw new Error(`g is required`);
            }
            Object.defineProperty(this, "transLanguages", {
                writable: true,
                value: [],
            });
            Object.defineProperty(this, "authors", {
                writable: true,
                value: {},
            });
            Object.defineProperty(this, "_voices", {
                writable: true,
                value: [],
            });
            Object.defineProperty(this, "_user", {
                writable: true,
                value: {
                    username: null,
                    isAdmin: false,
                    isTranslator: false,
                    isEditor: false,
                    token: null,
                },
            });
            Object.defineProperty(this, "g", {
                value: g,
            });
            Object.defineProperty(this, "vueRoot", {
                writable: true,
                value: g.vueRoot,
            });
            Object.defineProperty(this, "title", {
                writable: true,
                value: "no title",
            });
        }

        get SHOWLANG_BOTH() {
            return 0;
        }

        get SHOWLANG_PALI() {
            return 1;
        }

        get SHOWLANG_TRANS() {
            return 2;
        }

        get AUDIO_MP3() {
            return 'mp3';
        }

        get AUDIO_OGG() {
            return 'ogg';
        }

        get AUDIO_OPUS() {
            return 'opus';
        }

        get languages() {
            return WEB_LANGUAGES;
        }

        get user() {
            return this._user;
        }

        set user(value) {
            var g = this.g;
            g.Vue.set(this._user, "username", value.username);
            g.Vue.set(this._user, "token", value.token);
            g.Vue.set(this._user, "isAdmin", value.isAdmin);
            g.Vue.set(this._user, "isTranslator", value.isTranslator);
            g.Vue.set(this._user, "isEditor", value.isEditor);
        }

        get ipsChoices() {
            return IPS_CHOICES;
        }

        get voices() {
            return this._voices; 
        }

        set voices(value) {
            var g = this.g;
            g.Vue.set(this, "_voices", value);
        }

        get useCookies() {
            var g = this.g;
            return this.vueRoot 
                ? this.vueRoot.$cookie.get("useCookies") === 'true'
                : false;
        }

        get showPali( ){
            return this.showLang === this.SHOWLANG_BOTH 
                || this.showLang === this.SHOWLANG_PALI;
        }

        get showTrans(){
            return this.showLang === this.SHOWLANG_BOTH 
                || this.showLang === this.SHOWLANG_TRANS;
        }

        set useCookies(value) {
            if (value) {
                this.vueRoot.$cookie.set("useCookies", value, COOKIE_SETTINGS);
            } else {
                this.vueRoot.$cookie.delete("useCookies");
            }
        }

        deleteCookies() {
            this.vueRoot.$cookie.set('useCookies', false, COOKIE_SETTINGS);
            Object.keys(this).forEach(key => {
                if (key !== 'useCookies') {
                    this.vueRoot.$cookie.delete(key);
                    console.log('deleting cookie', key);
                }
            });
            console.log('cookies deleted');
        }

        loadCookie(prop) {
            var g = this.g;
            var v = this.vueRoot.$cookie.get(prop);
            if (v === 'false') {
                g.Vue.set(this, prop, false);
            } else if (v === 'true') {
                g.Vue.set(this, prop, true);
            } else if (v != null) {
                var vnum = Number(v);
                g.Vue.set(this, prop, `${vnum}`===v ? vnum : v);
            }
        }

        checkVoiceLang(save=true, tries = 1) {
            if (!this.voices || !this.voices.length) {
                if (tries < 3) {
                    console.log(`checkVoiceLang(${save},${tries})`,
                        `lang:${this.lang}`,
                        `...`);
                    var that = this;
                    setTimeout(
                        () => that.checkVoiceLang(save, tries+1), 
                        1000);
                } else {
                    console.warn(`checkVoiceLang(${save},${tries})`,
                        `lang:${this.lang}`,
                        `GIVING UP`);
                }
                return;
            }
            console.log(`checkVoiceLang(${save},${tries})`,
                `lang:${this.lang}`);

            var lang = this.lang;
            var lv = this.langVoices().filter(v => 
                v.name === this.vnameTrans);
            if (lv.length === 0) { // no voice
                var voice = this.langVoices()[0];
                var vname = voice && voice.name;
                if (vname) {
                    console.log(
                        `checkVoiceLang changing voice for lang:${lang}`,
                        `${this.vnameTrans} => ${vname}`,
                    '');
                    this.vnameTrans = vname;
                    save && this.changed('vnameTrans');
                }
            }
        }

        changed(prop, tries=1) { // save changes
            if (this.vueRoot == null) {
                if (tries < 3) {
                    var that = this;
                    console.log(`changed(${prop}, ${tries})...`);
                    setTimeout(() => that.changed(prop, tries+1));
                    return;
                } else {
                    console.warn(`changed(${prop}, ${tries})`,
                        `GIVING UP`);
                    return;
                }
                return;
            }
            if (tries > 1) {
                console.log(`...changed(${prop}, ${tries})`);
            }

            var cookie = this.vueRoot.$cookie;
            var v = this[prop];
            if (v != null && this.vueRoot) {
                if (this.useCookies) {
                    cookie.set(prop, v, COOKIE_SETTINGS);
                    console.log(`setting cookie (${prop}):${v}`,
                        `${this.vueRoot.$cookie.get(prop)}`, 
                        typeof this.vueRoot.$cookie.get(prop));
                }
                if (prop === 'useCookies') {
                    if (v) {
                        cookie.set( "showId", this.showId, COOKIE_SETTINGS);
                        cookie.set( "vnameTrans", this.vnameTrans, COOKIE_SETTINGS);
                        cookie.set( "vnameRoot", this.vnameRoot, COOKIE_SETTINGS);
                        cookie.set( "lang", this.lang, COOKIE_SETTINGS);
                        cookie.set( "maxResults", this.maxResults, COOKIE_SETTINGS);
                        cookie.set( "audio", this.audio, COOKIE_SETTINGS);
                        cookie.set( "showLang", this.showLang, COOKIE_SETTINGS);
                        cookie.set( "fullLine", this.fullLine, COOKIE_SETTINGS);
                        cookie.set( "locale", this.locale, COOKIE_SETTINGS);
                        cookie.set( "ips", this.ips, COOKIE_SETTINGS);
                        cookie.set( "useCookies", this.useCookies, COOKIE_SETTINGS);
                        console.log(`saved settings to cookies`, cookie);
                    } else {
                        Object.keys(this).forEach(key => {
                            if (key === 'useCookies') {
                                cookie.set(key, false, COOKIE_SETTINGS);
                            } else {
                                cookie.delete(key);
                                console.log(`deleting cookie:`, key);
                            }
                        });
                    }
                }
            }
        }

        hash(opts={}) {
            var state = Object.assign({}, this, opts);
            var hash = '';
            if (this.useCookies) {
                var search = state.search || '';
                hash = `#/?search=${search}`;
            } else {
                hash = Object.keys(state).sort().reduce((acc,key) => {
                    var val = state[key];
                    if (val != null) {
                        if (acc == null) {
                            acc = `#/?`;
                        } else {
                            acc = acc + '&';
                        }
                        acc += `${key}=${state[key]}`;
                    }
                    return acc;
                }, null);
            }
            return `${hash}`;
        }

        url(opts={}) {
            var g = this.g;
            var hash = this.hash(opts);
            var loc = g.window.location;
            var r = Math.random();
            return `${loc.origin}${loc.pathname}?r=${r}${hash}`;
        }

        reload(opts={}) {
            var g = this.g;
            Object.assign(this, opts);
            var url = this.url();
            console.debug("main.scvState.reload()", url);
            g.window.location.href = url;
            return;
        }

        mounted(vueRoot) {
            var g = this.g;
            this.vueRoot = vueRoot;
            var query = vueRoot.$route.query;
            if (this.useCookies) {
                let cookies = {};
                let that = this;
                Object.keys(this).forEach(key => {
                    this.loadCookie(key);
                    cookies[key] = this[key];
                    that.changed(key);
                });
                console.log(`ScvSingleton.mounted() cookies:`, cookies);
            } 
            var isSCLink = query && query.lang && query.locale===undefined;
            if (isSCLink) {
                console.log(`ScvSingleton.mounted() SC query:`, query);
                this.lang = query.lang;
                if (!this.useCookies) {
                    this.locale = query.lang; 
                }
            }
            if (query) {
                if (!this.useCookies) {
                    query.showId != null &&
                        (this.showId = query.showId==='true');
                    query.vnameTrans &&
                        (this.vnameTrans = query.vnameTrans);
                    query.vnameRoot &&
                        (this.vnameRoot = query.vnameRoot);
                    query.audio &&
                        (this.audio = query.audio);
                    query.maxResults &&
                        (this.maxResults = Number(query.maxResults));
                    query.fullLine && 
                        (this.fullLine = !!query.fullLine);
                    query.showLang && 
                        (this.showLang = Number(query.showLang||0));
                    query.ips != null &&
                        (this.ips = Number(query.ips));
                    if (query.lang && this.lang !== query.lang) {
                        this.lang = query.lang;
                        this.checkVoiceLang(false);
                    }
                    query.locale != null &&
                        (this.locale = query.locale);
                }
                var search = query.scid || query.search || '';
                query.search && (this.search = search);
            }
            var localeVoices = WEB_LANGUAGES
                .filter(l => l.name===this.locale);
            if (localeVoices.length === 0) {
                console.log(`ScvSingleton.mounted()`,
                    `unknown locale:${this.locale}=>en`);
                this.locale = 'en';
                this.changed('locale');
                this.lang = 'en';
                this.changed('lang');
                this.checkVoiceLang();
            }
            vueRoot.$vuetify.lang.current = this.locale;
        }

        durationDisplay(totalSeconds) {
            totalSeconds = Math.round(totalSeconds);
            var seconds = totalSeconds;
            var hours = Math.trunc(seconds / 3600);
            seconds -= hours * 3600;
            var minutes = Math.trunc(seconds / 60);
            seconds -= minutes * 60;
            var $vuetify = this.vueRoot.$vuetify;
            if (hours) {
                var tDisplay = $vuetify.lang.t('$vuetify.scv.HHMM');
                var tAria = $vuetify.lang.t('$vuetify.scv.ariaHHMM');
            } else if (minutes) {
                var tDisplay = $vuetify.lang.t('$vuetify.scv.MMSS');
                var tAria = $vuetify.lang.t('$vuetify.scv.ariaMMSS');
            } else {
                var tDisplay = $vuetify.lang.t('$vuetify.scv.seconds');
                var tAria = $vuetify.lang.t('$vuetify.scv.ariaSeconds');
            }
            var display = tDisplay
                .replace(/A_HOURS/, hours)
                .replace(/A_MINUTES/, minutes)
                .replace(/A_SECONDS/, seconds);
            var aria = tAria
                .replace(/A_HOURS/, hours)
                .replace(/A_MINUTES/, minutes)
                .replace(/A_SECONDS/, seconds);

            return {
                totalSeconds,
                hours,
                minutes,
                seconds,
                display,
                aria,
            }
        }

        duration(obj){
            if (typeof obj === 'number') {
                return this.durationSegments(obj);
            }
            var {
                showTrans,
                showPali,
            } = this || {};
            var chars = obj;
            var seconds = 0;
            Object.keys(obj).forEach(lang => {
                var cl = chars[lang];
                if (lang === 'pli') {
                    showPali && (seconds += cl*DN33_PLI_SECONDS_PER_CHAR);
                } else {
                    showTrans && (seconds += cl*DN33_EN_SECONDS_PER_CHAR);
                }
            });
            return this.durationDisplay(seconds);
        }

        durationSegments(nSegments){
            var secondsPerSegment =
                (this.showPali ? DN33_PLI_SECONDS_PER_SEGMENT : 0) +
                (this.showTrans ? DN33_EN_SECONDS_PER_SEGMENT: 0);
            var totalSeconds = Math.trunc(nSegments * secondsPerSegment);
            return this.durationDisplay(totalSeconds);
        }

        timeRemaining(tracks, curTrack=0, curSeg=0, stats) {
            var remChars = this.charsRemaining(tracks, curTrack, curSeg);
            var result = {
                chars,
            };
            if (stats) {
                var {
                    showTrans,
                    showPali,
                } = this;
                var charsTot = 0;
                var chars = 0;
                var remCharsTot = this.charsRemaining(tracks, 0, 0);
                Object.keys(remCharsTot).forEach(lang => {
                    if (lang === 'expanded') {
                        // skip
                    } else if (lang === 'pli') {
                        if (showPali) {
                            charsTot += remCharsTot[lang] || 0;
                            chars += remChars[lang] || 0;
                        }
                    } else if (showTrans && lang === this.lang) {
                        charsTot += remCharsTot[lang] || 0;
                        chars += remChars[lang] || 0;
                    }
                });

                let seconds = stats.seconds;
                var secsRem = charsTot === 0 || isNaN(charsTot)
                    ? seconds
                    : seconds * chars / charsTot ;
                Object.assign(result, this.durationDisplay(secsRem));
            } else {
                console.log(`timeRemaining (DEPRECATED)`, remChars);
                Object.assign(result, this.duration(remChars));
            }
            result.chars = remChars;
            return result;
        }

        charsRemaining(tracks, curTrack=0, curSeg=0) {
            const EN_CHARS_PER_SEGMENT = 
                DN33_EN_SECONDS_PER_SEGMENT/DN33_EN_SECONDS_PER_CHAR; 
            const PLI_CHARS_PER_SEGMENT = 
                DN33_PLI_SECONDS_PER_SEGMENT/DN33_PLI_SECONDS_PER_CHAR; 
            return tracks.reduce((acc, track, iTrack) => {
                if (curTrack <= iTrack) {
                    var segments = track.segments;
                    if (segments) {
                        segments.forEach((seg, iSeg) => {
                            var remaining = curTrack < iTrack ||
                                iTrack === curTrack && curSeg <= iSeg;
                            remaining && Object.keys(seg).forEach(key => {
                                if (key !== 'scid') {
                                    acc[key] = (acc[key] || 0) + 
                                        seg[key].length;
                                }
                            });
                        });
                    } else {
                        var lang = this.lang || 'en';
                        var segsRemaining = track.nSegments - curSeg;
                        acc[lang] = acc[lang] || 0;
                        acc[lang] += segsRemaining * EN_CHARS_PER_SEGMENT;
                        acc['pli'] = acc['pli'] || 0;
                        acc['pli'] += segsRemaining * PLI_CHARS_PER_SEGMENT;
                    }
                }
                return acc;
            }, {});
        }
        
        langVoices(lang = this.lang) {
            return this.voices
                ? this.voices.filter(v => v.langTrans===lang)
                : [];
        }
    }

    module.exports = exports.ScvSingleton = ScvSingleton;
})(typeof exports === "object" ? exports : (exports = {}));

