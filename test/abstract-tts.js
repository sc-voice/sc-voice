(typeof describe === 'function') && describe("abstract-tts", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const tmp = require('tmp');
    const {
        AudioTrans,
        AbstractTTS,
        SoundStore,
        Words,
    } = require("../index");
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    const BREAK = `<break time="0.001s"/>`;
    const PARA_BREAK = `<break time="1.5s"/>`;
    const ELLIPSIS = "\u2026";
    const ELLIPSIS_BREAK = '.';
    var storePath = tmp.tmpNameSync();
    this.timeout(5*1000);

    it("default ctor", () => {
        var tts = new AbstractTTS();

        // options
        should(tts).properties({
            api: null,
            apiVersion: null,
            audioFormat: 'audio/ogg',
            audioSuffix: '.ogg',
            breaks: [0.001,0.1,0.2,0.6,1],
            customWords: undefined,
            ellipsisBreak: '.',
            fullStopComma: undefined,
            language: 'en',
            localeIPA: 'en',
            maxConcurrentServiceCalls: 5,
            maxCuddle: 1,
            maxSegment: 1000,
            maxSSML: 5000,
            noAudioPath: undefined,
            prosody: {
                rate: "-10%",
            },
            stripChars: /[\u200b]/g,
            stripNumbers: undefined,
            stripQuotes: undefined,
            syllabifyLength: undefined,
            syllableVowels: undefined,
            unknownLang: undefined,
            usage: 'recite',
            usages: {},
        });
        should(tts.soundStore).instanceOf(SoundStore);
        should(tts.words).instanceOf(Words);
        should(tts.audioTrans).instanceOf(AudioTrans);
        should(fs.existsSync(tts.audioTrans.coverPath)).equal(true);
        should(tts.audioTrans).properties({
            publisher: 'voice.suttacentral.net',
            genre: 'Dhamma',
            cwd: tts.soundStore.storePath,
            album: 'voice.suttacentral.net',
            audioSuffix: tts.audioSuffix,
        });
    });
    it("custom ctor", function() {
        var words = new Words();
        var unknownLang = 'de';
        var usage = 'review';
        var maxSSML = 6000;
        var tts = new AbstractTTS({
            words,
            unknownLang,
            usage,
            maxSSML,
        });
        should(tts.words).equal(words);
        should(tts).properties({
            language: 'en',
            localeIPA: 'en',
            unknownLang,
            usage,
            maxSSML,
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
        var tts = new AbstractTTS({
            customWords: {
                godzilla: {
                    language: 'en',
                },
                deutsch: {
                    language: 'de',
                },
            },
        });
        var bhikkhu = {
            ipa: "b\u026aku\u02D0",
            language: "pli",
        };
        var bhikkhus = {
            ipa: "b\u026aku\u02D0z",
            language: "pli",
        };

        // should.js bug
        should.deepEqual(tts.wordInfo('should'), { language: 'en'} );

        // word in en.json
        should.deepEqual(tts.wordInfo('identity'), { language: 'en'} );

        // word in en.json with symbols having isWordTrim:true
        should.deepEqual(tts.wordInfo(`identity'`), { language: 'en'} ); 
        should.deepEqual(tts.wordInfo(`identity\u2019`), { language: 'en'} );

        // punctuation
        should.deepEqual(tts.wordInfo(`.`), null );

        // custom words
        should.deepEqual(tts.wordInfo(`godzilla`), {language: 'en'} );
        should.deepEqual(tts.wordInfo(`deutsch`), {language: 'de'} );

        // Pali word in common.js
        should.deepEqual(tts.wordInfo(`akkha`), {language: 'pli'} );

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
            localeIPA: 'pli',
        });
        var ttsStrip = new AbstractTTS({
            localeIPA: 'pli',
            stripNumbers: true,
        });

        // symbols

        // Ellipsis substitution happens during segmenting
        // because ellipses stand alone
        // should(tts.wordSSML(ELLIPSIS)).equal(ELLIPSIS_BREAK);

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
            localeIPA: 'pli',
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
    it("maxSegment controls segment length", function() {
        var tts = new AbstractTTS({
            maxSegment: 5,
            maxCuddle: 0,
        });

        // lots of tokens
        var ssml = tts.segment([
            'a', 'b', 'c', 'd', 'e', 'f', 'g',
        ]);
        should.deepEqual(ssml, [
            'a b c',
            'd e f',
            'g',
        ]);

        // punctuation
        var ssml = tts.segment([
            'a', 'b', ',', 'c', ',', 'd', 'e', 'f', 'g',
        ]);
        should.deepEqual(ssml, [
            'a b,',
            'c, d',
            'e f g',
        ]);
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
            localeIPA: 'pli',
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
    it("sectionBreak() returns longest SSML break", function() {
        var tts = new AbstractTTS();
        should(tts.sectionBreak()).equal('<break time="1s"/>');
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
    it("concatAudio(files) returns Opus file", async()=>{
        var abstractTTS = new AbstractTTS();
        var files = [
            path.join(__dirname, 'data/1d4e09ef9cd91470da56c84c2da481b0.ogg'),
            path.join(__dirname, 'data/0e4a11bcb634a4eb72d2004a74f39728.ogg'),
        ];
        should(fs.existsSync(files[0])).equal(true);
        should(fs.existsSync(files[1])).equal(true);
        var cache = false;
        var title = "test_title";
        var artist = "test_artist";
        var album_artist = "test_album_artist";
        var comment = "test_comment";
        var album = "test_album";
        var date = new Date().toLocaleDateString();
        var audioSuffix = '.ogg';
        var result = await abstractTTS.concatAudio(files, { 
            cache,
            title,
            date,
            album_artist,
            album,
            artist,
            comment,
            audioSuffix,
        });
        let guid = path.basename(result.file).split('.')[0];
        let cmd = `ffprobe -hide_banner ${result.file}`;
        var {stdout,stderr} = await execPromise(cmd);
        stderr = stderr.split('\n').join('\n');
        should(stderr).match(/title\s*:\s*test_title/msiu);
        should(stderr).match(/\bartist\s*:\s*test_artist/msiu);
        should(stderr).match(/album\s*:\s*test_album/msiu);
        should(stderr).match(/album_artist\s*:\s*test_album_artist/msiu);
        should(stderr).match(/comment\s*:\s*Cover/msiu);
        should(stderr).match(new RegExp(`version\\s*:\\s*${guid}`, `msiu`));
        should(stderr).match(new RegExp(`date\\s*:\\s*${date}`, `msiu`));

        // Verify defaults
        should(stderr).match(/genre\s*:\s*Dhamma/msiu);

        should(result).properties(['file','cached','hits','misses','signature']);
        should(fs.existsSync(result.file)).equal(true); // output file guid
        should(result.file).match(
            new RegExp(`.*${result.signature.guid}.ogg`));  // output guid
    });
    it("concatAudio(files) returns sound file", function(done) {
        var abstractTTS = new AbstractTTS();
        var files = [
            path.join(__dirname, 'data/1d4e09ef9cd91470da56c84c2da481b0.ogg'),
            path.join(__dirname, 'data/0e4a11bcb634a4eb72d2004a74f39728.ogg'),
        ];
        (async function() { try {
            should(fs.existsSync(files[0])).equal(true);
            should(fs.existsSync(files[1])).equal(true);
            var cache = true;
            var result = await abstractTTS.concatAudio(files, { cache });
            should(result).properties(['file','cached','hits','misses','signature']);
            should(fs.existsSync(result.file)).equal(true); // output file guid
            should(result.file).match(
                new RegExp(`.*${result.signature.guid}.*`));  // output guid

            done();
        } catch(e) {done(e);} })();
    });
    it("concatAudio(files) returns sound file", async()=>{
        var soundStore = new SoundStore({
            storePath,
        });
        var abstractTTS = new AbstractTTS({
            soundStore,
        });
        var volume = 'test-concatAudio';
        var files = [
            soundStore.guidPath({
                volume,
                guid: 'test1',
            }),
            soundStore.guidPath({
                volume,
                guid: 'test2',
            }),
        ];
        var data1 = path.join(__dirname, 'data/1d4e09ef9cd91470da56c84c2da481b0.ogg');
        var data2 = path.join(__dirname, 'data/0e4a11bcb634a4eb72d2004a74f39728.ogg');
        fs.writeFileSync(files[0], fs.readFileSync(data1));
        fs.writeFileSync(files[1], fs.readFileSync(data2));
        //console.log('concatAudio TEST', storePath);
        should(fs.existsSync(files[0])).equal(true);
        should(fs.existsSync(files[1])).equal(true);
        var cache = true;
        var result = await abstractTTS.concatAudio(files, { cache });
        should(result).properties(['file','cached','hits','misses','signature']);
        should(fs.existsSync(result.file)).equal(true); // output file guid
        should(result.file).match(
            new RegExp(`.*${result.signature.guid}.*`));  // output guid
        should(result.signature.guid).match(/5a38166405fb1a9884220d0a2bd6d97a/);
    });
    it("syllabify(word) spaces word by syllable", function() {
        var tts = new AbstractTTS({
            syllableVowels: "aeiouāīū",
        });
        should(tts.syllableVowels).equal("aeiouāīū");

        should(tts.syllabify("tatetitotutātītū")).equal("ta te ti to tu tā tī tū");
        should(tts.syllabify("a")).equal("a");
        should(tts.syllabify("at")).equal("at");
        should(tts.syllabify("ta")).equal("ta");
        should(tts.syllabify("ata")).equal("a ta");
        should(tts.syllabify("tat")).equal("tat");
        should(tts.syllabify("taat")).equal("ta at");
        should(tts.syllabify("tatta")).equal("tat ta");
        should(tts.syllabify("tattat")).equal("tat tat");
        should(tts.syllabify("tatat")).equal("ta tat");
        should(tts.syllabify("atatat")).equal("a ta tat");
        should(tts.syllabify("atatata")).equal("a ta ta ta");
        should(tts.syllabify("atattata")).equal("a tat ta ta");
        should(tts.syllabify("atattatta")).equal("a tat tat ta");
        should(tts.syllabify("acchariyaabbhutasutta"))
            .equal("ac cha ri ya ab bhu ta sut ta");
    });
    it("stripHtml(html) cleans html", function() {
        var tts = new AbstractTTS();
        should(tts.stripHtml('faithless')).equal('faithless');
        should(tts.stripHtml('faithless ...')).equal('faithless \u2026');
    });

})
