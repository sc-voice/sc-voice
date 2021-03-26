(typeof describe === 'function') && describe("jpn", function() {
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
    const { English } = require('scv-bilara');
    const ELLIPSIS = "\u2026";
    const ELLIPSIS_BREAK = '<break time="1.000s"/>';
    const BREAK = `<break time="0.001s"/>`;
    const tmp = require('tmp');
    this.timeout(10*1000);

    function phoneme(ph,word) {
        var ph = `<phoneme alphabet="ipa" ph="${ph}">${word}</phoneme>${BREAK}`;
        return ph;
    }

    it("Takumi speaks", async()=>{
        var voice = Voice.createVoice({
            name: "Takumi",
        });
        should(voice.name).equal("Takumi");
        should(voice.locale).equal('ja-JP');
        var recite = voice.services.recite;
        await English.wordSet(); // await words.fwsEn
        let text = '「托鉢僧侶たちよ、これら四つの事は誰も保証出来ません。';
        let ssml = recite.segmentSSML(text);
        //console.log('dbg', {ssml});
        should.deepEqual(ssml, [
            '「托鉢僧侶たちよ、 これら四つの事は誰も保証出来ません。',
        ]);
    });
})
