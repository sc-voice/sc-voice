<template>
  <v-container fluid class="scv-sutta">
      <v-layout column align-left >
          <div class="scv-search-row">
              <v-text-field placeholder="Enter sutta id" 
                  v-model="search" v-on:keypress="onSearchKey($event)"
                  label = "Search" ></v-text-field>
          </div>
          <v-progress-linear v-if="waiting" :indeterminate="true"></v-progress-linear>
          <div v-if="error.search" class="scv-error" >
              <search-help ref="refSearchHelp" :title="errorSummary" 
                :search="search"
                :httpError="error.search.http" />
              <v-btn icon @click="error.search=null" class="scv-icon-btn" :style="cssProps"
                aria-label="Dismiss Error">
                <v-icon>clear</v-icon>
              </v-btn>
          </div>
          <details v-show="searchResults">
            <summary role="heading" aria-level="1" ref="refResults" class='title'>
                <span v-if="searchResults && searchResults.length">
                    Top {{searchResults && searchResults.length}} suttas found
                </span>
                <span v-else>
                    No suttas found
                </span>
            </summary>
            <details role="heading" aria-level="2"
                v-for="result in (searchResults||[])" :key="result.uid" 
                class="scv-search-result" :style="cssProps">
                <summary class="scv-search-result-summary">
                    {{result.suttaplex.acronym || result.uid}}
                    {{result.title}}
                    <span class="caption">&nbsp;matches:{{result.count}} of {{result.nSegments}} </span>
                </summary>
                <div class="scv-search-result-lang">
                    <a :href="resultLink(result)" target="_blank"> 
                        <span v-html="result.quote.en"></span>
                        <span v-if="scvOpts.showId" class='scv-scid'>
                            &mdash;
                            SC&nbsp;{{result.quote.scid}}
                            {{result.author}}
                        </span> 
                    </a>
                </div>
                <div class="scv-search-result-pli">
                    <a href="/">
                        <span v-html="result.quote.pli"></span>
                    </a>
                </div>
            </details>
          </details>
          <details v-if="sections && sections[0]" class="scv-header">
            <summary ref="refSutta" class="subheading scv-header-summary" >
                {{sutta.title}}
            </summary>
            <div class="scv-blurb">{{suttaplex.blurb}}</div>
            <div class="title pt-4 pb-2 text-xs-center">
                {{sutta.original_title}}
            </div>
            <div class="subtitle font-italic pt-1 pb-3 text-xs-center">
                Translated by {{sutta.author}}
            </div>
            <div class="scv-blurb"><span v-html="metaarea"></span></div>
            <div class="scv-play-controls">
                <audio v-if="suttaAudioGuid" autoplay controls class="ml-4 mt-1" 
                    preload=auto
                    :aria-label="`play sutta`">
                    <source :src="audioSuttaSrc" type="audio/mp3"/>
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
                    <summary class="body-2">{{suttaCode}}: Other Resources</summary>
                    <div class="caption text-xs-center">
                        <div class="text-xs-center" v-if="hasAudio">
                            <a :href="downloadUrl" download>
                                Download {{sutta_uid}}-{{language}}-{{author_uid}}.mp3
                            </a>
                        </div>
                        <div v-for="translation in suttaplex.translations" 
                            class="text-xs-center"
                            :key="translation.id"
                            v-show="author_uid !== translation.author_uid">
                            <a :href="translationLink(translation)"
                                v-on:click="clickTranslation(translation,$event)">
                                {{translation.author}} 
                                &nbsp;&bull;&nbsp; 
                                {{translation.lang_name}}
                            </a>
                        </div>
                        <div class="text-xs-center" v-if="hasAudio">
                            <a :href="audioUrl" target="_blank"> 
                                {{sutta_uid.toUpperCase()}} audio recordings
                            </a>
                        </div>
                        <div class="text-xs-center">
                            <a :href="`https://suttacentral.net/${sutta_uid}`"
                                target="_blank"> 
                                {{sutta_uid.toUpperCase()}} at SuttaCentral.net
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
            hasAudio: true,
            search: '',
            sectionAudioGuids,
            searchResults: null,
            suttaAudioGuid: null,
            support: {
                value: '(n/a)',
                descriptions: '(n/a)',
            },
            sutta: {},
            suttaplex: {},
            suttaCode: '',
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
            this.searchResults = null;
            for (var i = 0; i < MAX_SECTIONS; i++) {
                this.error[i] = null;
                this.sectionAudioGuids[i] = null;
            }
            Object.keys(this.error).forEach(key => {
                Vue.set(this.error, key, null);
            });
            this.segments = null;
        },
        playSection(iSection) {
            console.debug("playSection", iSection);
            var language = this.language;
            var translator = this.translator;
            var g = Math.random();
            var vSvc = this.voice.value;
            if (vSvc !== 'recite' && vSvc !== 'review' && vSvc !== 'navigate') {
                vSvc = 'recite';
            }
            var url = `./${vSvc}/section/${this.sutta_uid}/${language}/${translator}/${iSection}?g=${g}`;
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
        showSutta(search) {
            var tokens = search.split('/');
            (tokens.length < 2) && tokens.push(this.scvOpts.lang);
            (tokens.length < 3) && tokens.push('sujato'); // TODO remove sujato
            var url = `./sutta/${tokens.join('/')}`;
            this.waiting = true;
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
                this.suttaCode = res.data.suttaCode || '';
                this.language = translation.lang;
                this.translator = translation.author_uid;
                var title = translation.title || suttaplex.translated_title;
                this.sutta.acronym = acronym;
                this.sutta.title = `${acronym}: ${title}`;
                this.sutta.original_title = suttaplex.original_title || "?";
                var seg0 = sections[0].segments[0];
                this.sutta.collection = `${seg0.pli} / ${seg0.en}`;
                this.sutta.author = translation.author;
                this.waiting = false;
                this.$nextTick(() => this.$refs.refSutta.focus());
            }).catch(e => {
                var data = e.response && e.response.data && e.response.data.error 
                    || `Not found.`;
                this.error.search = {
                    http: e.message,
                    data,
                };
                console.error(e.stack, data);
                this.waiting = false;
                this.$nextTick(() => this.$refs.refSearchHelp.setFocus());
            });

        },
        searchSuttas(search) {
            var url = `./search/${search}?maxResults=${this.scvOpts.maxResults}`;
            this.waiting = true;
            this.$http.get(url).then(res => {
                this.clear();
                console.log('searchResults', res.data);
                Vue.set(this, 'searchResults', res.data);
                this.waiting = false;
                this.$nextTick(() => {
                    this.$refs.refResults.focus();
                });
            }).catch(e => {
                var data = e.response && e.response.data && e.response.data.error 
                    || `Not found.`;
                this.error.search = {
                    http: e.message,
                    data,
                };
                console.error(e.stack, data);
                this.waiting = false;
                this.$nextTick(() => this.$refs.refSearchHelp.setFocus());
            });

        },
        onSearch() {
            this.scvOpts.reload({
                search: this.search,
            });
        },
        segClass(seg) {
            return seg.expanded ? "scv-para scv-para-expanded" : "scv-para";
        },
        playSutta() {
            console.debug("playSutta");
            var language = this.language;
            var translator = this.translator;
            var g = Math.random();
            var vSvc = this.voice.value;
            if (vSvc !== 'recite' && vSvc !== 'review' && vSvc !== 'navigate') {
                vSvc = 'recite';
            }
            var url = `./${vSvc}/sutta/${this.sutta_uid}/${language}/${translator}?g=${g}`;
            Vue.set(this, "waiting", true);
            this.$http.get(url).then(res => {
                Vue.set(this, "suttaAudioGuid", res.data.guid);
                Vue.set(this, "waiting", false);
                console.log(`playSutta ${res.data.guid}`);
            }).catch(e => {
                var data = e.response && e.response.data && e.response.data.error 
                    || `Sutta cannot be recited. Try again later.`;
                this.error.search = {
                    http: e.message,
                    data,
                }
                console.error(e.stack, data);
                Vue.set(this, "waiting", false);
            });
        },
        translationSearch(translation) {
            var author_uid = translation.author_uid;
            var lang = translation.lang;
            return `${this.sutta_uid}/${lang}/${author_uid}`;
        },
        clickTranslation(translation,event) {
            var search = this.translationSearch(translation);
            console.log(`clickTranslation(${search})`,event);
            this.showSutta(search);
        },
        resultLink(result) {
            var uid = result.uid;
            var lang = result.lang;
            var auid = result.author_uid;
            return this.scvOpts.url({
                search: `${uid}/${lang}/${auid}`,
                lang,
            });
        },
        translationLink(translation) {
            return this.scvOpts.url({
                search: this.translationSearch(translation),
            });
        },
    },
    computed: {
        audioSuttaSrc(){
            var lang = this.language;
            var trans = this.author_uid;
            var filename = `${this.sutta_uid}-${lang}-${trans}.mp3`;
            var guid = this.suttaAudioGuid;
            return `./audio/${guid}/${filename}`;
        },
        audioUrl() {
            return `https://github.com/sc-voice/sc-voice/wiki/Audio-${this.sutta_uid}`;
        },
        downloadUrl() {
            var usage = ['recite','review'][this.scvOpts.iVoice];
            var ref = `${this.sutta_uid}/${this.language}/${this.author_uid}`;
            return `./download/sutta/${ref}/${usage}`;
        },
        sutta_uid() {
            var query = this.$route.query;
            var search = query && query.search || '';
            var tokens = search.split('/');
            return tokens[0];
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
            var search = this.scvOpts.search;
            Vue.set(this, 'search', search);
            if (/[1-9]/.test(search)) {
                console.log(`sutta.mounted() showSutta(${search})`);
                this.showSutta(search);
            } else if (search) {
                console.log(`sutta.mounted() searchSuttas(${search})`);
                this.searchSuttas(search);
            } else {
                console.log(`sutta.mounted() no search`);
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
.scv-search-row {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
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
    padding-top: 1em;
    padding-left: 3em;
    padding-right: 3em;
    font-style: italic;
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
.scv-search-result {
    margin-top: 0.8em;
    border-left: 3pt solid #3a3a3a;
    border-bottom-left-radius: 3pt;
    padding-left: 0.5em;
}
.scv-search-result:focus-within {
    border-left: 3pt solid var(--accent-color);
}
.scv-search-result-summary {
    font-weight: bold;
}
.scv-search-result-lang {
    margin-top: 0.5em;
    padding-left: 1.6em;
}
.scv-search-result-pli {
    font-style: italic !important;
    padding-left: 1.6em;
    margin-top: 0.5em;
}
</style>
