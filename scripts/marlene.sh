#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
    PoParser,
    Polly,
    Sutta,
    SuttaCentralApi,
    SuttaFactory,
    Voice,
    Words,
} = require('../index');

var parser = new PoParser();
var words = new Words();

(async function() { try {
    var voice = Voice.createVoice({
        name: "marlene",
        languageUnknown: "pli",
    });

    var scr = await new SuttaCentralApi().initialize();
    var text = fs.readFileSync(0).toString();
    var author_uid = 'sabbamitta';
    var uid = 'sn12.23';
    var lang = 'de';
    var original_title = 'Sudattasutta';
    var title = '8. Mit Sudatta';

    var sutta = scr.suttaFromHtml(text, {
        uid,
        suttaplex: {
            uid,
            original_title,
        },
        translation: {
            author_uid,
            title,
            lang,
        },
    });
    var header = sutta.excerpt({
        start: 0,
        end: 2,
        prop: 'pli',
    });
    var excerpt = sutta.excerpt({
        start: 0,
        end: 25,
        prop: lang,
    });
    var text = `${header.join('\n')}\n${excerpt.join('\n')}`;
    console.log(text); // text to be spoken

    var result = await voice.speak(text, {
        cache: false, // false: use TTS web service for every request
        usage: "recite",
    });
    console.log(result.signature.guid);
} catch(e) {
    console.log('error',e.stack);
} })();
