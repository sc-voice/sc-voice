(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const SegDoc = require('./seg-doc');

    const S_MSGCTXT = 1;
    const S_MSGID1 = 2;
    const S_MSGIDN = 3;
    const S_MSGSTR1 = 4;
    const S_MSGSTRN = 5;

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
        }

        parseLines(lines, opts={}) {
            var that = this;
            return new Promise((resolve, reject) => {
                var segDoc = new SegDoc({}, opts);
                function add(segment) {
                    if (segment) {
                        segDoc.segments.push(segment);
                    }
                    return null;
                }
                (async function() { try {
                    var state = S_MSGCTXT;
                    var segment = null;
                    lines.forEach(line => {
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
                                    segment[that.json_id] && (segment[that.json_id] += " ");
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
                                    segment[that.json_str] && (segment[that.json_str] += " ");
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
                    resolve(segDoc);
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
                var language = opts.language || 'en';
                var suffix = opts.suffix || '\\.po';
                var filePattern = opts.filePattern || new RegExp(`.*/${language}/[^/]*${suffix}$`);
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
                var root = opts.root || path.join(__dirname, '../local/sc');
                visit(root);
                resolve(files);
            } catch(e) {reject(e);} });
        }

    }

    module.exports = exports.PoParser = PoParser;
})(typeof exports === "object" ? exports : (exports = {}));

