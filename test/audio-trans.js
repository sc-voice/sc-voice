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
    const COVER_PATH = path.join(__dirname, '../public/img/wheel100.png');

    it("default ctor", () => {
        var at = new AudioTrans();
        should(fs.existsSync(COVER_PATH)).equal(true);
        should(at).properties({
            album: undefined,
            album_artist: undefined,
            audioSuffix: '.ogg',
            artist: undefined,
            comment: '',
            composer: undefined,
            copyright: undefined,
            coverPath: undefined,
            cwd: undefined,
            date: undefined,
            genre: undefined,
            languages: undefined,
            publisher: undefined,
            title: undefined,
            version: undefined,
        });
    });
    it("custom ctor", function() {
        let album = 'test-album';
        let album_artist = 'test-album-artist';
        let audioSuffix = 'test-audioSuffix';
        let artist = 'test-artist';
        let cwd = 'test-cwd';
        let comment = 'test-comment';
        let composer = 'test-composer';
        let copyright = 'test-copyright';
        let date = 'test-date';
        let genre = 'test-genre';
        let languages = 'test-languages';
        let publisher = 'test-publisher';
        let title = 'test-title';
        let version = 'test-version';
        let at = new AudioTrans({
            album,
            album_artist,
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
            album_artist,
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
    it("concatAudio(files) returns MP3 file", async()=>{
        var tmpPath = tmp.tmpNameSync();
        var guid = path.basename(tmpPath);
        var cwd = path.dirname(tmpPath);
        var audioSuffix = '.mp3';
        let languages = 'test-languages';
        var outpath = path.join(cwd, `${guid}${audioSuffix}`);
        var inpath = path.join(cwd, `${guid}.txt`);
        let coverPath = COVER_PATH;
        fs.writeFileSync(inpath, MP3_FILES.map(f=>`file '${f}'`).join('\n'));

        let publisher = 'test-publisher';
        var at = new AudioTrans({ 
            cwd, 
            genre: 'Dhamma', 
            audioSuffix, 
            coverPath,
            publisher,
        });
        0 && (at.logLevel = 'debug');
        let composer = 'test-composer';
        let album_artist = 'test-album-artist';
        var title = "test_title";
        var artist = "test_artist";
        var comment = "test_comment";
        var album = "test_album";
        let copyright = 'test_copyright';
        var date = "test_date";
        await at.concat({ 
            date,
            album,
            album_artist,
            artist,
            comment,
            composer,
            copyright,
            inpath,
            languages,
            outpath,
            title,
            version: guid,
        });

        let cmd = `ffprobe -hide_banner ${outpath}`;
        let {stderr: probeOut} = await execPromise(cmd);
        should(probeOut).match(/title\s*:\s*test_title/msiu);
        should(probeOut).match(/\bartist\s*:\s*test_artist/msiu);
        should(probeOut).match(/album\s*:\s*test_album/msiu);
        should(probeOut).match(/album_artist\s*:\s*test-album-artist/msiu);
        should(probeOut).match(/comment\s*:\s*test_comment/msiu);
        should(probeOut).match(new RegExp(`date\\s*:\\s*${date}`, `msiu`));
        should(probeOut).match(new RegExp(`composer\\s*:\\s*${composer}`, `msiu`));
        should(probeOut).match(new RegExp(`publisher\\s*:\\s*${publisher}`, `msiu`));
        should(probeOut).match(new RegExp(`version\\s*:\\s*${guid}`, `msiu`));
        should(probeOut).match(new RegExp(`languages\\s*:\\s*${languages}`, `msiu`));
        should(probeOut).match(/genre\s*:\s*Dhamma/msiu);
    });
    it("concatAudio(files) returns Opus file", async()=>{
        let tmpPath = tmp.tmpNameSync();
        let guid = path.basename(tmpPath);
        let version = guid;
        let cwd = path.dirname(tmpPath);
        let audioSuffix = '.ogg';
        let outpath = path.join(cwd, `${guid}${audioSuffix}`);
        let inpath = path.join(cwd, `${guid}.txt`);
        let coverPath = COVER_PATH;
        let copyright = 'test_copyright';
        let publisher = 'test-publisher';
        let composer = 'test-composer';
        fs.writeFileSync(inpath, MP3_FILES.map(f=>`file '${f}'`).join('\n'));

        let title = "test_title";
        let artist = "test_artist";
        let album_artist = "test_album_artist";
        let comment = "test_comment";
        let album = "test_album";
        let date = "test_date";
        let at = new AudioTrans({ cwd, genre: 'Dhamma', audioSuffix, coverPath });
        0 && (at.logLevel = 'debug');
        await at.concat({ 
            title,
            date,
            album,
            artist,
            album_artist,
            comment,
            copyright,
            inpath,
            outpath,
            publisher,
            composer,
            version,
        });

        let cmd = `ffprobe -hide_banner ${outpath}`;
        let {stderr: probeOut} = await execPromise(cmd);
        should(probeOut).match(/title\s*:\s*test_title/msiu);
        should(probeOut).match(/\bartist\s*:\s*test_artist/msiu);
        should(probeOut).match(/album\s*:\s*test_album/msiu);
        should(probeOut).match(/album_artist\s*:\s*test_album_artist/msiu);
        should(probeOut).match(/comment\s*:\s*test_comment/msiu);
        should(probeOut).match(new RegExp(`version\\s*:\\s*${version}`,'msiu'));
        should(probeOut).match(new RegExp(`publisher\\s*:\\s*${publisher}`,'msiu'));
        should(probeOut).match(new RegExp(`composer\\s*:\\s*${composer}`,'msiu'));
        should(probeOut).match(new RegExp(`date\\s*:\\s*${date}`, `msiu`));
        should(probeOut).match(/genre\s*:\s*Dhamma/msiu);
        should(probeOut).match(/comment\s*:\s*Cover/msiu);
    });
})
