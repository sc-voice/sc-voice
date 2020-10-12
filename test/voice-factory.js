(typeof describe === 'function') && describe("VoiceFactory", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { logger, } = require('log-instance');
    logger.logLevel = 'error';
    const {
        HumanTts,
        Polly,
        SCAudio,
        SoundStore,
        Voice,
        VoiceFactory,

    } = require('../index');

    it("default ctor", function() {
        var vf = new VoiceFactory();
        should(vf.soundStore).instanceOf(SoundStore);
        should(vf.scAudio).instanceOf(SCAudio);
        should(vf.usage).equal('recite');
        should(vf.audioSuffix).equal('.mp3');
        should(vf.audioFormat).equal('mp3');
        should(vf.localeIPA).equal('pli');
    });
    it("custom ctor", function() {
        var soundStore = new SoundStore();
        var scAudio = new SCAudio();
        var usage = 'test-usage';
        var audioSuffix = 'test-suffix';
        var audioFormat = 'test-format';
        var localeIPA = 'test-locale';
        var opts = {
            soundStore,
            scAudio,
            usage,
            audioSuffix,
            audioFormat,
            localeIPA,
        };
        var vf = new VoiceFactory(opts);
        should(vf).properties(opts);
    });
    it("voiceOfName('sujato_en') returns sujato_en", function() {
        var name = "sujato_en";
        var vf = new VoiceFactory();
        var voice = vf.voiceOfName(name);
        should(voice.name).equal(name);
        should(voice.usage).equal('recite');
        var tts = voice.services[voice.usage];
        should(tts).instanceOf(HumanTts);
        should(tts.soundStore).instanceOf(SoundStore);
        should(tts.audioSuffix).equal('.mp3');
        should(tts.audioFormat).equal('mp3');
        should(tts.localeIPA).equal('pli');
        should(tts.scAudio).instanceOf(SCAudio); // human-tts
    });
    it("voiceOfName('sujato_pli') returns sujato_pli", function() {
        var name = "sujato_pli";
        var vf = new VoiceFactory();
        var voice = vf.voiceOfName(name);
        should(voice.name).equal(name);
        should(voice.usage).equal('recite');
        var tts = voice.services[voice.usage];
        should(tts).instanceOf(HumanTts);
        should(tts.soundStore).instanceOf(SoundStore);
        should(tts.audioSuffix).equal('.mp3');
        should(tts.audioFormat).equal('mp3');
        should(tts.localeIPA).equal('pli');
        should(tts.scAudio).instanceOf(SCAudio); // human-tts
    });
    it("voiceOfName('Amy') returns Amy", function() {
        var name = "Amy";
        var vf = new VoiceFactory();
        var voice = vf.voiceOfName(name);
        should(voice.name).equal(name);
        should(voice.usage).equal('recite');
        var tts = voice.services[voice.usage];
        should(tts).instanceOf(Polly);
        should(tts.soundStore).instanceOf(SoundStore);
        should(tts.audioSuffix).equal('.mp3');
        should(tts.audioFormat).equal('mp3');
        should(tts.localeIPA).equal('pli');
        should(tts.scAudio).equal(undefined); // unused
    });
})
