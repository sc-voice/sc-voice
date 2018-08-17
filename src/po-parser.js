(function(exports) {
    const fs = require('fs');
    const path = require('path');

    const S_MSGCTXT = 1;
    const S_MSGID = 2;
    const S_MSGSTR1 = 3;
    const S_MSGSTRN = 4;

    class PoParser {
        constructor(opts={}) {
        }

        parseLines(lines) {
            return new Promise((resolve, reject) => {
                var poInfo = {
                    segments: [],
                    idMap : {},
                };
                function add(segment) {
                    if (segment) {
                        poInfo.segments.push(segment.text);
                        poInfo.idMap[segment.id] = segment.text;
                    }
                    return null;
                }
                (async function() { try {
                    var state = S_MSGCTXT;
                    var segment = null;
                    lines.forEach(line => {
                        switch (state) {
                            case S_MSGCTXT:
                                if (line.startsWith('msgctxt')) {
                                    segment = {
                                        id: line.split('"')[1],
                                    };
                                    state = S_MSGSTR1;
                                }
                                break;
                            case S_MSGSTR1:
                                if (line.startsWith('msgstr')) {
                                    segment.text = line.substring(8, line.length-1);
                                    state = S_MSGSTRN;
                                }
                                break;
                            case S_MSGSTRN:
                                if (line.startsWith('"')) {
                                    segment.text && (segment.text += " ");
                                    segment.text += line.substring(1, line.length-1);
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
                    resolve(poInfo);
                } catch(e){reject(e);} })();
            });
        }

        parse(filePath) {
            if (!fs.existsSync(filePath)) {
                reject(new Error(`file not found:${filePath}`));
            }
            var lines = fs.readFileSync(filePath).toString().split('\n');;
            return this.parseLines(lines);
        }

    }

    module.exports = exports.PoParser = PoParser;
})(typeof exports === "object" ? exports : (exports = {}));

