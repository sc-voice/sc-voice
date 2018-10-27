<template>
    <v-dialog persistent v-model="visible"
        max-width="35em" dark class="scv-player-section">
        <v-card>
            <v-card-text >
                <div class="subheading pl-2 pb-2">{{title}}</div>
                <div class="scv-player-nav">
                    <button class="scv-text-button"
                        @click="playSection(iSection-1)"
                        :style='cssProps({"width":"6em"})'
                        >Previous</button>
                    <div >
                        {{iSection}}/{{section && section.maxSection || "(n/a)"}} 
                    </div>
                    <button class="scv-text-button"
                        @click="playSection(iSection+1)"
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
                    height="16"
                    :max="section && section.segments.length-1"
                />
                <div :class="paliTextClass" :style="cssProps()">
                    <div >{{segment && segment.pli || "Loading..."}}</div>
                </div>
                <div :class="langTextClass" :style="cssProps()">
                    <div >{{segment && segment[language] || "Loading..."}}</div>
                </div>
            </v-card-text>
            <v-card-actions class="ml-3 mr-3 pb-3">
                <div style="width:6em">
                    {{segment && segment.scid.split(':')[1]}}
                </div>
                <v-spacer/>
                <v-btn icon @click="playAudio()" 
                    ref="refPlay"
                    class="scv-icon-btn" :style="cssProps()"
                    aria-label="Play Section">
                    <v-icon v-if="loading">hourglass_empty</v-icon>
                    <v-icon v-if="!loading && paused">play_arrow</v-icon>
                    <v-icon v-if="!loading && !paused">pause</v-icon>
                </v-btn>
                <v-spacer/>
                <button class="scv-text-button"
                    :style='cssProps({"width":"6em"})'
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
        title: String,
        sutta_uid: String,
        language: {
            default: 'en',
        },
        translator: {
            default: 'sujato',
        },
        voice: Object,
    },
    data: function() {
        return {
            section: null,
            iSegment: 0,
            iSection: 0,
            visible: false,
            progressTimer: null,
            paused: true,
            loadingAudio: 0,
            paliTextClass: "",
            langTextClass: "",
        };
    },
    methods: {
        playSection(iSection) {
            this.pauseAudio();
            if (iSection < 0 || this.section && this.section.maxSection < iSection) {
                console.log(`playSection(${iSection}) ignored`);
                return;
            }
            this.iSection = iSection;
            console.log(`ScvPlayer.playSection(${iSection})`);
            this.visible = true;
            this.section = null;
            this.progressTimer = setTimeout(() => {
                this.progressTime = null;
                var progressAudio = this.$refs.refProgressAudio;
                progressAudio.play();
            }, 1000);

            var sectionRef = [
                this.sutta_uid,
                this.language,
                this.translator,
                this.iSection,
                this.scvOpts.iVoice,
            ].join('/');
            var url = `./play/section/${sectionRef}`;
            //console.log(`play() url:${url}`);
            this.$http.get(url).then(res => {
                this.stopProgress();
                Vue.set(this, "section", res.data);
                this.$nextTick(() => {
                    var playBtn = this.$refs.refPlay.$el;
                    console.log('playBtn', playBtn);
                    playBtn.focus();
                });
            }).catch(e => {
                this.stopProgress();
                console.error(e.stack);
            });
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
        endLang() {
            //console.log(`endLang()`);
            this.setTextClass();
            this.paused = true;
            if (this.iSegment < this.section.segments.length-1) {
                Vue.set(this, "iSegment", this.iSegment+1);
                //console.log(`incrementing segment: ${this.iSegment}`);
                this.$nextTick(() => {
                    this.playAudio();
                });
            }
        },
        endPali() {
            if (this.segment.audio[this.language]) {
                var refLang = this.$refs.refAudioLang;
                refLang.play().then(() => {
                    this.setTextClass();
                    this.loadingAudio = 0;
                    //console.log(`endPali() refLang playing started`);
                }).catch(e => {
                    this.paused = true;
                    this.loadingAudio = 0;
                    //console.log(`endPali() refLang playing failed`, e.stack);
                });
            } else {
                //console.log(`endPali() no translation to play`);
            }
        },
        pauseAudio() {
            var refPli = this.$refs.refAudioPali;
            var refLang = this.$refs.refAudioLang;
            var result = true;
            if (!this.paused && !refPli.paused) {
                this.paused = true;
                refPli.pause();
            } else if (!this.paused && !refLang.paused) {
                this.paused = true;
                refLang.pause();
            } else {
                result = false;
            }
            this.setTextClass();
            result && console.log("pauseAudio()");
            return result;
        },
        playAudio() {
            var refPli = this.$refs.refAudioPali;
            var refLang = this.$refs.refAudioLang;
            if (this.pauseAudio()) {
                return;
            }
            this.loadingAudio = 0;
            var segment = this.segment;
            if (segment.audio.pli) {
                refPli.load();
                this.loadingAudio++;
            }
            var lang = this.language;
            if (segment.audio[lang]) {
                refLang.load();
                this.loadingAudio++;
            }
            //console.log(`refPli.play() ready:`, refPli.readyState);
            if (segment.audio.pli) {
                refPli.play().then(() => {
                    this.setTextClass();
                    this.paused = false;
                    this.loadingAudio = 0;
                    //console.log(`refPli playing started`);
                }).catch(e => {
                    this.paused = true;
                    this.loadingAudio = 0;
                    //console.log(`refPli playing failed`, e);
                });
            } else {
                this.endPali();
            }
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
            var url = segment ? `./audio/${segment.audio[lang]}` : '';
            //console.log(`audioSrc`, url);
            return url;
        },
        progressSrc() {
            switch (Number(this.scvOpts.ips)) {
                case 0: return "";
                case 1: return "./audio/rainforest-ambience-glory-sunz-public-domain.mp3";
                default: return "./audio/indian-bell-flemur-sampling-plus-1.0.mp3";
            }
        },
    },
    computed: {
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
    },
    mounted() {
        this.setTextClass();
        this.$nextTick(() => {
            var refPli = this.$refs.refAudioPali;
            var refLang = this.$refs.refAudioLang;
            refPli.addEventListener("ended", this.endPali);
            refLang.addEventListener("ended", this.endLang);
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
