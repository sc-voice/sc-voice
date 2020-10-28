(typeof describe === 'function') && describe("audio-trans", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        AudioTrans,
    } = require("../index");
    const tmp = require('tmp');
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    const MP3_FILES = [
        path.join(__dirname, 'data/1d4e09ef9cd91470da56c84c2da481b0.mp3'),
        path.join(__dirname, 'data/0e4a11bcb634a4eb72d2004a74f39728.mp3'),
    ];

    it("TESTTESTdefault ctor", () => {
        var at = new AudioTrans();
        should(fs.existsSync(at.picturePath)).equal(true);
        should(at).properties({
            album: undefined,
            audioSuffix: '.opus',
            artist: undefined,
            comment: '',
            copyright: undefined,
            cwd: undefined,
            date: undefined,
            genre: undefined,
            languages: undefined,
            publisher: undefined,
            title: undefined,
            version: undefined,
        });
    });
    it("TESTTESTcustom ctor", function() {
        let album = 'test-album';
        let audioSuffix = 'test-audioSuffix';
        let artist = 'test-artist';
        let cwd = 'test-cwd';
        let comment = 'test-comment';
        let copyright = 'test-copyright';
        let date = 'test-date';
        let genre = 'test-genre';
        let languages = 'test-languages';
        let publisher = 'test-publisher';
        let title = 'test-title';
        let version = 'test-version';
        let at = new AudioTrans({
            album,
            audioSuffix,
            artist,
            comment,
            copyright,
            cwd,
            date,
            genre,
            languages,
            publisher,
            title,
            version,
        });
        should(at).properties({
            album,
            audioSuffix,
            artist,
            comment,
            copyright,
            cwd,
            date,
            genre,
            languages,
            publisher,
            title,
            version,
        });
    });
    it("TESTTESTconcatAudio(files) returns MP3 file", async()=>{
        var tmpPath = tmp.tmpNameSync();
        var guid = path.basename(tmpPath);
        var cwd = path.dirname(tmpPath);
        var audioSuffix = '.mp3';
        var outpath = path.join(cwd, `${guid}${audioSuffix}`);
        var inpath = path.join(cwd, `${guid}.txt`);
        fs.writeFileSync(inpath, MP3_FILES.map(f=>`file '${f}'`).join('\n'));

        var at = new AudioTrans({
            cwd,
            genre: 'Dhamma',
        });
        var title = "test_concat";
        var artist = "test_artist";
        var comment = "test_comment";
        var album = "test_album";
        var date = "test_date";
        await at.concat({ 
            title,
            date,
            album,
            artist,
            comment,
            inpath,
            outpath,
            version: guid,
            audioSuffix,
        });

        let cmd = `ffprobe -hide_banner ${outpath}`;
        let {stderr: probeOut} = await execPromise(cmd);
        should(probeOut).match(/title\s*:\s*test_concat/msiu);
        should(probeOut).match(/\bartist\s*:\s*test_artist/msiu);
        should(probeOut).match(/album\s*:\s*test_album/msiu);
        should(probeOut).match(/album_artist\s*:\s*test_artist/msiu);
        should(probeOut).match(/comment\s*:\s*test_comment/msiu);
        should(probeOut).match(/comment\s*:\s*version/msiu);
        should(probeOut).match(new RegExp(`date\\s*:\\s*${date}`, `msiu`));
        should(probeOut).match(/genre\s*:\s*Dhamma/msiu);
    });
    it("TESTTESTconcatAudio(files) returns Opus file", async()=>{
        var tmpPath = tmp.tmpNameSync();
        var guid = path.basename(tmpPath);
        var cwd = path.dirname(tmpPath);
        var audioSuffix = '.opus';
        var outpath = path.join(cwd, `${guid}${audioSuffix}`);
        var inpath = path.join(cwd, `${guid}.txt`);
        fs.writeFileSync(inpath, MP3_FILES.map(f=>`file '${f}'`).join('\n'));

        var title = "test_title";
        var artist = "test_artist";
        var comment = "test_comment";
        var album = "test_album";
        var date = "test_date";
        var at = new AudioTrans({ cwd, genre: 'Dhamma', audioSuffix, });
        await at.concat({ 
            title,
            date,
            album,
            artist,
            comment,
            inpath,
            outpath,
            version: guid,
        });

        let cmd = `ffprobe -hide_banner ${outpath}`;
        let {stderr: probeOut} = await execPromise(cmd);
        should(probeOut).match(/title\s*:\s*test_title/msiu);
        should(probeOut).match(/\bartist\s*:\s*test_artist/msiu);
        should(probeOut).match(/album\s*:\s*test_album/msiu);
        should(probeOut).match(/album_artist\s*:\s*test_artist/msiu);
        should(probeOut).match(/comment\s*:\s*test_comment/msiu);
        should(probeOut).match(/comment\s*:\s*version/msiu);
        should(probeOut).match(new RegExp(`date\\s*:\\s*${date}`, `msiu`));
        should(probeOut).match(/genre\s*:\s*Dhamma/msiu);
    });
})
