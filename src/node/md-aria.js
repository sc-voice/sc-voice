(function(exports) {
    class MdAria {
        constructor(opts={}) {
        }

        ariaLine(line) {
        }

        phraseToHtml(phrase) {
            var lbParts = phrase.split('[');
            var result = [];
            result.push(lbParts.shift());
            lbParts.forEach(part => {
                var label = 'error-a-label';
                var link = 'error-a-href';
                var text = `[${part}`;
                var irb = part.indexOf(']');
                if (irb > 0) {
                    label = part.substring(0, irb);
                    var ilp = part.indexOf('(', irb);
                    var irp = ilp > 0 ? part.indexOf(')', ilp) : -1;
                    if (irp > 0) {
                        link = part.substring(ilp+1, irp);
                        text = part.substring(irp+1);
                    }
                }
                if (link) {
                    result.push(`<a href="${link}">${label}</a>`);
                }
                result.push(text);
            });
            return result.join('');
        }

        toHtml(md) {
            var lines = md.split('\n');
            var html = [];
            var detailCount = 0;
            var pLines = 0;
            var isP = false;
            var endP = () => {
                html.push('</p>');
            };

            var isUL = false;
            var endUL = () => {
                html.push('</ul>');
                isUL = false;
            };

            lines.forEach((line,i) => {
                if (line.startsWith('#')) {
                    if (detailCount) {
                        html.push('</detail>');
                    }
                    isUL && endUL();
                    pLines && endP();
                    detailCount++;
                    html.push('<detail>');
                    var summary = line.replace(/^#+/u,'').trim();
                    html.push(`<summary>${summary}</summary>`);
                } else if (line.trim() === '') {
                    isUL && endUL();
                    if (pLines) {
                        html.push('</p>');
                    }
                    isP = true;
                    pLines = 0;
                } else if (line.startsWith('* ')) {
                    pLines && endP();
                    if (!isUL) {
                        html.push('<ul>');
                        isUL = true;
                    }
                    var item = line.replace(/^\*/u, '').trim();
                    html.push(`<li>${this.phraseToHtml(item)}</li>`);
                } else {
                    isUL && endUL();
                    if (isP) {
                        if (pLines === 0) {
                            html.push('<p>');
                        }
                        pLines++;
                    }
                    isP && pLines++;
                    html.push(this.phraseToHtml(line));
                }
            });
            isUL && endUL();
            pLines && endP();
            if (detailCount) {
                html.push('</detail>');
            }

            return html.join('\n');
        }

    }

    module.exports = exports.MdAria = MdAria;
})(typeof exports === "object" ? exports : (exports = {}));

