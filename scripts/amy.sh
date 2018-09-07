#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
    PoParser,
    Polly,
    SegDoc,
    Sutta,
    SuttaFactory,
    Voice,
    Words,
} = require('../index');

var parser = new PoParser();
var words = new Words();

(async function() { try {
    var voice = Voice.createVoice({
        name: "amy",
        languageUnknown: "pli",
    });
    var lines = [
        `${voice.name} says:`,
        `1. ananda (not happy) and ānanda (very happy).`,
        `2. Satthi (the thigh) and Sati (mindfulness).`,
        `3. Mūlapariyāyasutta (The Root of All Things).`,
    ];
    var challenge = lines.join(' ');

    var sutta = await SuttaFactory.loadSutta('mn1');
    var header = sutta.excerpt({
        start: 0,
        end: 2,
        prop: 'pli',
    });
    var excerpt = sutta.excerpt({
        start: 0,
        end: 25,
        prop: 'en',
    });
    var text = `${header.join('\n')}\n${excerpt.join('\n')}`;
    console.log(text); // text to be spoken

    var result = await voice.speak(text, {
        cache: false, // false: use TTS web service for every request
        usage: "recite",
    });
    console.log(result);
} catch(e) {
    console.log('error',e.stack);
} })();
