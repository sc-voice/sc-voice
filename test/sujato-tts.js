(typeof describe === 'function') && describe("sujato-tts", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { logger } = require('rest-bundle');
    const {
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
        should(voice.language).equal('pli');
        should(voice.maxSegment).equal(400);
        should(voice.fullStopComma).equal(true);
        should(voice.syllableVowels).equal('aeiouāīū');
        should(voice.syllabifyLength).equal(syllabifyLength);

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
    it("segmentSSML(text) returns SSML", function() {
        var voice = Voice.createVoice({name:'sujato_pli'});
        var recite = voice.services['recite'];
        should(recite.noAudioPath).match(/no_audio.mp3/);

        // SSML is passed through
        var ssml = recite.segmentSSML('dakkhiṇeyyaṃ');
        should.deepEqual(ssml,['dakkhiṇeyyaṃ']);
    });
    it("speak([text],opts) returns sound file for array of text", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var voice = Voice.createVoice({
                name: 'sujato_pli',
                noAudioPath: BREAK_PATH,
            });
            var text = [
                "Tomatoes are",
                "red.",
                "Tomatoes are red. Broccoli is green"
            ];
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
            should(files.length).equal(3);
            should(files[0]).equal(files[1]);
            should(files[0]).equal(files[2]);
            should(files[0]).match(/break500/);
            should(fs.statSync(result.file).size).greaterThan(5000);
            done();
        } catch(e) {done(e);} })();
    });
})
