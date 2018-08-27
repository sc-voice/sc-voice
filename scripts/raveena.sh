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
    var voice = Voice.createVoice("Raveena", {
        usage: "navigate",
    });
    var lines = [
        `${voice.name} says:`,
        `1. ananda (unhappy) and ānanda (very happy).`,
        `2. Satthi (the thigh) and Sati (mindfulness).`,
    ];
    var text = lines.join('\n');
    console.log(text); // text to be spoken

    var result = await voice.speak(text, {
        cache: false, // false: use TTS web service for every request
    });
    console.log(result);
} catch(e) {
    console.log('error',e.stack);
} })();
