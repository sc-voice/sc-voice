(typeof describe === 'function') && describe("words", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const Words = require("../src/words");

    var words = new Words();

    function ipaCompare(word,b) {
        var a = words.ipa(word);
        var autf = Words.utf16(a);
        var butf = Words.utf16(b);
        if (autf !== butf) {
            console.log(autf, autf.length);
            console.log(butf, butf.length);
        }
        should(autf).equal(butf);
        should(a).equal(b);
    }

    it("Words() is default constructor", function() {
        var words = new Words();
        should(words.language).equal('en');

        // default constuctor reads in words/en.json
        should(words.canonical('bhikku')).equal('bhikkhu');
    });
    it("lookup() returns word information", function() {
        var words = new Words();
        var bhikkhu = {
            word: 'bhikkhu',
            ipa: "b\u026aku\u02D0(.)",
        };
        should.deepEqual(words.lookup('asdf'), null);
        should.deepEqual(words.lookup('bhikkhu'), bhikkhu);
        should.deepEqual(words.lookup('bikkhu'), bhikkhu);
        should.deepEqual(words.lookup('bhikku'), bhikkhu);
    });
    it("isWord(token) return true if token is a word", function() {
        var words = new Words();

        // strings with symbols
        should(words.isWord('!')).equal(false);
        should(words.isWord('abc/def')).equal(false);

        // strings without symbols
        should(words.isWord('abc')).equal(true);
        should(words.isWord('123')).equal(false);
        should(words.isWord('1.23')).equal(false);
    });
    it("isForeignWord(token) return true if token is a word in foreign alphabet", function() {
        var words = new Words();
        // punctuation
        should(words.isForeignWord('!')).equal(false);


        // native word
        should(words.isForeignWord('abc')).equal(false);
        should(words.isForeignWord('ABC')).equal(false);

        // foreign word
        should(words.isForeignWord('Brahm\u0101')).equal(true);
        should(words.isForeignWord('brahm\u0101')).equal(true);
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
    it("tokenize(text) returns array of tokens", function() {
        var words = new Words();
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
    it("utf16(word, minCode) return Unicode-16 string escape", function() {
        var words = new Words();
        should(Words.utf16('a\u0123\u0abcb',0x7f)).equal('a\\u0123\\u0ABCb');
        should(Words.utf16('a\u0123\u0abcb')).equal('\\u0061\\u0123\\u0ABC\\u0062');
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
        ipaCompare(`anīgha`, `ɐ\u02c8niːg\u02b0${aend}`);
        ipaCompare(`anāthapiṇḍika`, `ɐˈnɑthɐpɪŋdɪk${aend}`);
        ipaCompare(`Bhāradvāja`, `b\u02b0ɑ\u027aɐdvɑʝ${aend}`);
        ipaCompare(`Cūḷataṇhāsaṅkhayasutta`, `cʊːʟ̈ɐtɐŋhɑsɐ\u1e45k\u02b0ajɐ\u02cc${sutta}`);
        ipaCompare(`Cūḷaassapurasutta`, `cʊːʟ̈ɐɐssɐpuɺɐ${sutta}`);
        ipaCompare(`Saccavibhaṅgasutta`,`sɐccɐvɪb\u02b0ɐŋgɐ${sutta}`);
        ipaCompare(`Pañcālacaṇḍa`,`pɐɲcɑlɐcɐ\u014bd${aend}`);
        ipaCompare(`Ākaṅkheyyasutta`,`ɑk\u0250\u1e45k\u02b0ejjɐ${sutta}`);
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

        var pali = 'Mūlapariyāyasutta';
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

})
