<template>
  <v-dialog persistent v-model="visible"
    max-width="38em" dark class="scv-player-section">
    <v-card>
      <audio ref="refIntroSound" preload=auto v-if="introAudioUrl">
        <source type="audio/mp3" :src="introAudioUrl" />
        <p>{{$vuetify.lang.t('$vuetify.scv.noHTML5')}}</p>
      </audio>
      <v-card-text >
        <div class="subheading pl-2 pb-2 text-center">{{title}}</div>
        <div class="scv-player-nav">
          <v-btn icon class="scv-icon-btn" small
            style="border-color: #424242"
            ref="refPrevious"
            aria-label='Previous Section'
            @click="playTrack(iTrack-1)"
            @keydown.prevent="keydownPrevious($event)"
            :style='cssProps()'
            ><v-icon>fast_rewind</v-icon></v-btn>
          <div class="scv-timelapse">
            {{trackOfSection}}
            &nbsp;
            ({{timeRemaining}})
          </div>
          <v-btn icon class="scv-icon-btn" small
            style="border-color: #424242"
            ref="refNext"
            aria-label='Next Section'
            @click="playTrack(iTrack+1)"
            :style='cssProps()'
            ><v-icon>fast_forward</v-icon></v-btn>
        </div>
        <div class="body-2 mt-1 text-center"> 
          {{section && section.title || "(n/a)"}} 
        </div>
        <v-slider thumb-label v-model="iSegment"
          ref="refSlider"
          v-if="refAudioPali || refAudioLang"
          :disabled="loading || !paused"
          always-dirty
          class="pl-4 pr-4"
          :label="sliderThumbLabel"
          inverse-label
          height="16"
          :max="section && section.segments.length-1 || 0"
        />
        <div v-if="showPali" :class="paliTextClass" :style="cssProps()">
          <div >{{paliText}}</div>
        </div>
        <div v-if="showTrans" :class="langTextClass" :style="cssProps()">
          <div >{{langText}}</div>
        </div>
      </v-card-text>
      <v-card-actions class="ml-3 mr-3 pb-3">
        <v-btn icon @click="clickPlayPause()" 
          ref="refPlay"
          class="scv-icon-btn" :style="cssProps()" small
          style="border-color: #424242"
          :aria-label="$vuetify.lang.t('$vuetify.scv.ariaPlay')"
          >
          <v-icon v-if="loading">hourglass_empty</v-icon>
          <v-icon v-if="!loading && paused">play_arrow</v-icon>
          <v-icon v-if="!loading && !paused">pause</v-icon>
        </v-btn>
        <v-spacer/>
        <div class="scv-player-scid">
          <div class="grey--text overline">SuttaCentral</div>
          <div>{{scid}}</div>
        </div>
        <v-spacer/>
        <v-btn icon class="scv-icon-btn" small
          style="border-color: #424242"
          ref="refClose"
          :style='cssProps()'
          :aria-label="$vuetify.lang.t('$vuetify.scv.ariaClose')"
          @keydown.prevent="keydownClose($event)"
          @click="close()">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-actions>
      <audio ref="refAudioPali">
        <source type="audio/mp3" :src="audioSrc('pli')"/>
        <p>{{$vuetify.lang.t('$vuetify.scv.noHTML5')}}</p>
      </audio>
      <audio ref="refAudioLang">
        <source type="audio/mp3" :src="audioSrc(language)"/>
        <p>{{$vuetify.lang.t('$vuetify.scv.noHTML5')}}</p>
      </audio>
      <audio ref="refProgressAudio">
        <source type="audio/mp3" :src="progressSrc()"/>
        <p>{{$vuetify.lang.t('$vuetify.scv.noHTML5')}}</p>
      </audio>
    </v-card>
  </v-dialog>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";

export default {
    name: 'scv-player',
    props: {
        tracks: Array,
        time: null,
        voice: Object,
        closeFocus: Function,
    },
    data: function() {
        return {
            section: null,
            iSegment: 0,
            iTrack: 0,
            visible: false,
            progressTimer: null,
            paused: true,
            loadingAudio: 0,
            paliTextClass: "",
            langTextClass: "",
            refAudioPali: null,
            refAudioLang: null,
            stats: {},
        };
    },
    methods: {
        playTrack(iTrack, paused=false) {
            paused = paused || this.pauseAudio();
            if (iTrack < 0 || this.section && this.tracks.length <= iTrack) {
                var msg = `playTrack(${iTrack}) ignored `+
                    `iTrack:${iTrack} tracks:${this.tracks.length}`;
                this.playStartEndSound(msg);
                return Promise.reject(new Error(msg));
            }
            this.iTrack = iTrack;
            Vue.set(this.stats, "tracks", iTrack+1);
            this.iSegment = 0;
            console.log(`ScvPlayer.playTrack(`,
                `${iTrack} of ${this.tracks.length})`,
                '');
            this.visible = true;
            this.section = null;
            this.progressTimer = setTimeout(() => {
                this.progressTime = null;
                var progressAudio = this.$refs.refProgressAudio;
                progressAudio.play();
            }, 1000);

            var trackRef = this.trackRef();
            var url = this.url(`play/section/${trackRef}`);
            //console.log(`playTrack() url:`, url);
            var promise = this.$http.get(url);
            promise.then(res => {
                this.stopProgress();
                this.section = res.data;
                this.$nextTick(() => {
                    var playBtn = this.$refs.refPlay.$el;
                    playBtn.focus();
                    if (paused) {
                        this.clickPlayPause();
                    }
                });
            }).catch(e => {
                this.stopProgress();
                console.error(e.stack);
            });
            return promise;
        },
        track(iTrack=this.iTrack) {
            return this.tracks[iTrack];
        },
        trackRef(iTrack=this.iTrack) {
            var track = this.track(iTrack);
            return [
                track.sutta_uid,
                track.language,
                track.translator,
                track.iSection,
                this.gscv.vnameTrans,
                this.gscv.vnameRoot,
            ].join('/');
        },
        url(path) {
          var origin = window.location.origin;
          return origin.endsWith(':8080') 
            ? `${origin.substring(0, origin.length-5)}:3000/scv/${path}` 
            : `./${path}`;
        },
        stopProgress() {
            var progressAudio = this.$refs.refProgressAudio;
            if (progressAudio) {
                if (this.progressTimer) {
                    clearTimeout(this.progressTimer);
                    this.progressTimer = null;
                }
                progressAudio.pause();
                progressAudio.load();
            }
        },
        close() {
            var introAudio = this.$refs[`refIntroSound`];
            introAudio && !introAudio.paused && introAudio.pause();
            this.pauseAudio();
            this.stopProgress();
            this.visible = false;
        },
        cssProps(opts) {
            return Object.assign({}, {
                '--success-color': this.$vuetify.theme.success,
            }, opts);
        },
        segmentStats(segment) {
            var {
                showPali,
                showTrans,
                language,
                stats,
            } = this;
            stats.segments = stats.segments+1;
            if (showTrans && segment[language]) {
                Vue.set(stats.text, language,
                    (stats.text[language] || 0) + segment[language].length);
            }
            if (showPali && segment.pli) {
                Vue.set(stats.text, 'pli',
                    (stats.text.pli || 0) + segment.pli.length);
            }
        },
        onEndLang(event) { // eslint-disable-line no-unused-vars
            var {
                paused,
                iSegment,
                tracks,
                section,
                iTrack,
            } = this;
            this.setTextClass();
            if (!paused && iSegment < section.segments.length-1) {
                this.paused = true;
                this.iSegment = iSegment+1;
                this.$nextTick(() => {
                    this.toggleAudio();
                });
            } else if (!paused && iTrack+1 < tracks.length) {
                this.paused = true;
                const NEW_SECTION_PAUSE = 1000;
                setTimeout(() => {
                    this.playTrack(iTrack+1, true);
                }, NEW_SECTION_PAUSE);
            } else {
                this.paused = true;
                //var evt = JSON.stringify(event);
                this.playStartEndSound('onEndLang');
            }
            Vue.set(this.stats, "elapsed", Date.now() - this.stats.startTime);
        },
        onEndPali(event) {
            this.segmentStats(this.segment);
            var playLang = this.showTrans && this.segment.audio[this.language];
            if (playLang) {
                var refAudioLang = this.$refs.refAudioLang;
                refAudioLang.play().then(() => {
                    this.setTextClass();
                    this.loadingAudio = 0;
                    //console.log(`onEndPali() refAudioLang playing started`);
                }).catch(e => {
                    this.paused = true;
                    this.loadingAudio = 0;
                    console.log(`onEndPali(${!!event}) refAudioLang playing failed`, e.stack);
                });
            } else {
                this.onEndLang();
            }
            Vue.set(this.stats, "elapsed", Date.now() - this.stats.startTime);
        },
        pauseAudio() {
            var refAudioPali = this.$refs.refAudioPali;
            var refAudioLang = this.$refs.refAudioLang;
            var result = true;
            if (!this.paused) { // playing
                this.paused = true;
                !refAudioPali.paused && refAudioPali.pause();
                !refAudioLang.paused && refAudioLang.pause();
            } else {
                result = false;
            }
            this.setTextClass();
            return result;
        },
        getSegmentAudio(scid) {
            var that = this;
            return new Promise((resolve, reject) => { try {
                var segmentRef = [
                    this.sutta_uid,
                    this.language,
                    this.translator,
                    scid,
                    this.gscv.vnameTrans,
                    this.gscv.vnameRoot,
                ].join('/');
                var url = that.url(`play/segment/${segmentRef}`);
                that.$http.get(url).then(res => {
                    that.stopProgress();
                    resolve(res.data);
                }).catch(e => {
                    that.stopProgress();
                    console.error(e.stack);
                    reject(e);
                });
            } catch(e) {reject(e);} });
        },
        playStartEndSound(label) {
            var that = this;
            return new Promise((resolve, reject) => { try {
                var introAudio = that.$refs[`refIntroSound`];
                if (introAudio) {
                    var onEndIntro = () => {
                        onEndIntro && introAudio.removeEventListener("ended", onEndIntro);
                        onEndIntro = null;
                        resolve(that.paused);
                    }
                    introAudio.addEventListener("ended", onEndIntro);
                    var ips = that.ipsChoices[that.gscv.ips];
                    console.log(`playStartEndSound(${label}) introAudio:${ips.label}`);
                    introAudio.volume = ips.volume;
                    introAudio.load();
                    introAudio.play();
                } else {
                    resolve(false);
                }
                console.log(`stats ${that.paused}`, JSON.stringify(this.stats));
            } catch(e) {reject(e);} });
        },
        launch(iTrack) {
            var that = this;
            that.playStartEndSound('launch').then((play) => {
                var stats = {
                    sutta_uid: this.sutta_uid,
                    tracks: 0,
                    clicks: 0,
                    segments: 0,
                    text: {},
                };
                stats.startTime = new Date();
                that.showTrans && (stats.text[that.language] = 0);
                that.showPali && (stats.text.pali = 0);
                stats.vnameTrans = that.gscv.vnameTrans;
                stats.vnameRoot = that.gscv.vnameRoot;
                that.stats = stats;
                play && that.clickPlayPause();
            });
            var introAudio = that.$refs[`refIntroSound`];
            that.playTrack(iTrack).then(() => { try {
                if (!introAudio) {
                    that.paused && that.clickPlayPause();
                }
            } catch (e) {
                console.error(e.stack);
            }});
        },
        clickPlayPause() {
            console.log(`clickPlayPause() ${this.paused ? "play" : "pause"}`);
            var introAudio = this.$refs[`refIntroSound`];
            introAudio && !introAudio.paused && introAudio.pause();
            Vue.set(this.stats, "clicks", this.stats.clicks+1);
            this.toggleAudio();
            var refPlay = this.$refs.refPlay.$el;
            refPlay.focus();
        },
        toggleAudio() {
            var that = this;
            (async function() {
                var refAudioPali = that.$refs.refAudioPali;
                var refAudioLang = that.$refs.refAudioLang;
                if (that.pauseAudio()) {
                    console.log("toggleAudio() paused");
                    return;
                }
                that.loadingAudio = 0;
                var lang = that.language;
                var segment = that.segment;
                if (segment.audio[lang] == null && segment.audio.pli == null) {
                    var data = await that.getSegmentAudio(segment.scid);
                    segment.audio = data.segment.audio;
                }
                var playPali = that.showPali && segment.audio.pli;
                if (playPali) {
                    refAudioPali.load();
                    that.loadingAudio++;
                }
                var playLang = that.showTrans && segment.audio[lang];
                if (playLang) {
                    refAudioLang.load();
                    that.loadingAudio++;
                }
                that.paused = false;
                if (playPali) {
                    refAudioPali.play().then(() => {
                        that.setTextClass();
                        that.loadingAudio = 0;
                    }).catch(e => {
                        that.paused = true;
                        that.loadingAudio = 0;
                        console.log(`refAudioPali playing failed`, e);
                    });
                } else {
                    that.onEndPali();
                }
            })();
        },
        setTextClass() {
            var refAudioPali = this.$refs.refAudioPali;
            this.paliTextClass = refAudioPali == null || refAudioPali.paused 
                ? "scv-player-text scv-player-text-top"
                : "scv-player-text scv-player-text-playing scv-player-text-top";
            //console.log(`paliTextClass ${this.paliTextClass}`);
            var refAudioLang = this.$refs.refAudioLang;
            this.langTextClass = refAudioLang == null || refAudioLang.paused 
                ? "scv-player-text"
                : "scv-player-text scv-player-text-playing";
            //console.log(`langTextClass ${this.langTextClass}`);
        },
        audioSrc(lang) {
            var {
                sutta_uid,
                translator,
            } = this;
            var segment = this.section && this.section.segments[this.iSegment];
            var audio = segment && segment.audio || {};
            var vname = lang === 'pli' 
                ? audio && audio.vnamePali || this.gscv.vnameRoot 
                : audio && audio.vnameTrans || this.voice.name;
            var guid = segment && segment.audio[lang];
            var url = guid 
                ? this.url(`audio/${sutta_uid}/${lang}/${translator}/${vname}/${guid}`)
                : '';
            //console.log(`audioSrc`, url);
            return url;
        },
        progressSrc() {
            switch (Number(this.gscv.ips)) {
                case 0: return "";
                case 1: return "./audio/rainforest-ambience-glory-sunz-public-domain.mp3";
                case 2: return "./audio/indian-bell-flemur-sampling-plus-1.0.mp3";
                default: return "./audio/tibetan-singing-bowl-horst-cc0.mp3";
            }
        },
        keydownPrevious(evt) {
            if (evt.key === 'Tab') {
                var elt = evt.shiftKey 
                    ? this.$refs.refClose.$el
                    : this.$refs.refNext.$el;
                elt && elt.focus();
            } else if (evt.key === ' ') {
                if (this.iTrack > 0) {
                    this.playTrack(this.iTrack - 1);
                }
            }
        },
        keydownClose(evt) {
            if (evt.key === 'Tab') {
                var elt = evt.shiftKey 
                    ? this.$refs.refPlay.$el
                    : this.$refs.refPrevious.$el;
                elt && elt.focus();
            } else if (evt.key === ' ') {
                this.close();
                var closeFocus = this.closeFocus && this.closeFocus();
                if (closeFocus) {
                    closeFocus.focus();
                }
            }
        },
    },
    computed: {
        trackOfSection() {
            var {
                iTrack,
                section,
                tracks,
                $vuetify,
            } = this;
            var tmplt = $vuetify.lang.t('$vuetify.scv.trackOfSection');
            var text = '--';
            if (section && tracks.length) {
                text = tmplt
                    .replace(/A_TRACK/, iTrack+1)
                    .replace(/A_TRACKS/, tracks.length);
            }
            return text;
        },
        title() {
            return this.track().title;
        },
        language() {
            return this.track().language;
        },
        translator() {
            return this.track().translator;
        },
        sutta_uid() {
            return this.track().sutta_uid;
        },
        loading() {
            return this.section == null ||
                this.segment == null ||
                !!this.loadingAudio;
        },
        segment() {
            var {
                iSegment,
                section,
            } = this;
            return section && section.segments[iSegment];
        },
        gscv() {
            return this.$root.$data;
        },
        showPali( ){
            return this.gscv && this.gscv.showPali;
        },
        showTrans( ){
            return this.gscv && this.gscv.showTrans;
        },
        paliText() {
            return this.segment && this.segment.pli || 
                this.loading && 
                    this.$vuetify.lang.t('$vuetify.auth.loading') ||
                "(...)";
        },
        langText(){
            var {
              language,
              segment,
              loading,
              $vuetify,
            } = this;
            return segment && segment[language] ||
                loading && $vuetify.lang.t('$vuetify.auth.loading') || 
                ' ';
        },
        segmentsElapsed(){
            var {
                iSegment,
            } = this;
            return this.tracks && this.tracks.reduce((acc, track, i) => {
                if (this.iTrack < i) {
                    return acc;
                }
                if (i < this.iTrack) {
                    return acc + track.nSegments;
                }
                return acc + iSegment + 1;
            }, 0) || 0;
        },
        segmentsTotal(){
            return this.tracks && this.tracks.reduce((acc, track) => {
                return acc + track.nSegments;
            }, 0) || 0;
        },
        timeRemaining(){
            var {
                gscv,
                tracks,
                iTrack,
                iSegment,
                time,
            } = this;
            var tr =  gscv && tracks &&
                gscv.timeRemaining(tracks, iTrack, iSegment, time);
            return tr && tr.display || '--';
        },
        ipsChoices() {
            return this.gscv.ipsChoices;
        },
        scid() {
            return this.segment && this.segment.scid;
        },
        introAudioUrl() {
            var ips = this.ipsChoices[this.gscv.ips];
            return ips && ips.url;
        },
        sliderThumbLabel() {
          var curSeg = this.iSegment+1;
          var nSegs = this.section && this.section.segments.length;

          return [
            `${curSeg}/`,
            `${nSegs || '--'}`,
          ].join('');
        },
    },
    beforeUpdate() {
        var refAudioPali = this.$refs.refAudioPali;
        if (refAudioPali && this.refAudioPali !== refAudioPali) {
            this.refAudioPali = refAudioPali;
            refAudioPali.addEventListener("ended", this.onEndPali);
        }
        var refAudioLang = this.$refs.refAudioLang;
        if (refAudioLang && this.refAudioLang !== refAudioLang) {
            this.refAudioLang = refAudioLang;
            refAudioLang.addEventListener("ended", this.onEndLang);
        }
    },
    updated() {
    },
    mounted() {
        this.setTextClass();
    },
}
</script>
<style scoped>
.scv-player {
    position: relative;
    display: flex;
    flex-flow: column;
    align-items: center;
}
.scv-player-section {
}
.scv-player-text {
    margin: 0.2em;
    margin-left: 0.6em;
    margin-right: 0.6em;
    min-height: 10em;
}
.scv-player-text-playing {
    color: #82B1FF;
}
.scv-player-scid {
    text-transform: uppercase;
    text-align: center;
    line-height: 1em;
}
.scv-player-text-top {
    display: flex;
    flex-flow: row wrap;
    align-items: flex-end;
    padding-bottom: 0.5em;
    border-bottom: 1pt dotted #666;
}
.scv-player-nav {
    display: flex;
    justify-content: space-between;
    margin-left: 0.5em;
    margin-right: 0.5em;
    align-items: center;
}
.scv-player-actions {
    display: flex;
    margin-left: 1.5em;
    margin-right: 1.5em;
    padding-bottom: 1em;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
}
.scv-timelapse {
    display: flex;
    align-items: center;
}
</style>
