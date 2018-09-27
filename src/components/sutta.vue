<template>
  <v-container fluid class="scv-sutta">
      <v-layout column align-left >
          <div class="scv-search-row">
              <v-text-field placeholder="Enter sutta id" 
                  v-model="search" v-on:keypress="onSearchKey($event)"
                  label = "Search" ></v-text-field>
          </div>
          <div v-if="error.search" class="scv-error" >
              <search-help autofocus :title="errorSummary" :httpError="error.search.http" />
              <v-btn icon @click="error.search=null" class="scv-icon-btn" :style="cssProps"
                aria-label="Dismiss Error">
                <v-icon>clear</v-icon>
              </v-btn>
          </div>
          <details autofocus v-if="sections && sections[0]" class="scv-header">
            <summary class="subheading scv-header-summary" >
                {{sutta.title}}
            </summary>
            <div class="title pt-4 pb-2 text-xs-center">
                {{sutta.original_title}}
            </div>
            <div class="subtitle font-italic pt-1 pb-3 text-xs-center">
                Translated by {{sutta.author}}
            </div>
            <div class="scv-blurb">{{suttaplex.blurb}}</div>
            <div class="scv-blurb"><span v-html="metaarea"></span></div>
            <div class="scv-play-controls">
                <audio v-if="suttaAudioGuid" autoplay controls class="ml-4 mt-1" 
                    preload=auto
                    :aria-label="`play sutta`">
                    <source :src="`./audio/${suttaAudioGuid}`" type="audio/mp3"/>
                    <p>Your browser doesn't support HTML5 audio</p>
                </audio>
                <button v-else :ref="`play`" @click="playSutta" :disabled="waiting"
                    class="scv-text-button mt-4 mb-4" :style="cssProps">
                    Play Sutta ({{voice.name}})
                </button>
                <v-progress-linear v-if="waiting" :indeterminate="true"></v-progress-linear>
            </div>
            <div class="scv-blurb-more">
                <details>
                    <summary class="body-2">{{suttaId.toUpperCase()}}: Other Resources</summary>
                    <div class="caption text-xs-center">
                        <div v-for="translation in suttaplex.translations" 
                            class="text-xs-center"
                            :key="translation.id"
                            v-show="author_uid !== translation.author_uid">
                            <a :href="translationLink(translation.author_uid)"
                                @click="linkClicked()"> 
                                {{translation.author}} 
                                &nbsp;&bull;&nbsp; 
                                {{translation.lang_name}}
                            </a>
                        </div>
                        <div class="text-xs-center">
                            <a :href="`https://github.com/sc-voice/sc-voice/wiki/Audio-${suttaId}`"
                                target="_blank"> 
                                {{suttaId.toUpperCase()}} audio recordings
                            </a>
                        </div>
                        <div class="text-xs-center">
                            <a :href="`https://suttacentral.net/${suttaId}`"
                                target="_blank"> 
                                {{suttaId.toUpperCase()}} at SuttaCentral.net
                            </a>
                        </div>
                        <a class="text-xs-center" :style="cssProps"
                            target="_blank"
                            href="https://github.com/sc-voice/sc-voice/wiki/Support-Policy/">
                            <span v-if="support.value==='Legacy'">
                                Content support: Legacy
                            </span>
                            <span v-if="support.value==='Supported'">
                                Content support: <em>Supported</em>
                            </span>
                        </a>
                    </div>
                </details>
            </div>
          </details>
          <details class="scv-section-body" 
            v-for="(sect,i) in sections" :key="`sect${i}`" 
            v-if="i>0">
            <summary class="subheading" >
                Section {{i}} 
                <div v-if="scvOpts.showId" class='scv-scid'>
                    SC&nbsp;{{sect.segments[0].scid.split(":")[1]}}
                </div> 
                <i>{{sect.title}}</i>
            </summary>
            <div class="scv-play-controls">
                <audio v-if="sectionAudioGuids[i]" autoplay controls class="ml-4 mt-1" 
                    preload=auto
                    :aria-label="`play section ${i}`">
                    <source :src="`./audio/${sectionAudioGuids[i]}`" type="audio/mp3"/>
                    <p>Your browser doesn't support HTML5 audio</p>
                </audio>
                <button v-else :ref="`play${i}`" @click="playSection(i)" :disabled="waiting"
                    class="scv-text-button mt-4 mb-4" :style="cssProps">
                    Play Section {{i}} ({{voice.name}})
                </button>
                <v-progress-linear v-if="waiting" :indeterminate="true"></v-progress-linear>
            </div>
            <div v-if="error[i]" class="scv-error" 
                style="margin-left: 1.2em" >
              <div>
                <span class="subheading">{{error[i].data}}</span>
                <br>
                <span class="font-italic">{{error[i].http}}</span>
              </div>
              <v-btn icon @click="error[i]=null" class="scv-icon-btn" :style="cssProps"
                aria-label="Dismiss Error">
                <v-icon>clear</v-icon>
              </v-btn>
            </div>
            <div v-for="(seg,j) in sect.segments" :key="seg+j" :class="segClass(seg)">
                <div v-show="scvOpts.showId" class='scv-scid'>
                    SC&nbsp;{{seg.scid.split(":")[1]}}
                </div> 
                {{seg.en}}
            </div>
          </details>
      </v-layout>
  </v-container>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";

import SearchHelp from "./search-help";
const MAX_SECTIONS = 100;

export default {
    name: 'Sutta',
    props: {
        msg: String,
    },
    data: function( ){
        var error = {
            search: null,
        };
        var sectionAudioGuids = [];
        for (var i = 0; i < MAX_SECTIONS; i++) {
            error[i] = null;
            sectionAudioGuids[i] = null;
        }
        var that = {
            error,
            search: '',
            sectionAudioGuids,
            suttaAudioGuid: null,
            support: {
                value: '(n/a)',
                descriptions: '(n/a)',
            },
            sutta: {},
            suttaplex: {},
            metaarea: '',
            sections: null,
            language: 'en',
            translator: 'sujato',
            waiting: false,
            searchButtons: false,
        }
        return that;
    },
    methods: {
        clear() {
            this.error.search = null;
            for (var i = 0; i < MAX_SECTIONS; i++) {
                this.error[i] = null;
                this.sectionAudioGuids[i] = null;
            }
            this.segments = null;
        },
        playSection(iSection) {
            console.debug("playSection", iSection);
            var search = this.search.trim();
            var suttaId = search;
            var language = this.language;
            var translator = this.translator;
            var g = Math.random();
            var vSvc = this.voice.value;
            if (vSvc !== 'recite' && vSvc !== 'review' && vSvc !== 'navigate') {
                vSvc = 'recite';
            }
            var url = `./${vSvc}/section/${suttaId}/${language}/${translator}/${iSection}?g=${g}`;
            Vue.set(this, "waiting", true);
            this.$http.get(url).then(res => {
                Vue.set(this.sectionAudioGuids, iSection, res.data.guid);
                Vue.set(this, "waiting", false);
            }).catch(e => {
                var data = e.response && e.response.data && e.response.data.error 
                    || `Section #${iSection} cannot be recited. Try again later.`;
                this.error[iSection] = {
                    http: e.message,
                    data,
                }
                console.error(e.stack, data);
                Vue.set(this, "waiting", false);
            });
        },
        onSearchKey(event) {
            if (event.key === "Enter") {
                this.search && this.onSearch();
            }
        },
        parseSearch() {
            var defaultSearch = {
                translator: 'sujato',
                lang: 'en',
            };
            var search = window.location.search;
            search = search && search.substring(1) || '';
            var searchSplits = search.split('&');
            return searchSplits.reduce((acc,s) => {
                var kv = s.split('=');
                if (kv[0] === 'translator') {
                    acc.translator = kv[1];
                } else if (kv[0] === 'lang') {
                    acc.lang = kv[1];
                }
                return acc;
            }, defaultSearch);
        },
        showSutta(scid) {
            var { 
                translator,
                lang,
            } = this.parseSearch();
            var url = `./sutta/${scid}/${lang}/${translator}`;
            Object.keys(this.error).forEach(key => {
                Vue.set(this.error, key, null);
            });
            this.$http.get(url).then(res => {
                this.clear();
                var sections = this.sections = res.data.sections;
                Object.assign(this.support, res.data.support);
                this.metaarea = res.data.metaarea;
                var suttaplex = this.suttaplex = 
                    Object.assign(this.suttaplex, res.data.suttaplex);

                var author_uid = this.author_uid = res.data.author_uid;
                var acronym = suttaplex.acronym || suttaplex.uid.toUpperCase();
                var translation = suttaplex.translations
                    .filter(t => t.author_uid === author_uid)[0] || {
                    lang: this.language,
                };
                var title = translation.title || suttaplex.translated_title;
                this.sutta.acronym = acronym;
                this.sutta.title = `${acronym}: ${title}`;
                this.sutta.original_title = suttaplex.original_title || "?";
                var seg0 = sections[0].segments[0];
                this.sutta.collection = `${seg0.pli} / ${seg0.en}`;
                this.sutta.author = translation.author;
            }).catch(e => {
                var data = e.response && e.response.data && e.response.data.error 
                    || `Not found.`;
                this.error.search = {
                    http: e.message,
                    data,
                };
                console.error(e.stack, data);
            });

        },
        onSearch() {
            var search = this.search.trim();
            this.scvOpts.scid = search;
            this.scvOpts.reload();
        },
        segClass(seg) {
            return seg.expanded ? "scv-para scv-para-expanded" : "scv-para";
        },
        playSutta() {
        },
        translationLink(author_uid,lang='en') {
            console.log(window.location);
            var loc = window.location;
            var search = `translator=${author_uid}&lang=${lang}`;
            return `${loc.protocol}//${loc.host}${loc.pathname}?${search}${loc.hash}`;
        },
    },
    computed: {
        suttaId() {
            var query = this.$route.query;
            return query && query.scid && query.scid || '';
        },
        voice() {
            return this.scvOpts.voices[this.scvOpts.iVoice];
        },
        scvOpts() {
            return this.$root.$data;
        },
        cssProps() {
            return {
                '--accent-color': this.$vuetify.theme.accent,
                '--success-color': this.$vuetify.theme.success,
            }
        },
        errorSummary() {
            return `Error: ${this.error.search.data}`;
        },
        supportClass() {
            return this.support.value === 'Supported' 
                ? 'scv-support scv-supported' 
                : 'scv-support scv-legacy';
        },
    },
    mounted() {
        this.$nextTick(() => {
            if (this.suttaId) {
                Vue.set(this, 'search', this.suttaId);
                this.showSutta(this.suttaId);
            }
        });
    },

    components: {
        SearchHelp,
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
summary {
    padding-left: 0.2em;
    padding-right: 0.2em;
}
button {
    background-color: var(accentColor);
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
:focus {
    background-color: #000 !important;
}
a {
    color: white;
    text-decoration: none;
    padding-left: 0.2em;
    padding-right: 0.2em;
}
a:visited {
    color: white;
}
a:hover {
    text-decoration: underline;
}
.scv-scid {
    display: inline-block;
    font-size: xx-small;
    color: #888;
    padding-right: 1em;
}
.scv-section-body {
    max-width: 40em;
}
.scv-header {
    margin-bottom: 0.5em;
}
.scv-header-body {
    font-style: italic;
    margin-left: 1.4em;
}
.scv-para {
    margin-top: 0.5em;
    padding-left: 1.5em;
    margin-bottom: 0.2em;
}
.scv-para-expanded {
    padding-right: 1em;
    border-right: 2pt solid #444;
}
.scv-sutta {
    position: relative;
    max-width: 40em;
    padding-left: auto;
    padding-right: auto;
    padding-bottom: 100px;
}
.scv-text-button {
    border-radius: 4px;
    border: 1pt solid #888;
    padding-left: 0.4em;
    padding-right: 0.4em;
    text-align: center;
    margin-left: 1.2em;
}
.scv-text-button:focus {
    border-color: var(--accent-color);
    outline: 1pt solid var(--accent-color);
}
.scv-search-row {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
}
.scv-icon-btn {
    margin: 0;
}
.scv-icon-btn:focus {
    border-radius:5px;
    border: 1pt solid var(--accent-color);
}
.scv-error {
    background-color: #403030 !important;
    border-top: 2pt solid #ff3232;
    border-bottom-left-radius: .5em;
    border-bottom-right-radius: .5em;
    padding: 0.4em;
    padding-left: 0.5em;
    padding-right: 0.5em;
    margin-top: 0.5em;
    margin-bottom: 1em;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}
.scv-sutta-col {
    border: 1pt solid red;
}
.scv-play-controls {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: flex-start;
}

.scv-blurb {
    padding-left: 3em;
    padding-right: 3em;
}
.scv-title {
    display: inline-block;
    padding-top: 0.5em;
}
.scv-support {
    display: block;
    text-align: center;
}
.scv-supported {
}
.scv-legacy {
}
.scv-blurb-more {
    display: flex;
    flex-flow: column;
    align-items: center;
}
</style>
