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

    const EXPIRES = {
        expires: "100Y",
    };

    const LANGUAGES = [{
        name: 'en',
        label: 'English',
    }, {
        name: 'de',
        label: 'Deutsch',
    }];

    class ScvSingleton { 
        constructor(g) {
            this.showId = false;
            this.vnameTrans = 'Amy';
            this.vnameRoot = 'Aditi';
            this.scid = null;
            this.showLang = this.SHOWLANG_BOTH;
            this.search = null;
            this.maxResults = 5;
            this.ips = 6;
            this.lang = 'en';
            this.locale = 'en';
            if (g == null) {
                throw new Error(`g is required`);
            }
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

        get languages() {
            return LANGUAGES;
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
                this.vueRoot.$cookie.set("useCookies", value, EXPIRES);
            } else {
                this.vueRoot.$cookie.delete("useCookies");
            }
        }

        deleteCookies() {
            this.vueRoot.$cookie.delete('useCookies');
            Object.keys(this).forEach(key => {
                this.vueRoot.$cookie.delete(key);
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

        changed(prop) {
            var cookie = this.vueRoot.$cookie;
            if (prop === 'lang') {
                var lang = this.lang;
                var lv = this.langVoices()
                    .filter(v => v.name === this.vnameTrans);
                if (lv.length === 0) {
                    var voice = this.langVoices()[0];

                    this.vnameTrans = voice && voice.name || 'Amy';
                    console.log(`choosing voice ${this.vnameTrans}`,
                        `for ${lang}`);
                    this.changed('vnameTrans');
                }
            }
            var v = this[prop];
            if (v != null && this.vueRoot) {
                if (this.useCookies) {
                    cookie.set(prop, v, EXPIRES);
                    console.log(`setting cookie (${prop}):${v}`,
                        `${this.vueRoot.$cookie.get(prop)}`, 
                        typeof this.vueRoot.$cookie.get(prop));
                }
                if (prop === 'useCookies') {
                    if (v) {
                        cookie.set( "showId", this.showId, EXPIRES);
                        cookie.set( "vnameTrans", this.vnameTrans, EXPIRES);
                        cookie.set( "vnameRoot", this.vnameRoot, EXPIRES);
                        cookie.set( "lang", this.lang, EXPIRES);
                        cookie.set( "maxResults", this.maxResults, EXPIRES);
                        cookie.set( "showLang", this.showLang, EXPIRES);
                        cookie.set( "locale", this.locale, EXPIRES);
                        cookie.set( "ips", this.ips, EXPIRES);
                        cookie.set( "useCookies", this.useCookies, EXPIRES);
                        console.log(`saved settings to cookies`, cookie);
                    } else {
                        Object.keys(this).forEach(key => {
                            cookie.delete(key);
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
            var navLang = g.navigator && g.navigator.language;
            if (navLang) {
                this.locale = navLang.split('-')[0];
                this.lang = this.locale;
                console.log(`ScvSingleton.mounted() navigator.language:${navLang}`);
            }
            var query = vueRoot.$route.query;
            if (this.useCookies) {
                let cookies = {};
                Object.keys(this).forEach(key => {
                    this.loadCookie(key);
                    cookies[key] = this[key];
                });
                console.log(`ScvSingleton.mounted() cookies:`, cookies);
            } 
            if (query) {
                console.log(`ScvSingleton.mounted() query:`, query);
                if (!this.useCookies) {
                    query.showId != null &&
                        (this.showId = query.showId==='true');
                    query.vnameTrans &&
                        (this.vnameTrans = query.vnameTrans);
                    query.vnameRoot &&
                        (this.vnameRoot = query.vnameRoot);
                    query.maxResults &&
                        (this.maxResults = Number(query.maxResults));
                    query.showLang &&
                        (this.showLang = Number(query.showLang||0));
                    query.ips != null &&
                        (this.ips = Number(query.ips));
                    query.lang != null &&
                        (this.lang = query.lang);
                    query.locale != null &&
                        (this.locale = query.locale);
                }
                var search = query.scid || query.search || '';
                query.search && (this.search = search);
            }
            if (LANGUAGES.filter(l => l.name === this.locale).length === 0) {
                console.log(`ScvSingleton.mounted() unknown locale:${this.locale}=>en`);
                this.locale = 'en';
                this.lang = 'en';
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
                if (lang === 'pli') {
                    showPali && (seconds += chars[lang] * DN33_PLI_SECONDS_PER_CHAR);
                } else {
                    showTrans && (seconds += chars[lang] * DN33_EN_SECONDS_PER_CHAR);
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
                            charsTot += remCharsTot[lang];
                            chars += remChars[lang];
                        }
                    } else if (showTrans) {
                        charsTot += remCharsTot[lang];
                        chars += remChars[lang];
                    }
                });
                var secsRem = charsTot ? stats.seconds * chars / charsTot : 0;
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
                                    acc[key] = (acc[key] || 0) + seg[key].length;
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
                ? this.voices.filter(v => v.langTrans === lang)
                : [];
        }
    }

    module.exports = exports.ScvSingleton = ScvSingleton;
})(typeof exports === "object" ? exports : (exports = {}));

