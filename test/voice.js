(typeof describe === 'function') && describe("words", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Polly,
        Voice,
    } = require('../index');

    it("loadVoices(voicePath) should return voices", function() {
        var voices = Voice.loadVoices();
        should(voices).instanceOf(Array);
        should(voices.length).greaterThan(0);
        var raveena = voices.filter(voice => voice.name === 'Raveena')[0];
        should(raveena).instanceOf(Voice);
        should(raveena).properties({
            language: 'en-IN',
            name: 'Raveena',
            service: 'aws-polly',
            gender: 'female',
            rates: {
                navigation: "+5%", 
                recitation: "-20%",
            },
        });
        should(!!raveena.ipa).equal(true);
        should(!!raveena.ipa.pli).equal(true);

        var amy = voices.filter(voice => voice.name === 'Amy')[0];
        should(amy).instanceOf(Voice);
        should(amy).properties({
            language: 'en-GB',
            name: 'Amy',
            service: 'aws-polly',
            gender: 'female',
            rates: {
                navigation: "+5%", 
                recitation: "-20%",
            },
        });
        should(!!amy.ipa).equal(true);
        should(!!amy.ipa.pli).equal(true);

        var salli = voices.filter(voice => voice.name === 'Salli')[0];
        should(salli).instanceOf(Voice);
        should(salli).properties({
            language: 'en-US',
            name: 'Salli',
            service: 'aws-polly',
            gender: 'female',
            rates: {
                navigation: "+5%", 
                recitation: "-20%",
            },
        });
        should(!!salli.ipa).equal(true);
        should(!!salli.ipa.pli).equal(true);
    });
    it("createVoice(language,opts) returns voice for a language", function() {
        var amy = Voice.createVoice();
        should(amy).instanceOf(Voice);
        should(amy.language).equal("en-GB");
        should(amy.name).equal("Amy");

        var raveena = Voice.createVoice("en-IN");
        should(raveena).instanceOf(Voice);
        should(raveena.language).equal("en-IN");
        should(raveena.name).equal("Raveena");
        should(raveena.usage).equal("recitation");
    });
    it("createVoice(langOrName, opts) creates a Voice instance", function() {
        var reciteVoice = Voice.createVoice("en-IN");
        should(reciteVoice.services.navigation).instanceOf(Polly);
        should(reciteVoice.services.recitation).instanceOf(Polly);
        should(reciteVoice.usage).equal('recitation');
        should.deepEqual(reciteVoice.services.navigation.prosody, {
            pitch: "-0%",
            rate: "+5%",
        });
        should.deepEqual(reciteVoice.services.recitation.prosody, {
            pitch: "-0%",
            rate: "-20%",
        });

        var navVoice = Voice.createVoice("Raveena", {
            usage: "navigation",
        });
        should(navVoice.services.navigation).instanceOf(Polly);
        should(navVoice.services.recitation).instanceOf(Polly);
        should(navVoice.usage).equal('navigation');
        should.deepEqual(reciteVoice.services.navigation.prosody, {
            pitch: "-0%",
            rate: "+5%",
        });
        should.deepEqual(reciteVoice.services.recitation.prosody, {
            pitch: "-0%",
            rate: "-20%",
        });
    });
    it("speak([text],opts) returns sound file for array of text", function(done) {
        this.timeout(3*1000);
        (async function() {
            var navVoice = Voice.createVoice("en-IN");
            var text = [
                "Tomatoes are",
                "red.",
                "Tomatoes are red. Broccoli is green"
            ];
            var cache = true;
            var opts = {
                cache,
                usage: "navigation",
            };
            var result = await navVoice.speak(text, opts);
            should(result).properties(['file','hits','misses','signature','cached']);
            should(result.signature.files.length).equal(4);
            should(fs.statSync(result.signature.files[0]).size).greaterThan(1000); // Tomatoes are
            should(fs.statSync(result.signature.files[1]).size).greaterThan(1000); // red.
            should(fs.statSync(result.signature.files[2]).size).greaterThan(1000); // Tomatoes are red.
            should(fs.statSync(result.signature.files[3]).size).greaterThan(1000); // Broccoli is green.
            should(fs.statSync(result.file).size).greaterThan(5000);
            //console.log(result);
            done();
        })();
    });

})
