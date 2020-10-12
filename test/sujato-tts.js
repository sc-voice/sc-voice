(typeof describe === 'function') && describe("sujato-tts", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { logger, } = require('log-instance');
    logger.logLevel = 'error';
    const {
        SCAudio,
        SoundStore,
        Voice,
    } = require("../index");
    const syllabifyLength = 0;

    // Service results are normally cached. To bypass the cache, change
    // the following value to false. You can clear the cache by
    // deleting local/sounds
    var cache = true; 
    const BREAK_PATH=path.join(__dirname, '..', 'src', 'assets', 'break500.mp3');

    it("createVoice() creates sujato_pli", function() {
        var voice = Voice.createVoice('sujato_pli');
        should(voice.name).equal('sujato_pli');
        should(voice.locale).equal('pli');
        should(voice.maxSegment).equal(400);
        should(voice.fullStopComma).equal(true);
        should(voice.syllableVowels).equal('aeiouāīū');
        should(voice.syllabifyLength).equal(syllabifyLength);
        should(voice.altTts.voice).equal('Aditi');

        var recite = voice.services['recite'];
        should(recite.fullStopComma).equal(true);
        should(recite.maxSegment).equal(400);
        should(recite.syllableVowels).equal('aeiouāīū');
        should(recite.syllabifyLength).equal(syllabifyLength);
        
        var voice = Voice.createVoice({
            name: 'sujato_pli',
            syllableVowels: 'aeiou',
        });
        should(voice.syllableVowels).equal('aeiou');
        var recite = voice.services['recite'];
        should(recite.syllableVowels).equal('aeiou');
    });
    it("createVoice() creates sujato_en", function() {
        var voice = Voice.createVoice('sujato_en');
        should(voice.name).equal('sujato_en');
        should(voice.locale).equal('en');
        should(voice.maxSegment).equal(400);
        should(voice.fullStopComma).equal(true);
        should(voice.altTts.voice).equal('Amy');

        var recite = voice.services['recite'];
        should(recite.fullStopComma).equal(true);
        should(recite.maxSegment).equal(400);
        
        var voice = Voice.createVoice({
            name: 'sujato_en',
            syllableVowels: 'aeiou',
        });
        should(voice.syllableVowels).equal('aeiou');
        var recite = voice.services['recite'];
        should(recite.syllableVowels).equal('aeiou');
    });
    it("segmentSSML(text) returns SSML", function() {
        var voice = Voice.createVoice({name:'sujato_pli'});
        var recite = voice.services['recite'];
        should(recite.noAudioPath).match(/no_audio.mp3/);

        // SSML is passed through
        var ssml = recite.segmentSSML('dakkhiṇeyyaṃ');
        should.deepEqual(ssml,['dakkhiṇeyyaṃ']);
    });
    it("speak([text],opts) returns empty sound file", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var voice = Voice.createVoice({
                name: 'sujato_pli',
                noAudioPath: BREAK_PATH,
            });
            var text = "Tomatoes are red. Broccoli is green";
            var cache = true;
            var opts = {
                cache,
                usage: "recite",
                volume: 'test',
                chapter: 'voice',
            };
            var result = await voice.speak(text, opts);
            should(result).properties(['file','hits','misses','signature','cached']);
            var storePath = voice.soundStore.storePath;
            var files = result.signature.files.map(f => 
                f.startsWith('/') ? f : path.join(storePath, f));
            should(files.length).equal(2);
            should(files[0]).equal(files[1]);
            should(files[0]).match(/break500/); // Bhante Sujato never said Tomatoes
            should(fs.statSync(result.file).size).greaterThan(5000);
            done();
        } catch(e) {done(e);} })();
    });
    it("speakSegment([text],opts) returns human Pali audio", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var usage = 'recite';
            var translator = 'sujato';
            var soundStore = new SoundStore();
            var audioFormat = soundStore.audioFormat;
            var audioSuffix = soundStore.audioSuffix;
            var language = 'pli';
            var localeIPA = 'pli';
            var scAudio = new SCAudio();
            var voice = Voice.createVoice({
                name: 'sujato_pli',
                usage,
                soundStore,
                localeIPA,
                audioFormat,
                audioSuffix,
                scAudio,
            });
            var sutta_uid = 'sn1.1';
            var scid = 'sn1.1:1.1';
            var segment = {
                scid,
                'pli': "Evaṃ me sutaṃ—",
            };
            var cache = false;
            var opts = {
                cache,
                usage: "recite",
                volume: 'test',
                chapter: 'voice',
            };
            var result = await voice.speakSegment({
                sutta_uid,
                segment,
                language,
                translator,
                usage,
            });
            should(result.file).match(/4238ffac1b51a0c7ab5551b98a776ebc/);
            done();
        } catch(e) {done(e);} })();
    });
    it("speakSegment([text],opts) returns human English audio", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var usage = 'recite';
            var translator = 'sujato';
            var soundStore = new SoundStore();
            var audioFormat = soundStore.audioFormat;
            var audioSuffix = soundStore.audioSuffix;
            var language = 'en';
            var localeIPA = 'en';
            var scAudio = new SCAudio();
            var voice = Voice.createVoice({
                name: 'sujato_pli',
                usage,
                soundStore,
                localeIPA,
                audioFormat,
                audioSuffix,
                scAudio,
            });
            var sutta_uid = 'sn1.1';
            var scid = 'sn1.1:1.1';
            var segment = {
                scid,
                'pli': "So I have heard. ",
            };
            var cache = false;
            var opts = {
                cache,
                usage: "recite",
                volume: 'test',
                chapter: 'voice',
            };
            var result = await voice.speakSegment({
                sutta_uid,
                segment,
                language,
                translator,
                usage,
            });
            should(result.file).match(/f46d257294ca9bbffbb38d5a105cf84a/);
            done();
        } catch(e) {done(e);} })();
    });
})
