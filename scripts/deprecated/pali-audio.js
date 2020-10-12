#!/usr/bin/env node
const { logger, } = require('log-instance');
const fs = require('fs');
const path = require('path');
const {
    execFileSync,
} = require('child_process');

const PALI="https://paliaudio.com";

function createWikiPage(link, title) {
    var sutta_uid = title.split(' ').slice(0,2).join('').replace(/\//,'');
    var filename = path.join(__dirname, `../sc-voice.wiki/Audio-${sutta_uid}.md`);
    if (!fs.existsSync(filename)) {
        console.log(filename);
        var txt = [
            `# ${title}`,
            `### English (en)`,
            `##### Pali Audio`,
            `* [${title}](${PALI}/${link})`,
            '',
            `##### SuttaCentral Voice Assistant`,
            `* [${sutta_uid} (Amy)](http://50.18.90.151/scv/#/?search=${sutta_uid}&iVoice=0)`,
            `* [${sutta_uid} (Raveena)](http://50.18.90.151/scv/#/?search=${sutta_uid}&iVoice=1)`,
        ];
        //console.log(txt.join('\n'));
        fs.writeFileSync(filename, txt.join('\n'));
    }
}

(async function() { try {
    var cmd = path.join(__dirname, 'pali-audio.sh');
    var dnmn = execFileSync(cmd).toString().split('\n');
    dnmn.forEach((line,i) => {
        if (i && line.startsWith('/')) {
            var prevLine = dnmn[i-1];
            createWikiPage(line, prevLine);
        }
    });
} catch(e) {logger.error(e.stack);}})();
