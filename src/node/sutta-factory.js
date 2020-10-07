(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Definitions = require('./definitions');
    const Words = require('./words');
    const Sutta = require('./sutta');
    const SuttaCentralApi = require('./sutta-central-api');
    const Section = require('./section');
    const SectionParser = require('./section-parser');
    const { SuttaCentralId } = require('suttacentral-api');
    const RE_ELLIPSIS = new RegExp(`${Words.U_ELLIPSIS}$`);
    const OPTS_EN = {
        prop: 'en',
    };
    const EXPANDABLE_SUTTAS = {
        mn1: true,
        mn41: true, 
        mn8: false, // very difficult to expand because of grammatical changes
        "sn12.23": true,
    };
    const TRANSLATORS = {
        'en': [ 
            'sujato', // supported
            'brahmali', // supported
            'bodhi',
            'thanissaro',
            'sujato-walton',
            'caf-rhysdavids',
            'horner',
        ],
        'de': [
            'sabbamitta', // supported
            'mettiko', 
            'geiger',
            'nyanaponika',
            'hecker',
            'nyanatiloka',
            'kusalagnana-maitrimurti-traetow',
            'franke',
            'vri',
        ],
        'pt': [
            'beisert',
            'guimaraes',
            'laera',
        ],
        'pl': [
            'kowaleski',
            'jagodzinski',
        ],
        'nd': [
        ],
        'po': [
        ],
        'is': [
        ],
        'ja': [
            'kaz',
            'taikan',
        ],
        'vi': [
        ],
    };
    const SUPPORTED_TRANSLATORS = {
        sabbamitta: true,
        sujato: true,
        'sujato-walton': true,
        kaz: false, // ja vs jpn?
        bodhi: true,
        geiger: true,
        horner: true,
        thanissaro: true,
        'caf_rhysdavids': true,
    };
    const SUPPORTED_LANGUAGES = {
        da: true,
        de: true,
        en: true,
        hi: true,
        is: true,
        ja: true,
        nb: true,
        nl: true,
        pl: true,
        pt: true,
        po: true,
        pt: true,
        ro: true,
        vi: true,

    };

    class SuttaFactory { 
        constructor(opts={}) {
            this.type = this.constructor.name;
            this.lang = opts.lang || 'en';
            this.prop = opts.prop || this.lang;
            this.autoSection = !!opts.autoSection;
            this.reHeader = opts.reHeader || Sutta.RE_HEADER;
            this.suttaCentralApi = opts.suttaCentralApi;
            this.suttaLoader = opts.suttaLoader;
            this.plainText = opts.plainText === true || 
                opts.plainText == null;
        }

        static loadSutta(opts={}) {
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var sf = await new SuttaFactory(opts).initialize();
                    var sutta = await sf.loadSutta(opts);
                    resolve(sutta);
                } catch(e) {reject(e);} })();
            });
        }

        initialize() {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    if (that.suttaCentralApi && that.suttaCentralApi.initialized == null) {
                        await that.suttaCentralApi.initialize();
                    }
                    resolve(that);
                } catch(e) {reject(e);} })();
            });
        }

        stripHtml(sutta, opts = {}) {
            var {
                language,
            } = opts;
            var lang = language || this.lang;
            sutta.segments.forEach(seg => {
                var text = seg[lang];
                if (text && text.indexOf('<') >= 0) {
                    text = text.replace(/<\/li>/g,'\n');
                    seg[lang] = text.replace(/<[^>]+>/g,'');
                }
            });
            return sutta;
        }

        supportedSuttas(){
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var files = [];
                    var suttas = {};
                    files.forEach(f => {
                        var flocal = f.split('/sc/')[1];
                        var ftokens = flocal.split('/');
                        var collection = ftokens[0];
                        suttas[collection] = suttas[collection] || [];
                        var fname = ftokens[ftokens.length - 1];
                        if (fname !== 'info.po') {
                            var sutta_uid = fname
                                .replace('.po','')
                                .replace(/([^0-9])0+/gum,'$1');
                            suttas[collection].push(sutta_uid);
                        }
                    });
                    resolve(suttas);
                } catch(e) {reject(e);} })();
            });
        }

        sectionSutta(sutta) {
            var lang = sutta.lang || this.lang;
            var segStart = 0;
            var segments = sutta.segments;
            if (segments == null || segments.length === 0) {
                throw new Error('Sutta has no segments');
            }
            var group0 = new SuttaCentralId(segments[0].scid).groups[0];
            var newSections = segments.reduce((acc,seg,i) => {
                var scid = new SuttaCentralId(seg.scid);
                if (segStart === 0 && scid.groups[0] === group0) {
                    // don't split segment 0
                } else if (segStart === 0 && scid.groups[0] !== group0 || 
                    /^[1-9]/.test(seg[lang])) {
                    acc.push(new Section({
                        segments: segments.slice(segStart,i),
                        prop: lang,
                    }));
                    segStart = i;
                }
                return acc;
            }, []);
            newSections.push(new Section({
                segments: segments.slice(segStart),
                prop: lang,
            }));
            if (newSections.length <= sutta.sections.length) {
                return sutta; // no sections
            }
            return new Sutta(Object.assign({}, sutta, {
                segments: null,
                sections: newSections,
            }));
        }

        translators(opts={}) {
            var language = opts.language || 'en';
            var translators = TRANSLATORS[language] || TRANSLATORS['en'];
            var translator = opts.translator;
            if (translator && translators.indexOf(translator) >= 0) {
                translators = [translator].concat(
                    translators.filter(t => t !== translator));
            }

            return translators;
        }

        loadSutta(opts={}) {
            if (typeof opts === 'string') {
                opts = {
                    scid: opts,
                }
            }
            var that = this;
            var language = opts.language || 'en';
            var autoSection = opts.autoSection == null 
                ? this.autoSection : opts.autoSection;
            var plainText = opts.plainText == null 
                ? this.plainText : opts.plainText;
            if (SUPPORTED_LANGUAGES[language] !== true) {
                return Promise.reject(
                    new Error(
                        `Voice does not support language: ${language}`));
            }
            var translators = this.translators(opts);
            var o = Object.assign({}, opts);
            o.id = o.id || o.scid; // for pootl
 
            var pbody = (resolve, reject) => (async function() { try {
                var sutta = null;
                for (var i = 0; !sutta && i <= translators.length; i++) {
                    var translator = translators[i];
                    if (translator == null) {
                        throw new Error(
                            `Sutta not found:${JSON.stringify(opts)}`);
                    }
                    o.translator = translator;
                    if (that.suttaLoader) {
                        sutta = await that.suttaLoader(o);
                    } 
                    if (!sutta) {
                        if (that.suttaCentralApi) {
                            sutta = await that.suttaCentralApi.loadSutta(o);
                        } else {
                            throw new Error(`I miss Pootl`);
                        }
                    }
                }
                if (plainText) {
                    sutta = that.stripHtml(sutta);
                }
                if (o.expand && EXPANDABLE_SUTTAS[sutta.sutta_uid]) {
                    sutta = that.expandSutta(that.parseSutta(sutta))
                }
                if (autoSection) {
                    sutta = that.sectionSutta(sutta);
                }
                resolve(sutta);
            } catch(e) {reject(e);} })();
            return new Promise(pbody);
        }

        parseSutta(sutta) {
            if (sutta.support && sutta.support.value === 'Legacy') {
                return sutta;
            }
            var segments = sutta.segments.slice();
            var parser = new SectionParser({
                prop: this.prop,
            });
            var sections = [];

            var header = [];
            while (Sutta.isHeader(segments[0])) {
                header.push(segments.shift());
            }
            if (header.length) {
                sections.push(new Section({
                    segments:header,
                }));
            }
            
            while (segments.length) {
                var section = parser.parseExpandableSection(segments);
                if (section == null) {
                    sections.push(new Section({
                        segments,
                    }));
                    break;
                } 
                var index = segments.indexOf(section.segments[0]);
                if (index) {
                    sections.push(new Section({
                        segments: segments.slice(0, index),
                    }));
                }
                sections.push(section);
                segments = segments.slice(index+section.segments.length);
            }
            return new Sutta(Object.assign({}, sutta, {
                sections,
            }));
        }

        expandSutta(sutta) {
            var parsedSutta = this.parseSutta(sutta);
            var sections = parsedSutta.sections.map(sect => {
                if (sect.expandable) {
                    return sect.expandAll();
                }
                return sect;
            });
            return new Sutta(Object.assign({}, sutta, {
                sections,
                prop: this.prop,
            }));
        }
    }

    module.exports = exports.SuttaFactory = SuttaFactory;
})(typeof exports === "object" ? exports : (exports = {}));

