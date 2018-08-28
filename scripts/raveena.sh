#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
    PoParser,
    Polly,
    SegDoc,
    Voice,
    Words,
} = require('../index');

var parser = new PoParser();
var words = new Words();

(async function() { try {
    var voice = Voice.createVoice({
        name: "raveena",
        languageUnknown: "pli",
    });
    var lines = [
        `${voice.name} says:`,
        `1. ananda (unhappy) and ānanda (very happy).`,
        `2. Satthi (the thigh) and Sati (mindfulness).`,
        `3. Mūlapariyāyasutta (The Root of All Things).`,
    ];
    var text = lines.join(' ');
    //var text = fs.readFileSync(path.join(__dirname,'../test/data/mn1-end.txt')).toString();
    console.log(text); // text to be spoken

    var result = await voice.speak(text, {
        cache: false, // false: use TTS web service for every request
        usage: "recite",
    });
    console.log(result);
} catch(e) {
    console.log('error',e.stack);
} })();
