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
    it("TESTTESTalternates(word) returns array of alternate spellings", function() {
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
    it("TESTTESTtokenize(text) returns array of tokens", function() {
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
    it("TESTTESTutf16(word, minCode) return Unicode-16 string escape", function() {
        var words = new Words();
        should(Words.utf16('a\u0123\u0abcb',0x7f)).equal('a\\u0123\\u0ABCb');
        should(Words.utf16('a\u0123\u0abcb')).equal('\\u0061\\u0123\\u0ABC\\u0062');
    });
    it("TESTTESTipa(word, language) return IPA for word", function() {
        ipaCompare('ba', 'b\u0250');
        ipaCompare('a', '\u0250\u02c8');
        //ipaCompare('aa', 'a\u0306\u0250');
        ipaCompare('\u016b', '\u028a\u02D0'); // u-macron
        ipaCompare('bh', 'b\u02b0');
        ipaCompare('dh', 'd\u02b0');
        ipaCompare('gh', 'g\u02b0');
        ipaCompare('dvedhāvitakka', 'dvedʰɑːvɪʈɐkkɐ');
        ipaCompare('aṭṭhakanāgarasutta', 'ɐ\u02c8ʈ̆ʈʰɐkɐn\u0251\u02d0gɐ\u027aɐsʊʈʈɐ');
        ipaCompare('aggaññasutta', 'ɐ\u02c8ggɐŋŋɐsʊʈʈɐ');
        ipaCompare('ānanda', '\u0251\u02d0nɐndɐ');
        ipaCompare('aṅgaka', 'ɐ\u02c8ŋgɐkɐ');
        ipaCompare('anīgha', 'ɐ\u02c8niːgʰɐ');
        ipaCompare('anāthapiṇḍika', 'ɐ\u02c8n\u0251ːʈʰɐpɪndɪkɐ');
        ipaCompare('Bhāradvāja', 'bʰɑː\u027aɐdvɑːʝɐ');
        ipaCompare('Cūḷataṇhāsaṅkhayasutta', 'kʊːʟ̈ɐʈɐŋʰɑːsɐŋkʰajɐsʊʈʈɐ');
        ipaCompare('Cūḷaassapurasutta', 'kʊːʟ̈ɐɐssɐpʊɺɐsʊʈʈɐ');
    });


})
