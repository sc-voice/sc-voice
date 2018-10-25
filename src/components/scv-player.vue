<template>
    <div class="scv-player">
        <button
            @click="play()"
            class="scv-text-button"
            :style="cssProps()"
            >
            Play Section {{iSection}} {{voice.name}}/Raveena
        </button>
        sutta_uid:{{sutta_uid}}
        language:{{language}}
        translator:{{translator}}
        iSection:{{iSection}}
        <v-dialog persistent v-if="section" value="true"
            max-width="30em" dark class="scv-player-section">
            <v-card>
                <v-card-title>{{title}}</v-card-title>
                <v-card-text>
                    <div class="scv-player-nav">
                        <button class="scv-text-button"
                            :style='cssProps({"width":"6em"})'
                            >Previous</button>
                        <div>Section {{iSection}}</div>
                        <button class="scv-text-button"
                            :style='cssProps({"width":"6em"})'
                            >Next</button>
                    </div>
                    <div class="scv-player-text">
                        {{segment.en}}
                    </div>
                    <div class="scv-player-text">
                        {{segment.pli}}
                    </div>
                    <v-slider thumb-label v-model="iSegment"
                        always-dirty
                        class="ml-3 mr-3"
                        :max="section.segments.length-1"
                    />
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
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
        iSection: {
            default: 0,
        },
        voice: Object,
    },
    data: function() {
        return {
            section: null,
            iSegment: 0,
        };
    },
    methods: {
        play() {
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
                this.$nextTick(() => {
                    Vue.set(this, "section", res.data);
                    //this.stopWaiting(timer);
                });
            }).catch(e => {
                console.error(e.stack);
            });
        },
        cssProps(opts) {
            return Object.assign({}, {
                '--accent-color': this.$vuetify.theme.accent,
                '--success-color': this.$vuetify.theme.success,
            }, opts);
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
    border: 1pt solid red;
}
.scv-player-section {
    dispay: flex;
    flex-flow: column;
    align-items: center;
    border: 1pt solid green;
}
.scv-player-text {
    margin: 1em;
    min-height: 9em;
}
.scv-player-nav {
    display: flex;
    justify-content: space-between;
    margin-left: -0.5em;
    margin-right: 0.5em;
    align-items: center;
}
</style>
