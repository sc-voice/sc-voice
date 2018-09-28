(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const SC = path.join(__dirname, '../../local/sc');
    const {
        logger,
    } = require('rest-bundle');
    const Words = require('./words');
    const DEFAULT_LANG = 'en';

    const S_MSGCTXT = 1;
    const S_MSGID1 = 2;
    const S_MSGIDN = 3;
    const S_MSGSTR1 = 4;
    const S_MSGSTRN = 5;

    const RE_SPACE_EOL = new RegExp(`[^-${Words.U_HYPHEN}${Words.U_ENDASH}${Words.U_EMDASH} ]$`, 'u');
    const RE_MAJOR = /mn|sn|an|kn|pli-tv/;

    const MAJOR_IDS = {
        en: {
            'an1.': 'an/en/an01/an1.000',
            'an2.': 'an/en/an02/an2.000',
            'an3.': 'an/en/an03/an3.000',
            'an4.': 'an/en/an04/an4.000',
            'an5.': 'an/en/an05/an5.000',
            'an6.': 'an/en/an06/an6.000',
            'an7.': 'an/en/an07/an7.000',
            'an8.': 'an/en/an08/an8.000',
            'an9.': 'an/en/an09/an9.000',
            'an10.': 'an/en/an10/an10.000',
            'an11.': 'an/en/an11/an11.000',
            'dn': 'dn/en/dn00',
            'thag1.': 'kn/en/thag/thag01.000',
            'thag2.': 'kn/en/thag/thag02.00',
            'thag3.': 'kn/en/thag/thag03.00',
            'thag4.': 'kn/en/thag/thag04.00',
            'thag5.': 'kn/en/thag/thag05.00',
            'thag6.': 'kn/en/thag/thag06.00',
            'thag7.': 'kn/en/thag/thag07.0',
            'thag8.': 'kn/en/thag/thag08.0',
            'thag9.': 'kn/en/thag/thag09.0',
            'thag10.': 'kn/en/thag/thag10.0',
            'thag11.': 'kn/en/thag/thag11.0',
            'thag12.': 'kn/en/thag/thag12.0',
            'thag13.': 'kn/en/thag/thag13.0',
            'thag14.': 'kn/en/thag/thag14.0',
            'thag15.': 'kn/en/thag/thag15.0',
            'thag16.': 'kn/en/thag/thag16.0',
            'thag17.': 'kn/en/thag/thag17.0',
            'thag18.': 'kn/en/thag/thag18.0',
            'thag19.': 'kn/en/thag/thag19.0',
            'thag20.': 'kn/en/thag/thag20.0',
            'thag21.': 'kn/en/thag/thag21.0',
            'thig1.': 'kn/en/thig/thig01.00',
            'thig2.': 'kn/en/thig/thig02.00',
            'thig3.': 'kn/en/thig/thig03.0',
            'thig4.': 'kn/en/thig/thig04.0',
            'thig5.': 'kn/en/thig/thig05.00',
            'thig6.': 'kn/en/thig/thig06.0',
            'thig7.': 'kn/en/thig/thig07.0',
            'thig8.': 'kn/en/thig/thig08.0',
            'thig9.': 'kn/en/thig/thig09.0',
            'thig10.': 'kn/en/thig/thig10.0',
            'thig11.': 'kn/en/thig/thig11.0',
            'thig12.': 'kn/en/thig/thig12.0',
            'thig13.': 'kn/en/thig/thig13.0',
            'thig14.': 'kn/en/thig/thig14.0',
            'thig15.': 'kn/en/thig/thig15.0',
            'thig16.': 'kn/en/thig/thig16.0',
            'mn': 'mn/en/mn000',
            'sn1.': 'sn/en/sn01/sn1.00',
            'sn2.': 'sn/en/sn02/sn2.00',
            'sn3.': 'sn/en/sn03/sn3.00',
            'sn4.': 'sn/en/sn04/sn4.00',
            'sn5.': 'sn/en/sn05/sn5.00',
            'sn6.': 'sn/en/sn06/sn6.00',
            'sn7.': 'sn/en/sn07/sn7.00',
            'sn8.': 'sn/en/sn08/sn8.00',
            'sn9.': 'sn/en/sn09/sn9.00',
            'sn10.': 'sn/en/sn10/sn10.00',
            'sn11.': 'sn/en/sn11/sn11.00',
            'sn12.': 'sn/en/sn12/sn12.00',
            'sn13.': 'sn/en/sn13/sn13.00',
            'sn14.': 'sn/en/sn14/sn14.00',
            'sn15.': 'sn/en/sn15/sn15.00',
            'sn16.': 'sn/en/sn16/sn16.00',
            'sn17.': 'sn/en/sn17/sn17.00',
            'sn18.': 'sn/en/sn18/sn18.00',
            'sn19.': 'sn/en/sn19/sn19.00',
            'sn20.': 'sn/en/sn20/sn20.00',
            'sn21.': 'sn/en/sn21/sn21.00',
            'sn22.': 'sn/en/sn22/sn22.000',
            'sn23.': 'sn/en/sn23/sn23.00',
            'sn24.': 'sn/en/sn24/sn24.00',
            'sn25.': 'sn/en/sn25/sn25.00',
            'sn26.': 'sn/en/sn26/sn26.00',
            'sn27.': 'sn/en/sn27/sn27.00',
            'sn28.': 'sn/en/sn28/sn28.00',
            'sn29.': 'sn/en/sn29/sn29.00',
            'sn30.': 'sn/en/sn30/sn30.00',
            'sn31.': 'sn/en/sn31/sn31.00',
            'sn32.': 'sn/en/sn32/sn32.00',
            'sn33.': 'sn/en/sn33/sn33.00',
            'sn34.': 'sn/en/sn34/sn34.00',
            'sn35.': 'sn/en/sn35/sn35.000',
            'sn36.': 'sn/en/sn36/sn36.00',
            'sn37.': 'sn/en/sn37/sn37.00',
            'sn38.': 'sn/en/sn38/sn38.00',
            'sn39.': 'sn/en/sn39/sn39.00',
            'sn40.': 'sn/en/sn40/sn40.00',
            'sn41.': 'sn/en/sn41/sn41.00',
            'sn42.': 'sn/en/sn42/sn42.00',
            'sn43.': 'sn/en/sn43/sn43.00',
            'sn44.': 'sn/en/sn44/sn44.00',
            'sn45.': 'sn/en/sn45/sn45.000',
            'sn46.': 'sn/en/sn46/sn46.000',
            'sn47.': 'sn/en/sn47/sn47.00',
            'sn48.': 'sn/en/sn48/sn48.000',
            'sn51.': 'sn/en/sn51/sn51.00',
            'sn52.': 'sn/en/sn52/sn52.00',
            'sn54.': 'sn/en/sn54/sn54.00',
            'sn55.': 'sn/en/sn55/sn55.00',
            'sn56.': 'sn/en/sn56/sn56.000',
            'pli-tv-bu-vb-ay': 'pli-tv/en/ay/pli-tv-bu-vb-ay', // TODO
            'pli-tv-bu-vb-np': 'pli-tv/en/np/pli-tv-bu-vb-np', // TODO
            'pli-tv-bu-vb-pc': 'pli-tv/en/pc/pli-tv-bu-vb-pc', // TODO
            'pli-tv-bu-vb-pj': 'pli-tv/en/pj/pli-tv-bu-vb-pj', // TODO
            'pli-tv-bu-vb-ss': 'pli-tv/en/ss/pli-tv-bu-vb-ss', // TODO
        }
    };

    class PoParser {
        constructor(opts={}) {
            this.msgctxt = new RegExp(/^msgctxt .*/);
            this.msgid = new RegExp(/^msgid .*/);
            this.msgstr = new RegExp(/^msgstr .*/);
            this.msgquote = new RegExp(/^".*/);
            this.blankline = new RegExp(/^$/);
            this.json_ctxt = opts.json_ctxt || 'scid';
            this.json_id = opts.json_id || 'pli';
            this.json_str = opts.json_str || DEFAULT_LANG;
            this.reHTML = opts.reHTML || /<\/?\s*\w+\s*>/ug;
        }

        static minorSuttaId(filename) {
            var scid = filename.replace(/\.po/u, '');
            scid = scid.replace(/[a-z].*\./iu,'');
            var id =  Number(scid);
            if (isNaN(id)) {
                var e = new Error(`could not parse minorSuttaId from filename:${filename}`);
                logger.error(e);
                throw e;
            }
            return id;
        }

        static suttaPath(id, root=SC, opts={}) {
            var lang = opts.lang || DEFAULT_LANG;
            var suttaId = id.toLowerCase().split(':')[0];
            var majorId = suttaId.replace(/[0-9-]*$/u,'');
            var majorIdLang = MAJOR_IDS[lang] && MAJOR_IDS[lang];
            if (majorIdLang == null) {
                throw new Error(`Sutta language not supported:${lang}`);
            }
            var majorIdValue = majorIdLang[majorId];
            if (majorIdValue == null) {
                var e = new Error(`suttaPath() file not found: ${id}`);
                throw e;
            }
            var folder = MAJOR_IDS[lang] && MAJOR_IDS[lang][majorId];
            var zeros = 0;
            for (var zeros=0; folder.endsWith('0'); zeros++) {
                folder = folder.substring(0, folder.length-1);
            }
            var filename = suttaId.replace(majorId, '');
            var rangeSplits = filename.split('-');
            while (rangeSplits[0].length < zeros) {
                rangeSplits[0] = '0' + rangeSplits[0];
            }
            filename = rangeSplits.join('-');
            var fullPath = path.join(root, `${folder}${filename}.po`);
            if (!fs.existsSync(root) || fs.existsSync(fullPath)) {
                return fullPath; 
            }

            var basename = path.basename(fullPath);
            var baseprefix = basename.split('.po')[0];
            var dirname = path.dirname(fullPath);
            var dirfiles = fs.readdirSync(dirname);
            var fname = dirfiles.reduce((acc, f) => {
                return f.substring(0,baseprefix.length) <= baseprefix ? f : acc;
            }, dirfiles[0]);
            if (fname.indexOf('-') >= 0) { // a range
                var range = fname.split('-').map(s => PoParser.minorSuttaId(s));
                var baseId = PoParser.minorSuttaId(basename);
                if (range[0] <= baseId && baseId <= range[1]) {
                    return path.join(dirname, fname);
                } else {
                    throw new Error(`file not found:${fullPath} closest:${fname}`);
                }
            }
            
            throw new Error(`file not found:${fullPath}`);
        }

        parseLines(lines, opts={}) {
            var that = this;
            return new Promise((resolve, reject) => {
                var segments = [];
                function add(segment) {
                    if (segment) {
                        segments.push(segment);
                    }
                    return null;
                }
                (async function() { try {
                    var state = S_MSGCTXT;
                    var segment = null;
                    lines.forEach(line => {
                        line = line.replace(that.reHTML, '');
                        switch (state) {
                        case S_MSGCTXT:
                            if (that.msgctxt.test(line)) {
                                segment = {
                                    [that.json_ctxt]: line.split('"')[1],
                                };
                                state = S_MSGID1;
                            }
                            break;
                        case S_MSGID1:
                            if (that.msgid.test(line)) {
                                segment[that.json_id] = line.substring(7, line.length-1);
                                state = S_MSGIDN;
                            }
                            break;
                        case S_MSGIDN:
                            if (that.msgquote.test(line)) {
                                segment[that.json_id] && segment[that.json_id].match(RE_SPACE_EOL) &&
                                        (segment[that.json_id] += " ");
                                segment[that.json_id] += line.substring(1, line.length-1);
                            } else if (that.msgstr.test(line)) {
                                segment[that.json_str] = line.substring(8, line.length-1);
                                state = S_MSGSTRN;
                            } else {
                                state = S_MSGSTR1;
                            }
                            break;
                        case S_MSGSTR1:
                            if (that.msgstr.test(line)) {
                                segment[that.json_str] = line.substring(8, line.length-1);
                                state = S_MSGSTRN;
                            }
                            break;
                        case S_MSGSTRN:
                            if (that.msgquote.test(line)) {
                                if (segment[that.json_str] && 
                                    segment[that.json_str].match(RE_SPACE_EOL)) 
                                {
                                    //segment[that.json_str].indexOf('non')>=0 && 
                                        //console.log(`debug: "${segment[that.json_str]}"`);
                                }
                                segment[that.json_str] += line.substring(1, line.length-1);
                            } else {
                                state = S_MSGCTXT;
                                segment = add(segment);
                            }
                            break;
                        default:
                            break;
                        }
                    });
                    segment = add(segment);
                    resolve(segments);
                } catch(e){reject(e);} })();
            });
        }

        parse(filepath, opts) {
            if (!fs.existsSync(filepath)) {
                var tokens = filepath.split('/sc/');
                var e = new Error(`file not found: ${Words.U_ELLIPSIS}/${tokens[tokens.length-1]}`)
                logger.error(`parse() file not found:${filepath}`);
                return Promise.reject(e);
            }
            var lines = fs.readFileSync(filepath).toString().split('\n');
            return this.parseLines(lines, opts);
        }

        files(opts={}) {
            return new Promise((resolve, reject) => { try {
                if (typeof opts === 'string') {
                    throw new Error("expected options object");
                } 
                var language = opts.language || DEFAULT_LANG;
                var suffix = opts.suffix || '\\.po';
                var filePattern = opts.filePattern || `.*/${language}/.*${suffix}$`;
                if (!(filePattern instanceof RegExp)) {
                    filePattern = new RegExp(filePattern);
                }
                var root = opts.root || path.join(__dirname, '../../local/sc');
                var files = [];
                var visit = (apath)=>{
                    var stats = fs.statSync(apath);
                    if (stats.isDirectory()) {
                        fs.readdirSync(apath).forEach(file => 
                            visit(path.join(apath, file)));
                    } else if (stats.isFile()) {
                        filePattern.test(apath) && files.push(apath);
                    }
                }
                visit(root);
                resolve(files);
            } catch(e) {reject(e);} });
        }

    }

    module.exports = exports.PoParser = PoParser;
})(typeof exports === "object" ? exports : (exports = {}));

