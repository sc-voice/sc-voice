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
            this.audioSuffix = opts.audioSuffix || '.opus';
            this.artist = opts.artist;
            this.comment = opts.comment || '';
            this.copyright = opts.copyright;
            this.date = opts.date;
            this.cwd = opts.cwd;
            this.genre = opts.genre;
            this.languages = opts.languages;
            this.publisher = opts.publisher;
            this.title = opts.title;
            this.version = opts.version;
            this.picturePath = opts.picturePath ||
                path.join(__dirname, '..', '..', 'public', 'img', 'favicon.png');
        }

        async concat(opts = {}) { try {
            var args = Object.assign({}, this, opts);
            var audioSuffix = args.audioSuffix;
            return audioSuffix === '.opus'
                ? this.concatOpus(args)
                : this.concatMP3(args);
        } catch (e) {
            this.warn(`concat()`, JSON.stringify(args), e.message);
            throw e;
        }}

        async concatMP3(opts={}) { try {
            let {
                album,
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
            } = opts;

            var bashCmd = [
                `ffmpeg -y`,
                `-f concat -safe 0`,
                `-i ${inpath}`,
            ];
            album && bashCmd.push(`-metadata album="${album}"`);
            if (artist) {
                bashCmd.push( `-metadata album_artist="${artist}"`);
                bashCmd.push( `-metadata artist="${artist}"`);
            }
            comment = (comment ? `${comment}\n` : '') + `version: ${version}`;
            comment && bashCmd.push(`-metadata comment="${comment}"`);
            composer && bashCmd.push(`-metadata composer="${composer}"`);
            copyright && bashCmd.push(`-metadata copyright="${copyright}"`);
            date && bashCmd.push(`-metadata date="${date}"`);
            genre && bashCmd.push(`-metadata genre="${genre}"`);
            publisher && bashCmd.push(`-metadata publisher="${publisher}"`);
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
                artist,
                cwd,
                comment,
                composer,
                copyright,
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
            ];
            album && bashCmd.push(`-metadata album="${album}"`);
            if (artist) {
                bashCmd.push( `-metadata album_artist="${artist}"`);
                bashCmd.push( `-metadata artist="${artist}"`);
            }
            comment = (comment ? `${comment}\n` : '') + `version: ${version}`;
            comment && bashCmd.push(`-metadata comment="${comment}"`);
            composer && bashCmd.push(`-metadata composer="${composer}"`);
            copyright && bashCmd.push(`-metadata copyright="${copyright}"`);
            date && bashCmd.push(`-metadata date="${date}"`);
            genre && bashCmd.push(`-metadata genre="${genre}"`);
            publisher && bashCmd.push(`-metadata publisher="${publisher}"`);
            title && bashCmd.push(`-metadata title="${title}"`);

            let bitRate = opts.bitRate || '16k';
            bashCmd.push(`-b:a ${bitRate} ${outpath}`);
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

