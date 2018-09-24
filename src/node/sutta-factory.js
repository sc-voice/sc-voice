(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Words = require('./words');
    const Sutta = require('./sutta');
    const Section = require('./section');
    const SectionParser = require('./section-parser');
    const PoParser = require('./po-parser');
    const SuttaCentralId = require('./sutta-central-id');
    const RE_ELLIPSIS = new RegExp(`${Words.U_ELLIPSIS}$`);
    const OPTS_EN = {
        prop: 'en',
    };

    class SuttaFactory { 
        constructor(opts={}) {
            this.type = this.constructor.name;
            this.prop = opts.prop || OPTS_EN.prop;
            this.reHeader = opts.reHeader || Sutta.RE_HEADER;
        }

        static loadSutta(opts={}) {
            return new SuttaFactory(opts).loadSutta(opts);
        }

        static loadSuttaPootl(opts={}) {
            return new SuttaFactory(opts).loadSuttaPootl(opts);
        }

        loadSutta(opts={}) {
            return this.loadSuttaPootl(opts);
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
                    resolve(new Sutta(Object.assign({segments}, opts)));
                } catch(e) {reject(e);} })();
            });
        }

        parseSutta(sutta) {
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
            return new Sutta({
                sections,
                prop: this.prop,
            });
        }
    }

    module.exports = exports.SuttaFactory = SuttaFactory;
})(typeof exports === "object" ? exports : (exports = {}));

