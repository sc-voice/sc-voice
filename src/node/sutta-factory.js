(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Definitions = require('./definitions');
    const Words = require('./words');
    const Sutta = require('./sutta');
    const SuttaCentralApi = require('./sutta-central-api');
    const Section = require('./section');
    const SectionParser = require('./section-parser');
    const PoParser = require('./po-parser');
    const SuttaCentralId = require('./sutta-central-id');
    const RE_ELLIPSIS = new RegExp(`${Words.U_ELLIPSIS}$`);
    const OPTS_EN = {
        prop: 'en',
    };
    const EXPANDABLE_SUTTAS = {
        mn1: true,
        mn41: true, 
        mn8: false, // very difficult to expand because of grammatical changes
    };
    const SUPPORTED_TRANSLATORS = {
        sujato: true,
        bodhi: true,
        horner: true,
        thanissaro: true,
    };
    const SUPPORTED_LANGUAGES = {
        en: true,
        de: true,
    };

    class SuttaFactory { 
        constructor(opts={}) {
            this.type = this.constructor.name;
            this.prop = opts.prop || OPTS_EN.prop;
            this.reHeader = opts.reHeader || Sutta.RE_HEADER;
            this.suttaCentralApi = opts.suttaCentralApi;
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

        static loadSuttaPootl(opts={}) {
            return new SuttaFactory(opts).loadSuttaPootl(opts);
        }

        initialize() {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    if (that.suttaCentralApi) {
                        await that.suttaCentralApi.initialize();
                    }
                    resolve(that);
                } catch(e) {reject(e);} })();
            });
        }

        loadSutta(opts={}) {
            var language = opts.language || 'en';
            if (SUPPORTED_LANGUAGES[language] !== true) {
                return Promise.reject(
                    new Error(`SC-Voice does not support language: ${language}`));
            }
            var translator = opts.translator || 'sujato';
            if (SUPPORTED_TRANSLATORS[translator] !== true) {
                return Promise.reject(
                    new Error(`SC-Voice does not support translator: ${translator}`));
            }

            return new Promise((resolve, reject) => { try {
                var promise = this.suttaCentralApi 
                    ? this.suttaCentralApi.loadSutta(opts)
                    : this.loadSuttaPootl(opts);
                promise.then(sutta => {
                    if (opts.expand) {
                    } else{
                        resolve(sutta);
                    }
                }).catch(e => reject(e));
            } catch(e) {reject(e);} });
        }

        loadSuttaPootl(opts={}) {
            return new Promise((resolve, reject) => {
                (async function() { try {
                    if (typeof opts === 'string') {
                        opts = {
                            id: opts,
                        }
                    }
                    var language = opts.language || 'en';
                    var translator = opts.translator || 'sujato';
                    var parser = new PoParser();
                    var id = opts.id || 'mn1';
                    var suttaPath = PoParser.suttaPath(id, opts.root);
                    var segments = await parser.parse(suttaPath, opts);
                    resolve(new Sutta(Object.assign({
                        sutta_uid: id,
                        support: Definitions.SUPPORT_LEVELS.Supported,
                        segments,
                    }, opts)));
                } catch(e) {reject(e);} })();
            });
        }

        parseSutta(sutta) {
            console.log('parseSutta() support', sutta.support);
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

