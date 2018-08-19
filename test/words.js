(typeof describe === 'function') && describe("seg-doc", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const Words = require("../src/words");

    it("TESTTESTWords() is default constructor", function() {
        var words = new Words();
        should(words.language).equal('en');

        // default constuctor reads in words/en.json
        should(words.canonical('bhikku')).equal('bhikkhu');
    });
    it("TESTTESTllookup() returns word information", function() {
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
    it("TESTTESTisWord(token) return true if token is a word", function() {
        var words = new Words();

        // strings with symbols
        should(words.isWord('!')).equal(false);
        should(words.isWord('abc/def')).equal(false);

        // strings without symbols
        should(words.isWord('abc')).equal(true);
        should(words.isWord('123')).equal(true);
        should(words.isWord('1.23')).equal(false);
    });
    it("TESTTESTisForeignWord(token) return true if token is a word in foreign alphabet", function() {
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
    });
    it("TESTTESTromanize(text) returns romanized text", function() {
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

})
