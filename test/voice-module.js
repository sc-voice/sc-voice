(typeof describe === 'function') && describe("voice-module", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const tmp = require('tmp');
    const {
        SoundStore,
        Voice,
        VoiceModule,
    } = require('../index');
    var ROOT_PATH = path.join(__dirname, '..', 'local', 'vm');

    it("TESTTESTVoiceModule(opts) is ctor", function() {
        var vm = new VoiceModule();
        should(vm.rootPath).equal(ROOT_PATH);
        should(vm.name).equal("no-name");
        var vmpath = path.join(ROOT_PATH, vm.name);
        should(vm.storePath).equal(vmpath);
    });
    it("TESTTESTinitialize() returns promise", function(done) {
        (async function() { try {
            var tmpDir = tmp.dirSync();
            var vm = new VoiceModule({
                rootPath: tmpDir.name,
            });
            should(vm.rootPath).equal(tmpDir.name);
            var storePath = path.join(tmpDir.name, vm.name);
            should(vm.storePath).equal(storePath);
            should(fs.existsSync(storePath)).equal(false);

            var result = await(vm.initialize());
            should(fs.existsSync(storePath)).equal(true);
            should(vm.soundStore).instanceOf(SoundStore);
            should(vm.soundStore.audioFormat).equal('mp3');
            should(vm.soundStore.storePath).equal(storePath);

            done();
        } catch(e) {done(e);} })();
    });

})
