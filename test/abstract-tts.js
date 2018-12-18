(typeof describe === 'function') && describe("abstract-tts", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        AbstractTTS,
        Words,
    } = require("../index");
    const BREAK = `<break time="0.001s"/>`;
    const PARA_BREAK = `<break time="1.5s"/>`;

    it("AbstractTTS(opts) can be customized", function() {
        var words = new Words();
        var tts = new AbstractTTS({
            words,
        });
        should(tts.words).equal(words);
        should(tts).properties({
            language: 'en',
            languageUnknown: 'en',
        });
    });
    it("signature(text) returns signature that identifies synthesized speech", function() {
        var tts = new AbstractTTS();
        var sig = tts.signature('hello world');
        var guid = tts.mj.hash(sig);
        should.deepEqual(sig, {
            api: null,
            apiVersion: null,
            audioFormat: 'audio/ogg',
            language: 'en',
            voice: null,
            prosody: {
                rate: '-10%',
            },
            text: 'hello world',
            guid,
        });
    });
    it("wordInfo(word) returns information about a word", function() {
        var tts = new AbstractTTS();
        var bhikkhu = {
            ipa: "b\u026aku\u02D0",
            language: "pli",
        };
        var bhikkhus = {
            ipa: "b\u026aku\u02D0z",
            language: "pli",
        };

        // no information
        should.deepEqual(tts.wordInfo('asdf'), null);

        // singular variations
        should.deepEqual(tts.wordInfo('Bhikkhu'), bhikkhu);
        should.deepEqual(tts.wordInfo('Bikkhu'), bhikkhu);
        should.deepEqual(tts.wordInfo('Bhikku'), bhikkhu);
        should.deepEqual(tts.wordInfo('bhikkhu'), bhikkhu);
        should.deepEqual(tts.wordInfo('bikkhu'), bhikkhu);
        should.deepEqual(tts.wordInfo('bhikku'), bhikkhu);

        // plural variations
        should.deepEqual(tts.wordInfo('Bhikkhus'), bhikkhus);
        should.deepEqual(tts.wordInfo('Bikkhus'), bhikkhus);
        should.deepEqual(tts.wordInfo('Bhikkus'), bhikkhus);
        should.deepEqual(tts.wordInfo('bhikkhus'), bhikkhus);
        should.deepEqual(tts.wordInfo('bikkhus'), bhikkhus);
        should.deepEqual(tts.wordInfo('bhikkus'), bhikkhus);
    });
    it("wordSSML(word) returns SSML text for word", function() {
        var tts = new AbstractTTS({
            languageUnknown: 'pli',
        });
        var ttsStrip = new AbstractTTS({
            languageUnknown: 'pli',
            stripNumbers: true,
        });

        // numbers
        should(tts.wordSSML('281–309')).equal('281–309');
        should(ttsStrip.wordSSML('281–309')).equal('281–309');

        // word ending quote
        should(tts.wordSSML(`identity’`))
        .equal(`identity’`);

        // words without information
        should(tts.wordSSML(`ariyasaccan’ti`))
        .equal(`<phoneme alphabet="ipa" ph="ɐˈɺɪjɐsɐccɐn’tɪ">`+
            `ariyasaccan’ti</phoneme><break time="0.001s"/>`);
        should(tts.wordSSML('meditation')).equal('meditation');

        // words with information
        should(tts.wordSSML('bhikkhu'))
        .equal(`<phoneme alphabet="ipa" ph="b\u026aku\u02D0">bhikkhu</phoneme>${BREAK}`);

        // words with voice dependent information
        // are expanded with default words.ipa
        should.deepEqual(tts.wordInfo('sati'), {
            language: "pli",
        });
        should(tts.wordSSML('sati'))
        .equal(`<phoneme alphabet="ipa" ph="s\u0250t\u026a">sati</phoneme>${BREAK}`);

        // english word variant
        should(tts.wordSSML('bowed'))
        .equal(`<phoneme alphabet="ipa" ph="ba\u028ad">bowed</phoneme>${BREAK}`);

        // hyphenated word 
        should(tts.wordSSML('well-to-do'))
        .equal(`well-to-do`);

        // acronyms
        should(tts.wordSSML('{mn1.2-en-test}'))
        .equal(`<say-as interpret-as="spell">mn1.2-en-test</say-as>`);
    });
    it("tokensSSML(text) returns array of SSML tokens", function() {
        var tts = new AbstractTTS({
            languageUnknown: 'pli',
        });
        var text = "Bhikkhus, the well-to-do Tathagata, was at Ukkaṭṭhā today.";
        var tokens = tts.tokensSSML(text);
        should.deepEqual(tokens, [
            `<phoneme alphabet="ipa" ph="bɪkuːz">Bhikkhus</phoneme>${BREAK}` ,
            ',', 'the', 'well-to-do',
            `<phoneme alphabet="ipa" ph="təˈtɑːɡətə">Tathagata</phoneme>${BREAK}`,
            ',', 'was', 'at',
            `${BREAK}<phoneme alphabet="ipa" ph="uk.k\u0250\u0288\u0306\u0288\u02b0\u0251">Ukkaṭṭhā</phoneme>${BREAK}`,
            'today', '.',
        ]);

        var tokens = tts.tokensSSML([
            `Life is good.`,
            `Why is that?\n`,
            `They perceive fire as fire.`,
        ].join('\n'));
        should.deepEqual(tokens, [
            'Life', 'is', 'good', '.', '\n',
            'Why', 'is', 'that', '?', '\n',
            tts.break(4), '\n',
            'They', 'perceive', 'fire', 'as', 'fire', '.',
        ]);

        // XML
        var tokens = tts.tokensSSML([
            `Life is good & happy.`,
        ].join('\n'));
        should.deepEqual(tokens, [
            'Life', 'is', 'good', '&amp;', 'happy', '.',
        ]);
    });
    it("isNumber(text) returns true if text is a number", function() {
        var tts = new AbstractTTS();

        should(tts.isNumber(' ')).equal(false);
        should(tts.isNumber('\n')).equal(false);
        should(tts.isNumber('a')).equal(false);
        should(tts.isNumber('a1')).equal(false);
        should(tts.isNumber('1a')).equal(false);
        should(tts.isNumber('123.')).equal(false);
        should(tts.isNumber('.123')).equal(false);
        should(tts.isNumber('123\n')).equal(false);
        should(tts.isNumber('\n123')).equal(false);
        should(tts.isNumber('281–309')).equal(true);
        should(tts.isNumber('1,234')).equal(true);

        should(tts.isNumber('1')).equal(true);
        should(tts.isNumber('123')).equal(true);
        should(tts.isNumber('-123')).equal(true);
        should(tts.isNumber('+123')).equal(true);
        should(tts.isNumber('+123.45')).equal(true);
        should(tts.isNumber('123.45')).equal(true);
        should(tts.isNumber('-0.45')).equal(true);
    });
    it("segment(tokens) returns array of segments", function() {
        var tts = new AbstractTTS();
        should(isNaN('\n')).equal(false); // surprising
        var ssml = tts.segment([
            'a', 'b', '\n', '\n', 'c', '\n', 'd',
        ]);
        should.deepEqual(ssml, [
            'a b\n\n',
            'c\n',
            'd',
        ]);
        var segments = tts.segment([
            'Why', 'is', 'that', '?', '\n',
            '\n',
            'They', 'perceive', 'fire', 'as', 'fire', '.',
        ]);
        should.deepEqual(segments, [
            'Why is that?\n\n', 
            'They perceive fire as fire.',
        ]);
        var segments = tts.segment([
            'a', '<b/>', ',', '(', 'c', 'd', ')', 'e', '.', 
            'f', 'g', '?', 
            'h', 'i', '!', 
            'j', '\u2018', 'k', ',', '\u2019', 'l',
            '5', 'm',
        ]);
        should.deepEqual(segments, [
            'a <b/>, (c d) e.',
            'f g?',
            'h i!',
            'j \u2018k,\u2019 l 5 m',
        ]);
    });
    it("segmentSSML(text) returns array of SSML text segments", function() {
        var tts = new AbstractTTS();
        var ttsStrip = new AbstractTTS({
            languageUnknown: 'pli',
            stripNumbers: true,
        });

        // nothing
        var ssml = tts.segmentSSML('123');
        should.deepEqual(ssml, ['123']);
        var ssml = ttsStrip.segmentSSML('123');
        should.deepEqual(ssml, [' ']);

        // a paragraph of sentences
        var ssml = tts.segmentSSML([
            'Bhikkhus, he does not conceive water to be \u2018mine,\u2019 he does not delight in water.',
            'Why is that?',
            'Because delight is the root of suffering.',
        ].join(' '));
        should.deepEqual(ssml, [
            `<phoneme alphabet="ipa" ph="bɪkuːz">Bhikkhus</phoneme>${BREAK}` + 
                ', he does not conceive water to be \u2018mine,\u2019 he does not delight in water.',
            'Why is that?',
            'Because delight is the root of suffering.',
        ]);

        // two paragraphs
        var text = 'a1, a2 a3.\n' +
            'b1 b2?\n\n' +
            'c1 c2 c3.\n';
        var tokens = tts.tokensSSML(text);
        should.deepEqual(tokens, [
            'a1', ',', 'a2', 'a3', '.', '\n',
            'b1', 'b2', '?', '\n',
            tts.break(4), '\n',
            'c1', 'c2', 'c3', '.', '\n',
        ]);
        var ssml = tts.segment(tokens);
        should.deepEqual(ssml, [
            `a1, a2 a3.\n`,
            'b1 b2?\n',
            `${tts.break(4)}\n`,
            `c1 c2 c3.\n`,
        ]);
    });
    it("break(index) returns SSML break", function() {
        var tts = new AbstractTTS();
        should(tts.break(0)).equal('<break time="0.001s"/>');
        should(tts.break(1)).equal('<break time="0.1s"/>');
    });
    it("tokenize(text) returns array of tokens", function() {
        var tts = new AbstractTTS();
        should.deepEqual(tts.tokenize('281–309'), [
            '281–309',
        ]);
        should.deepEqual(tts.tokenize('1,234'), [
            '1,234',
        ]);
        should.deepEqual(tts.tokenize(`he does'nt conceive`), [
            'he', `does'nt`, 'conceive', 
        ]);
        should.deepEqual(tts.tokenize('to be \u2018mine,\u2019.'), [
            'to', 'be', '\u2018', 'mine', ',', '\u2019', '.', 
        ]);
        should.deepEqual(tts.tokenize('Why is that?'), [
            'Why', 'is', 'that', '?',
        ]);
    });
    it("ffmpegConcat(files) returns sound file", function(done) {
        var abstractTTS = new AbstractTTS();
        var files = [
            path.join(__dirname, 'data/1d4e09ef9cd91470da56c84c2da481b0.ogg'),
            path.join(__dirname, 'data/0e4a11bcb634a4eb72d2004a74f39728.ogg'),
        ];
        (async function() {
            should(fs.existsSync(files[0])).equal(true);
            should(fs.existsSync(files[1])).equal(true);
            var cache = true;
            var result = await abstractTTS.ffmpegConcat(files, { cache });
            should(result).properties(['file','cached','hits','misses']);
            should(fs.existsSync(result.file)).equal(true);

            done();
        })();
    });

})
