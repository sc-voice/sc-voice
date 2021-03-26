(typeof describe === 'function') && describe("words", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Words,
    } = require("../index");
    const ELLIPSIS = '\u2026';
    const { English } = require('scv-bilara');

    var words = new Words();

    function ipaCompare(word,b) {
        var a = words.ipa(word);
        var autf = Words.utf16(a);
        var butf = Words.utf16(b);
        if (autf !== butf) {
            console.error();
            console.error('ipaCompare autf:', autf, autf.length);
            console.error('ipaCompare butf:', butf, butf.length);
        }
        should(autf).equal(butf);
        should(a).equal(b);
    }

    it("Words() is default constructor", async()=>{
        var words = new Words();
        should(words.language).equal('en');

        // default constuctor reads in words/en.json
        should(words.canonical('bhikku')).equal('bhikkhu');
    });
    it("lookup() returns word information", function() {
        var words = new Words();
        var bhikkhu = {
            word: 'bhikkhu',
            ipa: "b\u026aku\u02D0",
            language: "pli",
        };
        should.deepEqual(words.lookup('asdf'), null);
        should.deepEqual(words.lookup('bhikkhu'), bhikkhu);
        should.deepEqual(words.lookup('bikkhu'), bhikkhu);
        should.deepEqual(words.lookup('bhikku'), bhikkhu);
    });
    it("wordInfo(word) describes word", () => {
        var words = new Words();
        var en = {
            language: 'en',
        }

        // normal English word
        should.deepEqual(words.wordInfo("shoulders"), en);

        // should.js nastiness
        should.deepEqual(words.wordInfo("should"), en); 

        // Pali word
        var pli = {
            language: 'pli',
        };
        should.deepEqual(words.wordInfo("akkha"), pli); 
    });
    it("isWord(token) return true if token is a word", function() {
        var words = new Words();

        // strings with symbols
        should(words.isWord('!')).equal(false);
        should(words.isWord('abc/def')).equal(false);

        // strings without symbols
        should(words.isWord('abc')).equal(true);

        // numbers
        should(words.isWord('123')).equal(false);
        should(words.isWord('1.23')).equal(false);
        should(words.isWord('1,234')).equal(false);

        // xml
        should(words.isWord('&amp;')).equal(false);
    });
    it("trimWordSymbols(word) removes symbols", function() {
        var words = new Words();
        should(words.trimWordSymbols('hello')).equal('hello');
        should(words.trimWordSymbols(`identity’`)).equal(`identity`);
    });
    it("isNumber(text) returns true if text is a number", function() {
        var words = new Words();

        should(words.isNumber(' ')).equal(false);
        should(words.isNumber('\n')).equal(false);
        should(words.isNumber('a')).equal(false);
        should(words.isNumber('a1')).equal(false);
        should(words.isNumber('1a')).equal(false);
        should(words.isNumber('123.')).equal(false);
        should(words.isNumber('.123')).equal(false);
        should(words.isNumber('123\n')).equal(false);
        should(words.isNumber('\n123')).equal(false);
        should(words.isNumber('281–309')).equal(true);
        should(words.isNumber('1,234')).equal(true);

        should(words.isNumber('1')).equal(true);
        should(words.isNumber('123')).equal(true);
        should(words.isNumber('-123')).equal(true);
        should(words.isNumber('+123')).equal(true);
        should(words.isNumber('+123.45')).equal(true);
        should(words.isNumber('123.45')).equal(true);
        should(words.isNumber('-0.45')).equal(true);
    });
    it("isForeignAlphabet(token) return true if token is a word in foreign alphabet", async()=>{
        var words = new Words();
        // punctuation
        should(words.isForeignAlphabet('!')).equal(false);

        // native word
        should(words.isForeignAlphabet('thirty')).equal(false);
        should(words.isForeignAlphabet('Thirty')).equal(false);
        should(words.isForeignAlphabet('htirty')).equal(false);
        should(words.isForeignAlphabet('hTirty')).equal(false);

        // foreign word
        should(words.isForeignAlphabet('Brahm\u0101')).equal(true);
        should(words.isForeignAlphabet('brahm\u0101')).equal(true);
        should(words.isForeignAlphabet('rBahm\u0101')).equal(true);
        should(words.isForeignAlphabet('rbahm\u0101')).equal(true);

        // hyphenated
        should(words.isForeignAlphabet('thirty-three')).equal(false);
        should(words.isForeignAlphabet('well-to-do')).equal(false);
    });
    it("isForeignWord(token) => true if foreign word", async()=>{
        var words = new Words(undefined, {language:'en-GB'});

        // TODO: This is really a bug. Words should have an async initialize
        await new Promise(r=>setTimeout(()=>r(),1000)); 

        // punctuation
        should(words.isForeignWord('!')).equal(false);

        // native word
        should(words.isForeignWord('unburdensome')).equal(false);
        should(words.isForeignWord('thirty')).equal(false);
        should(words.isForeignWord('Thirty')).equal(false);
        should(words.isForeignWord('htirty')).equal(true); // in dictionary
        should(words.isForeignWord('hTirty')).equal(true); // in dictionary

        // foreign word
        should(words.isForeignWord('Brahm\u0101')).equal(true);
        should(words.isForeignWord('brahm\u0101')).equal(true);
        should(words.isForeignWord('rBahm\u0101')).equal(true);
        should(words.isForeignWord('rbahm\u0101')).equal(true);

        // hyphenated
        should(words.isForeignWord('thirty-three')).equal(false);
        should(words.isForeignWord('well-to-do')).equal(false);

    });
    it("alternates(word) returns array of alternate spellings", function() {
        var words = new Words();
        should.deepEqual(words.alternates('asdf'), ['asdf']);
        should.deepEqual(words.alternates('bhikkhu'), [
            'bhikkhu', 
            'bhikku',
            'bikkhu',
        ]);
        should.deepEqual(words.alternates('Bhikkhu'), [
            'bhikkhu', 
            'bhikku',
            'bikkhu',
        ]);
        should.deepEqual(words.alternates('bhikku'), [
            'bhikkhu', 
            'bhikku',
            'bikkhu',
        ]);

        should.deepEqual(words.alternates('abhibh\u016b'), [
            'abhibh\u016b', 
            'abhibhu',
        ]);
        should.deepEqual(words.alternates('abhibhu'), [
            'abhibh\u016b', 
            'abhibhu',
        ]);
    });
    it("romanize(text) returns romanized text", function() {
        var words = new Words();
        should(words.romanize("abc")).equal('abc');
        should(words.romanize("Abc")).equal('abc');
        should(words.romanize("Tath\u0101gata")).equal('tathagata');
        should(words.romanize("Ukkaṭṭhā")).equal('ukkattha');
        should(words.romanize("Bhikkhū")).equal('bhikkhu');
        should(words.romanize("tassā’ti")).equal(`tassa${Words.U_RSQUOTE}ti`);
        should(words.romanize("saññatvā")).equal(`sannatva`);
        should(words.romanize("pathaviṃ")).equal(`pathavim`);
        should(words.romanize("viññāṇañcāyatanato")).equal(`vinnanancayatanato`);
        should(words.romanize("diṭṭhato")).equal(`ditthato`);
        should(words.romanize("khīṇāsavo")).equal(`khinasavo`);
        should(words.romanize("pavaḍḍhanti")).equal(`pavaddhanti`);
        should(words.romanize("ĀḌḤĪḶḸṂṆÑṄṚṜṢŚṬŪṁ")).equal(`adhillmnnnrrsstum`);
        should(words.romanize("‘Nandī dukkhassa mūlan’ti—"))
            .equal(`${Words.U_LSQUOTE}nandi dukkhassa mulan${Words.U_RSQUOTE}ti${Words.U_EMDASH}`);

    });
    it("tokenize(text) handles numbers", function() {
        var words = new Words();
        var tokens = words.tokenize('one of 80,000—all');
        should.deepEqual(tokens, [
            'one',
            'of',
            '80,000',
            '—',
            'all',
        ]);

        var tokens = words.tokenize('8,400,000,000 cars 2,400,000 and 6,000, and 600');
        should.deepEqual(tokens, [
            '8,400,000,000',
            'cars',
            '2,400,000',
            'and',
            '6,000',
            ',',
            'and',
            '600',
        ]);
    });
    it("tokenize(text) returns array of tokens", function() {
        var words = new Words();

        var tokens = words.tokenize('Hello {mn1.2-en-test} world.');
        should.deepEqual(tokens, [
            'Hello', '{mn1.2-en-test}', 'world', '.',
        ]);

        var segments = [
            'he does not conceive earth',
            'to be \u2018mine,\u2019.',
            'Why is that?',
            'Abhayarājakumārasutta',
            `abc${Words.U_EMDASH}def`,
        ];
        var text = segments.join(' ');
        var tokens = words.tokenize(text);
        should.deepEqual(tokens, [
            'he', 'does', 'not', 'conceive', 'earth', 
            'to', 'be', '\u2018', 'mine', ',', '\u2019', '.', 
            'Why', 'is', 'that', '?', 'Abhayar\u0101jakum\u0101rasutta',
            `abc`, Words.U_EMDASH, `def`,
        ]);
    });
    it("RE_ACRONYM matches acronyms", function(){
        should(Words.RE_ACRONYM.test('abc')).equal(false);
        should(Words.RE_ACRONYM.test('{abc}')).equal(true);
    });
    it("utf16(word, minCode) return Unicode-16 string escape", function() {
        var words = new Words();
        should(Words.utf16('a\u0123\u0abcb',0x7f))
            .equal('a\\u0123\\u0ABCb');
        should(Words.utf16('a\u0123\u0abcb'))
            .equal('\\u0061\\u0123\\u0ABC\\u0062');
    });
    it("ipa(word, language) return IPA for word", function() {
        var aend = `\u0061\u0308`;
        var sutta = `\u02ccsutt${aend}`;
        ipaCompare(`bab`, `b\u0250b`);
        ipaCompare(`a`, `\u0250\u02c8`);
        ipaCompare(`\u016b`, `\u028a\u02D0`); // u-macron
        ipaCompare(`dvedhāvitakka`, `dved\u02b0ɑvɪtɐk.k${aend}`);
        ipaCompare(`aṭṭhakanāgarasutta`, `ɐ\u02c8ʈ̆ʈʰɐkɐn\u0251gɐ\u027aɐ${sutta}`);
        ipaCompare(`aggaññasutta`, `ɐ\u02c8ggɐ\u0272\u0272ɐ${sutta}`);
        ipaCompare(`ānanda`, `\u0251nɐnd${aend}`);
        ipaCompare(`Dhamma`, `d\u02b0\u0250mm${aend}`); // SlowAmy can`t say "dh"
        ipaCompare(`aṅgaka`, `ɐ\u02c8ŋgɐk${aend}`);
        ipaCompare(`anīgha`, `ɐ\u02c8nɪig\u02b0${aend}`);
        ipaCompare(`anāthapiṇḍika`, `ɐˈnɑthɐpɪŋdɪk${aend}`);
        ipaCompare(`Bhāradvāja`, `b\u02b0ɑ\u027aɐdvɑʝ${aend}`);
        ipaCompare(`Cūḷataṇhāsaṅkhayasutta`, `cʊːʟ̈ɐtɐŋhɑsɐ\u1e45k\u02b0ajɐ\u02cc${sutta}`);
        ipaCompare(`Cūḷaassapurasutta`, `cʊːʟ̈ɐɐssɐpuɺɐ${sutta}`);
        ipaCompare(`Saccavibhaṅgasutta`,`sɐccɐvɪb\u02b0ɐŋgɐ${sutta}`);
        ipaCompare(`Pañcālacaṇḍa`,`pɐɲcɑlɐcɐ\u014bd${aend}`);
        ipaCompare(`Ākaṅkheyyasutta`,`ɑk\u0250\u1e45k\u02b0ejjɐ${sutta}`);
        ipaCompare(`jhana`,`\u029dh\u0250na\u0308`);
    });
    it("add(word, language) return IPA for word", function() {
        var filePath = path.join(__dirname, 'data/en.json');
        var words = new Words(null, { filePath });

        // add an english alternate
        should(words.lookup('centre')).equal(null);
        should(words.lookup('center')).equal(null);
        words.add('center', {
            alternates: ['centre'],
        });
        should.deepEqual(words.lookup('centre'), {
            word: 'center',
        });
        should.deepEqual(words.lookup('center'), {
            word: 'center',
        });
        should.deepEqual(words.alternates('centre'), [
            'center', 'centre',
        ]);

        var pali = 'Mūlapariyāya';
        var paliRoman = words.romanize(pali);
        words.add(pali, {
            language: 'pli',
        });
        should.deepEqual(words.lookup(pali), {
            ipa: words.ipa(pali),
            word: pali.toLowerCase(),
        });
        should.deepEqual(words.lookup(paliRoman), {
            ipa: words.ipa(pali),
            word: pali.toLowerCase(),
        });
    });
    it("levenshtein(a,b) returns distance between word", function() {
        should(Math.min(321,12,42)).equal(12);
        should(Words.levenshtein('abc','abc')).equal(0);
        should(Words.levenshtein('bc','abc')).equal(1);
        should(Words.levenshtein('abc','axbyc')).equal(2);
        should(Words.levenshtein('abc','ABC')).equal(3);
        should(Words.levenshtein('know','knows')).equal(1);
    });
    it("commonPhrase(a,b,minLength) returns longest common word left sequence", function() {
        var minLength = 1;
        should(Words.commonPhrase(
            `b1 b2 v0aaa v1b`,
            `v0aaa v2b`, 
            4
            )).equal(`v0aaa`);
        should(Words.commonPhrase("a", "b c", minLength)).equal('');
        should(Words.commonPhrase("a", "a b c", minLength)).equal('a');
        should(Words.commonPhrase("a b c", "b c", minLength)).equal('b c');
        should(Words.commonPhrase("a c b b c", "b c", minLength)).equal('b c');
        should(Words.commonPhrase(
            "Take a mendicant who, reflecting properly, lives restraining the faculty of the eye.", 
            "Reflecting properly, they live restraining the faculty of the ear …"
        )).equal('restraining the faculty of the');
    });
    it("alternatesRegExp(text) creates a pattern for finding text", function() {
        var words = new Words();
        var pat = words.alternatesRegExp("bhikkhu");
        should(pat.test('asfd bhikkhu asdf')).equal(true); // canonical spelling
        should(pat.test('asfd bikkhu asdf')).equal(true); // alternate spelling
        should(pat.test('asfd bhikku asdf')).equal(true); // alternate spelling
        should(pat.test('asfd biku asdf')).equal(false); // invalid spelling
        should(pat.test('asfd bhikkhus asdf')).equal(false); // plural

        var pat = words.alternatesRegExp("Tathagata");
        should(pat.test('asfd Tathagata asdf')).equal(true); // alternate spelling
        should(pat.test('asfd tathagata asdf')).equal(true); // alternate spelling
        should(pat.test('asfd Tath\u0101gata asdf')).equal(true); // case
        should(pat.test('asfd tath\u0101gata asdf')).equal(true); // canonical spelling

        var pat = words.alternatesRegExp("bhikku tathagata");
        should(pat.test('asfd bhikkhu tathagata asdf')).equal(true); // alternate spelling
        should(pat.test('asfd Bikkhu Tathagata asdf')).equal(true); // alternate spelling

    });
    it("Words() loads de.json", function() {
        var words = new Words(undefined, {
            language: 'de',
        });
        should(words.language).equal('de');
        should.deepEqual(words.wordInfo('mit'), {
            language: 'de',
        });
        should(words.isWord('mit')).equal(true);
        should(words.isWord('füßen')).equal(true);
        should(words.isWord('wäldchen')).equal(true);
        should(words.isWord('hörte')).equal(true);
        should(words.isForeignWord('mit')).equal(false);
        should(words.isForeignWord('füßen')).equal(false);
        should(words.isForeignWord('wäldchen')).equal(false);
        should(words.isForeignWord('hörte')).equal(false);
        should(words.romanize('mit')).equal('mit');
        should(words.romanize('füßen')).equal('füßen');
        should(words.romanize('wäldchen')).equal('wäldchen');
        should(words.romanize('hörte')).equal('hörte');
    });
    it("partitions list of phrases", function() {
        return; // TODO
        var joyPath = path.join(__dirname, "data", "joy.txt");
        var lines = fs.readFileSync(joyPath).toString().trim().split('\n');
        lines = lines.map(line=>line.trim().toLowerCase());
        should(lines.length).equal(80);
        var dict = {};
        var pat = 'joy';
        var minLength = 8; // pat.length+1;
        var rePat = new RegExp(pat);
        for (var i = 0; i < lines.length; i++) {
            for (var j = i+1; j < lines.length; j++) {
                var phrase = Words.commonPhrase(
                    lines[i], lines[j], minLength);
                //if (phrase && rePat.test(phrase)) {
                if (phrase) {
                    var count = dict[phrase] || 1;
                    dict[phrase] = count + 1;
                }
            }
        }
        console.log(`dbg dict`, dict);
    });
    it("symbols[symbol] returns info about symbol", function() {
        var words = new Words();
        should(words.symbols[ELLIPSIS]).properties({
            isEllipsis: true,
        });
    });
    

})
