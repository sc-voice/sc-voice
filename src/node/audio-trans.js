(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const { logger } = require('log-instance');
    const MAXBUFFER = 4 * 1024 * 1024;
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);  

    class AudioTrans {
        constructor(opts={}) {
            (opts.logger || logger).logInstance(this, opts);

            this.album = opts.album;
            this.album_artist = opts.album_artist;
            this.audioSuffix = opts.audioSuffix || '.ogg';
            this.artist = opts.artist;
            this.bitrate = opts.bitrate;
            this.comment = opts.comment || '';
            this.copyright = opts.copyright;
            this.composer = opts.composer;
            this.coverPath = opts.coverPath;
            this.date = opts.date;
            this.cwd = opts.cwd;
            this.genre = opts.genre;
            this.languages = opts.languages;
            this.publisher = opts.publisher;
            this.title = opts.title;
            this.version = opts.version;
        }

        async concat(opts = {}) { try {
            var args = Object.assign({}, this, opts);
            var audioSuffix = args.audioSuffix;
            args.date = args.date || new Date().toISOString().split('T')[0];
            return audioSuffix === '.ogg' || audioSuffix === '.opus'
                ? this.concatOpus(args)
                : this.concatMP3(args);
        } catch (e) {
            this.warn(`concat()`, JSON.stringify(args), e.message);
            throw e;
        }}

        async concatMP3(opts={}) { try {
            let {
                album,
                album_artist,
                artist,
                comment,
                composer,
                copyright,
                cwd,
                date,
                genre,
                inpath,
                languages,
                outpath,
                publisher,
                title,
                version,
                coverPath, // TODO
            } = opts;

            var bashCmd = [
                `ffmpeg -y`,
                `-f concat -safe 0`,
                `-i ${inpath}`,
            ];
            album && bashCmd.push(`-metadata album="${album}"`);
            album_artist && bashCmd.push( `-metadata album_artist="${album_artist}"`);
            artist && bashCmd.push( `-metadata artist="${artist}"`);
            comment && bashCmd.push(`-metadata comment="${comment}"`);
            composer && bashCmd.push(`-metadata composer="${composer}"`);
            copyright && bashCmd.push(`-metadata copyright="${copyright}"`);
            date && bashCmd.push(`-metadata date="${date}"`);
            genre && bashCmd.push(`-metadata genre="${genre}"`);
            publisher && bashCmd.push(`-metadata publisher="${publisher}"`);
            version && bashCmd.push(`-metadata version="${version}"`);
            languages && bashCmd.push(`-metadata languages="${languages}"`);
            title && bashCmd.push(`-metadata title="${title}"`);

            bashCmd.push(`-c copy ${outpath}`);
            var cmd = `bash -c '${bashCmd.join(' ')}'`;
            this.debug(`concatMP3()`, cmd);
            var execOpts = {
                cwd,
                maxBuffer: MAXBUFFER,
            };
            var {stdout,stderr} = await execPromise(cmd, execOpts);
            var stats = fs.existsSync(outpath) && await fs.promises.stat(outpath);
            if (stats && stats.size <= this.ERROR_SIZE) {
                var err = await fs.readFile(outpath).toString();
                this.warn(`concatMP3() failed ${outpath}`, stats.size, err);
                throw new Error(err);
            } 
        } catch (e) {
            this.warn(`concatMP3()`, JSON.stringify(opts), e.message);
            throw e;
        }}

        async concatOpus(opts = {}) { try {
            let {
                album,
                album_artist,
                artist,
                bitrate = 16,
                cwd,
                comment,
                composer,
                copyright,
                coverPath,
                date,
                genre,
                inpath,
                outpath,
                languages,
                publisher,
                title,
                version,
            } = opts;

            var bashCmd = [
                `ffmpeg -y`,
                `-f concat -safe 0`,
                `-i ${inpath}`,
                '-f wav',
                '-',
                '|',
                'opusenc -',
            ];
            album && bashCmd.push(`--album "${album}"`);
            artist && bashCmd.push( `--artist "${artist}"`);
            album_artist && bashCmd.push( `--comment album_artist="${album_artist}"`);
            version && bashCmd.push(`--comment version=${version}`);
            comment && bashCmd.push(`--comment comment="${comment}"`);
            composer && bashCmd.push(`--comment composer="${composer}"`);
            copyright && bashCmd.push(`--comment copyright="${copyright}"`);
            date && bashCmd.push(`--date "${date}"`);
            genre && bashCmd.push(`--genre "${genre}"`);
            publisher && bashCmd.push(`--comment publisher="${publisher}"`);
            languages && bashCmd.push(`--comment languages="${languages}"`);
            title && bashCmd.push(`--title "${title}"`);
            coverPath && bashCmd.push(`--picture ${coverPath}`);
            bashCmd.push(`--bitrate ${bitrate} ${outpath}`);

            var cmd = `bash -c '${bashCmd.join(' ')}'`;
            this.debug(`concatOpus()`, cmd);
            var execOpts = {
                cwd,
                maxBuffer: MAXBUFFER,
            };
            var {stdout,stderr} = await execPromise(cmd, execOpts);
            var stats = fs.existsSync(outpath) && await fs.promises.stat(outpath);
            if (stats && stats.size <= this.ERROR_SIZE) {
                var err = await fs.readFile(outpath).toString();
                this.warn(`concatOpus() failed ${outpath}`, stats.size, err);
                throw new Error(err);
            } 
        } catch (e) {
            this.warn(`concatOpus()`, JSON.stringify(opts), e.message);
            throw e;
        }}

    }

    module.exports = exports.AudioTrans = AudioTrans;
})(typeof exports === "object" ? exports : (exports = {}));

