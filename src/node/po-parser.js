(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const SC = path.join(__dirname, '../../local/sc');
    const Words = require('./words');

    const S_MSGCTXT = 1;
    const S_MSGID1 = 2;
    const S_MSGIDN = 3;
    const S_MSGSTR1 = 4;
    const S_MSGSTRN = 5;

    const RE_SPACE_EOL = new RegExp(`[^-${Words.U_HYPHEN}${Words.U_ENDASH}${Words.U_EMDASH} ]$`, 'u');

    class PoParser {
        constructor(opts={}) {
            this.msgctxt = new RegExp(/^msgctxt .*/);
            this.msgid = new RegExp(/^msgid .*/);
            this.msgstr = new RegExp(/^msgstr .*/);
            this.msgquote = new RegExp(/^".*/);
            this.blankline = new RegExp(/^$/);
            this.json_ctxt = opts.json_ctxt || 'scid';
            this.json_id = opts.json_id || 'pli';
            this.json_str = opts.json_str || 'en';
            this.reHTML = opts.reHTML || /<\/?\s*\w+\s*>/ug;
        }

        static suttaPath(id, root=SC) {
            var suttaId = id.toLowerCase().split(':')[0];
            var suttaNum = suttaId.replace(/^[a-z]*/ug, "");
            var folder = suttaId.replace(/[0-9-.:]*/gu, "");
            var suttaFile = folder + ('000'+suttaNum).substring(suttaNum.length) + '.po';
            if (suttaId.startsWith('sn')) {
                return path.join(root, folder, 'en', suttaId, suttaFile);
            } 

            return path.join(root, folder, 'en', suttaFile);
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
                                    if (segment[that.json_str] && segment[that.json_str].match(RE_SPACE_EOL)) {
                                        segment[that.json_str].indexOf('non')>=0 && 
                                            console.log(`debug: "${segment[that.json_str]}"`);
                                        segment[that.json_str] += " ";
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

        parse(filePath, opts) {
            if (!fs.existsSync(filePath)) {
                return Promise.reject(new Error(`file not found:${filePath}`));
            }
            var lines = fs.readFileSync(filePath).toString().split('\n');;
            return this.parseLines(lines, opts);
        }

        files(opts={}) {
            return new Promise((resolve, reject) => { try {
                if (typeof opts === 'string') {
                    throw new Error("expected options object");
                } 
                var language = opts.language || 'en';
                var suffix = opts.suffix || '\\.po';
                var filePattern = opts.filePattern || `.*/${language}/[^/]*${suffix}$`;
                if (!(filePattern instanceof RegExp)) {
                    filePattern = new RegExp(filePattern);
                }
                var root = opts.root || path.join(__dirname, '../../local/sc');
                var files = [];
                function visit(apath) {
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

