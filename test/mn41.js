(typeof describe === 'function') && describe("mn41", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { logger } = require('rest-bundle');
    const {
        Section,
        Sutta,
        SuttaFactory,
        SuttaCentralId,
        Voice,
        Words,
    } = require("../index");
    const SC = path.join(__dirname, '../local/sc');

    it("parseSutta(sutta) parses mn41 structure", function(done) {
        (async function() { try {
            var segments = [{ // section[0]
                scid:'mn41:0.1',
                en:'y1 y2.',
            },{ // section[1].segments[0]
                scid:'mn41:15.1',
                en:'a1 a2:',
            },{ // section[1]: template 0
                scid:'mn41:15.2',
                en:'b1 b2 v0aaaaaa v0b!',
            },{ 
                scid:'mn41:15.3',
                en:'c1 c2.',
            },{ 
                scid:'mn41:15.4',
                en:'d1 d2?',
            },{ // section[1]; template 3
                scid:'mn41:16-17.1',
                en:'a1 a2:',
            },{
                scid:'mn41:16-17.2',
                en:`b1 b2 v0aaaaaa v1b ${Words.U_ELLIPSIS}`,
            },{
                scid:'mn41:16-17.3',
                en:`v0aaaaaa v2b ${Words.U_ELLIPSIS}`,
            },{ 
                scid:'mn41:16-17.4',
                en:'',
            },{ 
                scid:'mn41:18-42.2',
                en:`v3a v3b ${Words.U_ELLIPSIS}`,
            },{  // section[1].segments[9]
                scid:'mn41:18-42.7',
                en:`v4 ${Words.U_ELLIPSIS}`,
            },{
                scid:'mn41:18-42.38',
                en:`z1 z2.`,
            },{ 
                scid:'mn41:18-42.39',
                en:`z3 z4.`,
            },{  // section 2
                scid:'mn41:43.1',
                en:`z3 z4.`,
            }];

            var sutta = new Sutta({
                sutta_uid: 'mn1',
                segments,
            });
            var parsedSutta = new SuttaFactory().parseSutta(sutta);
            var sections = parsedSutta.sections;
            should(sections.length).equal(3);
            should.deepEqual(sections.map(section => section.expandable), [
                false, true, false,
            ]);
            should.deepEqual(sections[1].values, [
                'v0aaaaaa v0b',
                'v0aaaaaa v1b',
                'v0aaaaaa v2b',
                'v3a v3b',
                'v4',
            ]);
            should.deepEqual(parsedSutta.sutta_uid, 'mn1');
            should.deepEqual(parsedSutta.sections[0].segments, segments.slice(0,1));
            should.deepEqual(parsedSutta.sections[1].segments, segments.slice(1,13));
            should.deepEqual(parsedSutta.sections[2].segments, segments.slice(13,14));
            should(parsedSutta.sections.length).equal(3);
            should.deepEqual(parsedSutta.sections[1].template, segments.slice(2,6));
            should(sections[1].prefix).equal('b1 b2 ');

            // fully parsed
            var sectSegs = sections.reduce((acc,section) => {
                section.segments.forEach(seg => acc.push(seg));
                return acc;
            }, []);
            should.deepEqual(sectSegs, sutta.segments);

            done();
        } catch(e) { done(e); } })();
    });
    it("parseSutta(sutta) parses mn41", function(done) {
        (async function() { try {
            var sutta = await SuttaFactory.loadSutta('mn41');
            should(sutta.segments[0].scid).equal('mn41:0.1');
            var sutta2 = new SuttaFactory().parseSutta(sutta);
            should(sutta2).instanceOf(Sutta);
            var sections = sutta2.sections;
            should(sections.length).equal(4);
            should.deepEqual(sections.map(section => section.expandable), [
                false, false, true, false,
            ]);
            should.deepEqual(sections[2].values.slice(0,4), [
                'well-to-do aristocrats',
                'well-to-do brahmins',
                'well-to-do householders',
                'the Gods of the Four Great Kings',
            ]);
            should.deepEqual(sections.map(section => section.segments.length), [
                2, 58, 56, 6,
            ]);
            var sectSegs = sections.reduce((acc,section) => {
                section.segments.forEach(seg => acc.push(seg));
                return acc;
            }, []);
            should.deepEqual(sectSegs, sutta.segments);

            done();
        } catch(e) { done(e); } })();
    });
    it("expandSutta(sutta) expands mn41", function(done) {
    //done();return;//TODO
        this.timeout(10*1000); // takes 2 seconds if cache is empty
        /*
         * This is real-world system test that exercises and requires:
         * 1) AWS Polly
         * 2) Internet connection
         * 3) MN41
         * 4) The local sound cache
         * 5) >5MB of local disk for sound storage
         */
        (async function() { try {
            var sutta = await SuttaFactory.loadSutta('mn41');
            var factory = new SuttaFactory();
            var expandedSutta = factory.expandSutta(sutta);
            var voice = Voice.createVoice({
                name: "amy",
                localeIPA: "pli",
            });
            var sections = expandedSutta.sections;
            should(sections.length).equal(4);
            var lines = Sutta.textOfSegments(sections[2].segments);
            var text = `${lines.join('\n')}\n`;
            var result = await voice.speak(text, {
                cache: true, // false: use TTS web service for every request
                usage: "recite",
            });
            logger.info(`mn41 sound guid:${result.signature.guid}`);
            should(result.signature.files.length).equal(228);

            done();
        } catch(e) { done(e); } })();
    });
});

