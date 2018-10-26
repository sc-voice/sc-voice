<template>
    <v-dialog persistent v-model="visible"
        max-width="35em" dark class="scv-player-section">
        <v-card>
            <v-card-text v-if="section" >
                <div class="subheading pl-2 pb-2">{{title}}</div>
                <div class="scv-player-nav">
                    <button class="scv-text-button"
                        :disabled="!section"
                        :style='cssProps({"width":"6em"})'
                        >Previous</button>
                    <div v-if="segment">
                        {{iSection}}/{{section.maxSection}} 
                    </div>
                    <button class="scv-text-button"
                        :disabled="!section"
                        :style='cssProps({"width":"6em"})'
                        >Next</button>
                </div>
                <div class="body-2 mt-1 text-xs-center"> {{section.title}} </div>
                <v-slider thumb-label v-model="iSegment"
                    ref="refSlider"
                    always-dirty
                    class="pl-4 pr-4"
                    height="16"
                    :max="section.segments.length-1"
                />
                <div class="scv-player-text scv-player-text-top">
                    {{segment.pli}}
                </div>
                <div class="scv-player-text">
                    {{segment.en}}
                </div>
            </v-card-text>
            <v-card-text v-else>
                Loading section {{iSection}}...
            </v-card-text>
            <v-card-actions class="pl-4 pr-4" >
                <div>
                    {{segment && segment.scid.split(':')[1]}}
                </div>
                <v-spacer/>
                <button class="scv-text-button"
                    :style='cssProps({"width":"6em"})'
                    @click="close()">
                    Close
                </button>
            </v-card-actions>
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
        };
    },
    methods: {
        playSection(iSection) {
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
            console.log(`play() url:${url}`);
            this.$http.get(url).then(res => {
                this.stopProgress();
                this.$nextTick(() => {
                    Vue.set(this, "section", res.data);
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
            this.stopProgress();
            this.visible = false;
        },
        cssProps(opts) {
            return Object.assign({}, {
                '--accent-color': this.$vuetify.theme.accent,
                '--success-color': this.$vuetify.theme.success,
            }, opts);
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
        segment() {
            return this.section && this.section.segments[this.iSegment];
        },
        scvOpts() {
            return this.$root.$data;
        },
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
</style>
