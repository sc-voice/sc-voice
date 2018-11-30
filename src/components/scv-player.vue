<template>
    <v-dialog persistent v-model="visible"
        max-width="38em" dark class="scv-player-section">
        <v-card>
            <v-card-text >
                <div class="subheading pl-2 pb-2">{{title}}</div>
                <div class="scv-player-nav">
                    <button class="scv-text-button"
                        ref="refPrevious"
                        @click="playTrack(iTrack-1)"
                        @keydown.prevent="keydownPrevious($event)"
                        :style='cssProps({"width":"6em"})'
                        >Previous</button>
                    <div >
                        {{iTrack+1}}/{{section && this.tracks.length || "(n/a)"}} 
                    </div>
                    <button class="scv-text-button"
                        ref="refNext"
                        @click="playTrack(iTrack+1)"
                        :style='cssProps({"width":"6em"})'
                        >Next</button>
                </div>
                <div class="body-2 mt-1 text-xs-center"> 
                    {{section && section.title || "(n/a)"}} 
                </div>
                <v-slider thumb-label v-model="iSegment"
                    ref="refSlider"
                    :disabled="loading || !paused"
                    always-dirty
                    class="pl-4 pr-4"
                    :label="`${iSegment+1}/${section && section.segments.length || '--'}`"
                    inverse-label
                    height="16"
                    :max="section && section.segments.length-1"
                />
                <div v-if="showPali" :class="paliTextClass" :style="cssProps()">
                    <div >{{paliText}}</div>
                </div>
                <div v-if="showTrans" :class="langTextClass" :style="cssProps()">
                    <div >{{langText}}</div>
                </div>
            </v-card-text>
            <v-card-actions class="ml-3 mr-3 pb-3">
                <div style="width:6em">
                    {{segment && segment.scid}}
                </div>
                <v-spacer/>
                <v-btn icon @click="clickPlayPause()" 
                    ref="refPlay"
                    class="scv-icon-btn" :style="cssProps()"
                    aria-label="Play Section">
                    <v-icon v-if="loading">hourglass_empty</v-icon>
                    <v-icon v-if="!loading && paused">play_arrow</v-icon>
                    <v-icon v-if="!loading && !paused">pause</v-icon>
                </v-btn>
                <v-spacer/>
                <button class="scv-text-button"
                    ref="refClose"
                    :style='cssProps({"width":"6em"})'
                    @keydown.prevent="keydownClose($event)"
                    @click="close()">
                    Close
                </button>
            </v-card-actions>
            <audio ref="refAudioPali">
                <source type="audio/mp3" :src="audioSrc('pli')"/>
                <p>Your browser doesn't support HTML5 audio</p>
            </audio>
            <audio ref="refAudioLang">
                <source type="audio/mp3" :src="audioSrc(language)"/>
                <p>Your browser doesn't support HTML5 audio</p>
            </audio>
            <audio ref="refProgressAudio">
                <source type="audio/mp3" :src="progressSrc()"/>
                <p>Your browser doesn't support HTML5 audio</p>
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
        voice: Object,
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
        };
    },
    methods: {
        playTrack(iTrack, paused=false) {
            paused = paused || this.pauseAudio();
            if (iTrack < 0 || this.section && this.tracks.length <= iTrack) {
                console.log(`playTrack(${iTrack}) ignored`);
                return;
            }
            Vue.set(this, "iTrack", iTrack);
            Vue.set(this, "iSegment", 0);
            console.log(`ScvPlayer.playTrack(${iTrack} of ${this.tracks.length})`);
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
            this.$http.get(url).then(res => {
                this.stopProgress();
                Vue.set(this, "section", res.data);
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
                this.scvOpts.iVoice,
            ].join('/');
        },
        url(path) {
            return window.location.origin === 'http://localhost:8080'
                ? `http://localhost/scv/${path}`
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
            this.pauseAudio();
            this.stopProgress();
            this.visible = false;
        },
        cssProps(opts) {
            return Object.assign({}, {
                '--accent-color': this.$vuetify.theme.accent,
                '--success-color': this.$vuetify.theme.success,
            }, opts);
        },
        onEndLang(event) {
            this.setTextClass();
            if (this.paused) {
                console.log(`onEndLang() finished`, event);
            } else {
                this.paused = true;
                if (this.iSegment < this.section.segments.length-1) {
                    Vue.set(this, "iSegment", this.iSegment+1);
                    //console.log(`onEndLang() incrementing segment: ${this.iSegment}`);
                    this.$nextTick(() => {
                        this.toggleAudio();
                    });
                } else if (this.iTrack < this.tracks.length) {
                    this.$nextTick(() => {
                        this.playTrack(this.iTrack+1, true);
                    });
                }
            }
        },
        onEndPali(event) {
            var playLang = this.showTrans && this.segment.audio[this.language];
            if (playLang) {
                var refLang = this.$refs.refAudioLang;
                refLang.play().then(() => {
                    this.setTextClass();
                    this.loadingAudio = 0;
                    //console.log(`onEndPali() refLang playing started`);
                }).catch(e => {
                    this.paused = true;
                    this.loadingAudio = 0;
                    console.log(`onEndPali(${!!event}) refLang playing failed`, e.stack);
                });
            } else {
                this.onEndLang();
            }
        },
        pauseAudio() {
            var refPli = this.$refs.refAudioPali;
            var refLang = this.$refs.refAudioLang;
            var result = true;
            if (!this.paused) { // playing
                this.paused = true;
                !refPli.paused && refPli.pause();
                !refLang.paused && refLang.pause();
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
                    this.scvOpts.iVoice,
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
        clickPlayPause() {
            console.log(`clickPlayPause() ${this.paused ? "play" : "pause"}`);
            this.toggleAudio();
            var refPlay = this.$refs.refPlay.$el;
            refPlay.focus();
        },
        toggleAudio() {
            var that = this;
            (async function() {
                var refPli = that.$refs.refAudioPali;
                var refLang = that.$refs.refAudioLang;
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
                    refPli.load();
                    that.loadingAudio++;
                }
                var playLang = that.showTrans && segment.audio[lang];
                if (playLang) {
                    refLang.load();
                    that.loadingAudio++;
                }
                that.paused = false;
                if (playPali) {
                    refPli.play().then(() => {
                        that.setTextClass();
                        that.loadingAudio = 0;
                    }).catch(e => {
                        that.paused = true;
                        that.loadingAudio = 0;
                        console.log(`refPli playing failed`, e);
                    });
                } else {
                    that.onEndPali();
                }
            })();
        },
        setTextClass() {
            var refPli = this.$refs.refAudioPali;
            this.paliTextClass = refPli == null || refPli.paused 
                ? "scv-player-text scv-player-text-top"
                : "scv-player-text scv-player-text-playing scv-player-text-top";
            //console.log(`paliTextClass ${this.paliTextClass}`);
            var refLang = this.$refs.refAudioLang;
            this.langTextClass = refLang == null || refLang.paused 
                ? "scv-player-text"
                : "scv-player-text scv-player-text-playing";
            //console.log(`langTextClass ${this.langTextClass}`);
        },
        audioSrc(lang) {
            var segment = this.section && this.section.segments[this.iSegment];
            var url = this.url(segment ? `audio/${segment.audio[lang]}` : '');
            //console.log(`audioSrc`, url);
            return url;
        },
        progressSrc() {
            switch (Number(this.scvOpts.ips)) {
                case 0: return "";
                case 1: return "./audio/rainforest-ambience-glory-sunz-public-domain.mp3";
                case 2: return "./audio/indian-bell-flemur-sampling-plus-1.0.mp3";
                default: return "./audio/tibetan-singing-bowl-horst-cc0.mp3";
            }
        },
        keydownPrevious(evt) {
            if (evt.key === 'Tab') {
                var elt = evt.shiftKey 
                    ? this.$refs.refClose
                    : this.$refs.refNext;
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
                    : this.$refs.refPrevious;
                elt && elt.focus();
            } else if (evt.key === ' ') {
                this.close();
            }
        },
    },
    computed: {
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
            return this.section && this.section.segments[this.iSegment];
        },
        scvOpts() {
            return this.$root.$data;
        },
        showPali( ){
            var showLang = this.scvOpts && this.scvOpts.showLang || 0;
            return showLang === 0 || showLang === 1;
        },
        showTrans( ){
            var showLang = this.scvOpts && this.scvOpts.showLang || 0;
            return showLang === 0 || showLang === 2;
        },
        paliText() {
            return this.segment && this.segment.pli || 
                this.loading && "Loading..." ||
                "(...)";
        },
        langText(){
            var lang = this.language;
            return this.segment && this.segment[lang] ||
                this.loading && "Loading..." ||
                "(no translation available)";
        }
    },
    mounted() {
        this.setTextClass();
        console.log(`mounted`, this.tracks);
        this.$nextTick(() => {
            var refPli = this.$refs.refAudioPali;
            var refLang = this.$refs.refAudioLang;
            refPli.addEventListener("ended", this.onEndPali);
            refLang.addEventListener("ended", this.onEndLang);
        });
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
    color: var(--accent-color);
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
    margin-left: -0.5em;
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
</style>
