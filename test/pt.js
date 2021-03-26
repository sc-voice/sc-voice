(typeof describe === 'function') && describe("pt", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { logger } = require('log-instance');
    const {
        ScApi,
    } = require('suttacentral-api');
    const {
        AbstractTTS,
        Polly,
        SCAudio,
        SoundStore,
        SuttaFactory,
        Voice,
        VoiceFactory,
        Words,
    } = require('../index');
    const ELLIPSIS = "\u2026";
    const ELLIPSIS_BREAK = '<break time="1.000s"/>';
    const BREAK = `<break time="0.001s"/>`;
    const tmp = require('tmp');
    this.timeout(10*1000);

    function phoneme(ph,word) {
        var ph = `<phoneme alphabet="ipa" ph="${ph}">${word}</phoneme>${BREAK}`;
        return ph;
    }

    it("loadSutta() loads an10.2/pt/beisert", async()=>{
        var scApi = await new ScApi().initialize();
        var factory = await new SuttaFactory({
            scApi,
        }).initialize();
        var sutta = await factory.loadSutta({
            scid: 'an10.2',
            language: 'pt',
        });
        var sections = sutta.sections;
        should.deepEqual(sections[0].segments[1], {
            scid: 'an10.2:0.2',
            pli: 'Cetanākaraṇīyasutta',
            pt: 'Intenção Correta',
        });
    });
    it("createVoice(voiceName) returns a default voice", function() {
        var voice = Voice.createVoice('ricardo');
        should(voice).instanceOf(Voice);
        should(voice.locale).equal("pt-BR");
        should(voice.name).equal("Ricardo");
        should(voice.usage).equal("recite");
        should(voice.localeIPA).equal('pli');
        should(voice.stripNumbers).equal(false);
        should(voice.stripQuotes).equal(false);
        should(voice.altTts).equal(undefined);
    });
    it("wordSSML(word) Ricardo SSML text for word", function() {
        var voice = Voice.createVoice('ricardo').services.recite;
        var ssml = voice.wordSSML('o');
        should(ssml).match(/ph="o"/);
        var ssml = voice.wordSSML('arahant');
        should(ssml).match(/ph="'a.ɾa.han.t͡ʃ"/);
        var ssml = voice.wordSSML('êxtase');
        should(ssml).match(/ph="'es.sta.se"/);
    });
})
