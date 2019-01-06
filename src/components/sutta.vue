<template>
<div>
  <v-progress-linear v-model="waiting" height="4"
    background-color="#000"
    style="width:100%; margin-top:0"/>
  <v-container fluid class="scv-sutta">
      <v-layout column align-left >
          <div class="scv-search-row">
              <div class="scv-search-row2">
                  <v-text-field ref="refSearch"
                      placeholder="Enter sutta id or keyword(s)" 
                      v-model="search" v-on:keypress="onSearchKey($event)"
                      aria-label="Enter sootta i d or keywords"
                      label = "Search" >
                  </v-text-field>
              </div>
          </div>
          <div v-if="error.search" class="scv-error" >
              <error-help ref="refErrorHelp" :title="errorSummary" 
                :search="search"
                :httpError="error.search.http" />
              <v-btn icon @click="error.search=null" 
                class="scv-icon-btn" :style="cssProps"
                aria-label="Dismiss Error">
                <v-icon>clear</v-icon>
              </v-btn>
          </div>
          <div v-if="!searchResults && !sections" class="scv-home-blurb" >
              <div class="text-xs-center caption pr-2">
                  <v-btn @click="clickExamples()"
                      class="scv-text-button " :style="cssProps" small>
                      Examples
                  </v-btn>
              </div>
              <div v-for="(ex,i) in examples"  :key="`example${i}`"
                  class="text-xs-center caption">
                  <a :href="searchUrl(`${ex}`)" :ref="`refExample${i}`" >
                      {{i+1}}. {{ex}}</a>
              </div>
          </div>
          <details v-show="searchResults">
            <summary role="main" aria-level="1" ref="refResults" class='title'>
                <span v-if="searchResults && searchResults.results.length">
                    Top {{searchResults && searchResults.results.length}} 
                    suttas found 
                    for {{searchResults.method}}
                </span>
                <span v-else>
                    No suttas found
                </span>
            </summary>
            <div style="display:flex; justify-content:space-around">
                <v-btn @click="playAll()"
                    class="scv-text-button" :style="cssProps" small>
                    Play All
                </v-btn>
            </div>
            <details role="heading" aria-level="2"
                v-for="(result,i) in (searchResults && searchResults.results||[])" 
                :key="result.uid" 
                class="scv-search-result" :style="cssProps">
                <summary class="scv-search-result-summary">
                    <div style="display: inline-block; width: 96%; ">
                        <div style="display:flex; justify-content: space-between; "> 
                            <div>
                                {{result.suttaplex.acronym || result.uid}} 
                                {{result.title}}
                            </div>
                            <div class="caption">
                               matches: {{result.count}} of {{result.nSegments}} 
                            </div>
                        </div>
                    </div>
                </summary>
                <div v-if="result.quote && showPali && result.quote.pli" 
                    class="scv-search-result-pli">
                    <div>
                        <div v-html="result.quote.pli"></div>
                    </div>
                </div>
                <div v-if="result.quote && showTrans && result.quote[language]"
                    class="scv-search-result-lang">
                    <div>
                        <span v-html="result.quote.en"></span>
                        <span v-if="scvOpts.showId" class='scv-scid'>
                            &mdash;
                            SC&nbsp;{{result.quote.scid}}
                            {{result.author}}
                        </span> 
                    </div>
                </div>
                <div class="ml-3" style="display:flex; justify-content: flex-start">
                    <v-btn icon v-if="result.quote" 
                        @click="playQuotes(i, result)"
                        :class="btnPlayQuotesClass(i)" :style="cssProps" small>
                        <v-icon>textsms</v-icon>
                    </v-btn>
                    <v-btn icon v-if="result.quote" 
                        @click="playOne(result)"
                        class="scv-icon-btn" :style="cssProps" small>
                        <v-icon>play_circle_outline</v-icon>
                    </v-btn>
                    <v-btn icon v-if="result.quote" 
                        :href="resultLink(result)"
                        class="scv-icon-btn" :style="cssProps" small>
                        <v-icon>open_in_new</v-icon>
                    </v-btn>
                    <v-btn icon v-if="result.quote" 
                        class="scv-icon-btn" :style="cssProps" small>
                        <v-icon>cloud_download</v-icon>
                    </v-btn>
                </div>
            </details><!-- search result i -->
          </details><!-- searchresults -->

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
                <button
                    :disabled="waiting > 0"
                    @click="launchSuttaPlayer()"
                    class="scv-text-button"
                    :style="cssProps"
                    >
                    Play Introduction ({{voice.name}})
                </button>
            </div>
            <div class="scv-blurb-more">
                <details>
                    <summary class="body-2">{{suttaCode}}: Other Resources</summary>
                    <div class="caption text-xs-center">
                        <div class="text-xs-center" v-if="hasAudio">
                            <a :href="downloadUrl" ref="refDownload" 
                                @click="downloadClick()"
                                download>
                                Download {{sutta_uid}}-{{language}}-{{author_uid}}.mp3
                            </a>
                            <scv-downloader 
                                ref="refScvDownloader"
                                :filename="downloadFile"
                                :focusElement="postDownloadFocus"
                                /> 
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
            </div> <!-- scv-blurb-more -->
          </details>
          <details class="scv-section-body" 
            v-for="(sect,i) in sections" :key="`sect${i}`" 
            v-if="i>0">
            <summary class="subheading" :aria-label="sectionAriaLabel(sect)">
                <div v-if="scvOpts.showId" class='scv-scid'>
                    SC&nbsp;{{sect.segments[0].scid.split(":")[1]}}
                </div> 
                <i>{{sect.title}}</i>
            </summary>
            <div class="scv-play-controls">
                <button
                    :disabled="waiting > 0"
                    @click="launchSuttaPlayer(i)"
                    class="scv-text-button mt-3"
                    :style="cssProps"
                    >
                    Play Section {{i+1}} ({{voice.name}})
                </button>
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
          </details> <!-- section i -->
          <scv-player v-if="tracks"
            :ref="`refScvPlayer`" :tracks="tracks" :voice="voice" />
      </v-layout>
  </v-container>
</div>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";
import ScvDownloader from "./scv-downloader";
import ErrorHelp from "./error-help";
import ScvPlayer from "./scv-player";
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
            examples: null,
            hasAudio: true,
            search: '',
            sectionAudioGuids,
            searchResults: null,
            refPlaying: null,
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
            tracks: null,
            translator: 'sujato',
            waiting: 0,
            searchButtons: false,
        }
        return that;
    },
    methods: {
        clickExamples() {
            var that = this;
            var url = this.url(`examples/3`);
            this.$http.get(url).then(res => {
                Vue.set(this, "examples", res.data);
                this.$nextTick(() => {
                    var elt = that.$refs['refExample0'][0];
                    elt.focus();
                });
            }).catch(e => {
                console.error(e.stack);
            });
        },
        audioIcon(ref) {
            return ref === this.refPlaying ? 'volume_up' : 'volume_down';
        },
        btnPlayQuotesClass(i) {
            return this.refPlaying === `audioQuote${i}`
                ? 'scv-icon-btn scv-btn-playing' 
                : 'scv-icon-btn ';
        },
        btnAudioClass(ref) {
            return ref === this.refPlaying 
                ? 'scv-icon-btn scv-btn-playing' 
                : 'scv-icon-btn ';
        },
        downloadClick() {
            var elt = this.$refs['refScvDownloader'];
            console.log(`downloading:${this.downloadUrl}`, elt);
            elt && elt.update('Downloading:');
            this.startWaiting({
                cookie: 'download-date',
                onCookieChange: () => {
                    elt && elt.update('Download completed:');
                },
                timeoutSec: 60,
                onTimeout: () => {
                    elt && elt.update('ERROR: Download timed out:');
                },
            });
        },
        clear() {
            this.error.search = null;
            this.sections = null;
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
        suttaTracks(sutta) {
            var tracks = sutta.sections.reduce((acc,sect,i) => {
                acc.push({
                    sutta_uid: sutta.sutta_uid,
                    title: sutta.translation.title,
                    language: sutta.translation.lang,
                    translator: sutta.author_uid,
                    iSection: i,
                    nSegments: sect.segments.length,
                });
                return acc;
            },[]);
            console.log(`suttaTracks ${sutta.sutta_uid} ${tracks.length}`);
            return tracks;
        },
        playOne(result) {
            this.tracks = this.suttaTracks(result.sutta);
            this.launchSuttaPlayer();
        },
        playAll() {
            var results = this.searchResults.results;
            this.tracks = results.reduce((acc,r) => {
                return acc.concat(this.suttaTracks(r.sutta));
            }, []);
            this.launchSuttaPlayer();
        },
        getResultAudio(result) {
            var that = this;
            return new Promise((resolve, reject) => { try {
                var scid = result.quote.scid;
                var segmentRef = [
                    scid.split(':')[0],
                    result.lang,
                    result.author_uid,
                    scid,
                    this.scvOpts.iVoice,
                ].join('/');
                var url = that.url(`play/segment/${segmentRef}`);
                var timer = that.startWaiting();
                that.$http.get(url).then(res => {
                    that.stopWaiting(timer);
                    resolve(res.data);
                }).catch(e => {
                    that.stopWaiting(timer);
                    console.error(e.stack);
                    reject(e);
                });
            } catch(e) {reject(e);} });
        },
        playQuotes(i, result) {
            var that = this;
            (async function() { try {
                if (result.audio == null) {
                    var ref = `audioQuote${i}`;
                    var data = await that.getResultAudio(result);
                    var links = [];
                    var lang = that.language;
                    var dsa = data.segment.audio;
                    dsa.pli && links.push(that.audioLink(dsa.pli));
                    dsa[lang] && links.push(that.audioLink(dsa[lang]));
                    var audio = links.map(link => new Audio(link));
                    var handler1 = () => {
                        audio[1].removeEventListener("ended", handler1);
                        that.refPlaying = null;
                        console.log(`playQuotes ended1`, audio[1]);
                    };
                    var handler0 = () => {
                        audio[0].removeEventListener("ended", handler0);
                        that.refPlaying = null;
                        console.log(`playQuotes ended0`, audio[0]);
                        if (audio[1]) {
                            var handler1 = () => {
                                audio[1].removeEventListener("ended", handler1);
                                that.refPlaying = null;
                                console.log(`playQuotes ended`, audio[1]);
                            };
                            if (audio[1].paused) {
                                console.log('playQuotes nextTick playing', audio[1]);
                                audio[1].play();
                                that.refPlaying = ref;
                                audio[1].addEventListener("ended", handler1);
                            } else {
                                console.log('playQuotes nextTick paused', audio[1]);
                                audio[1].pause();
                                handler1();
                            }
                        }
                    };
                    if (audio[0].paused) {
                        console.log('playQuotes nextTick playing', audio[0]);
                        audio[0].play();
                        that.refPlaying = ref;
                        audio[0].addEventListener("ended", handler0);
                    } else {
                        console.log('playQuotes nextTick paused', audio[0]);
                        audio[0].pause();
                        handler0();
                    }

                    //Vue.set(result, "audio", data.segment.audio);
                    console.log(`playQuotes audio:`, data.segment.audio);
                }
            } catch(e) { 
                console.log(`playQuote`, e.stack);
            }})();
        },
        playQuote(ref, result) {
            var that = this;
            (async function() { try {
                if (result.audio == null) {
                    var data = await that.getResultAudio(result);
                    Vue.set(result, "audio", data.segment.audio);
                    console.log(`playQuote audio:`, data.segment.audio);
                }
                that.$nextTick(() => {
                    var audio = that.$refs[ref][0];
                    var listener;
                    var handler = () => {
                        listener && audio.removeEventListener(listener, handler);
                        listener = null;
                        that.refPlaying = null;
                    };
                    if (audio.paused) {
                        console.log('playQuote nextTick playing', audio);
                        audio.play();
                        that.refPlaying = ref;
                        listener = audio.addEventListener("ended", handler);
                    } else {
                        console.log('playQuote nextTick paused', audio);
                        audio.pause();
                        handler();
                    }
                });
            } catch(e) { 
                console.log(`playQuote`, e.stack);
            }})();
        },
        startWaiting(opts={}) {
            var that = this;
            var cookie = opts.cookie;
            var cookieStart = cookie && that.$cookie.get(cookie);
            var timer = setInterval(() => {
                // exponential smoothing 
                var c = 0.97;
                var waiting = (that.waiting||1) * c + (1-c)*100;
                Vue.set(that, "waiting", waiting);
                if (cookie && that.$cookie.get(cookie) !== cookieStart) {
                    that.stopWaiting(timer);
                    opts.onCookieChange && opts.onCookieChange();
                }
            }, 100);
            var timeoutSec = opts.timeoutSec;
            if (timeoutSec) {
                setTimeout(() => {
                    console.log(`waiting timeout:${timeoutSec}s`);
                    if (that.waiting) {
                        that.stopWaiting(timer);
                        opts.onTimeout && opts.onTimeout();
                    }
                }, timeoutSec*1000);
            }
            return timer;
        },
        stopWaiting(timer){
            clearInterval(timer);
            Vue.set(this, "waiting", 0);
        },
        launchSuttaPlayer(iTrack=0) {
            this.$nextTick(() => {
                var player = this.$refs[`refScvPlayer`];
                if (player == null) {
                    throw new Error('refScvPlayer not found');
                }
                player.launch(iTrack);
            });
        },
        onSearchKey(event) {
            if (event.key === "Enter") {
                this.clear();
                this.search && this.onSearch();
            }
        },
        showSutta(sutta) {
            this.clear();
            var sections = this.sections = sutta.sections;
            Object.assign(this.support, sutta.support);
            this.metaarea = sutta.metaarea;
            var suttaplex = this.suttaplex = 
                Object.assign(this.suttaplex, sutta.suttaplex);

            var author_uid = this.author_uid = sutta.author_uid;
            var acronym = suttaplex.acronym || suttaplex.uid.toUpperCase();
            var translation = suttaplex.translations
                .filter(t => t.author_uid === author_uid)[0] || {
                lang: this.language,
            };
            this.suttaCode = sutta.suttaCode || '';
            this.language = translation.lang;
            this.translator = translation.author_uid;
            var title = translation.title || suttaplex.translated_title;
            this.sutta.acronym = acronym;
            this.sutta.title = `${acronym}: ${title}`;
            this.sutta.original_title = suttaplex.original_title || "?";
            var seg0 = sections[0].segments[0];
            this.sutta.collection = `${seg0.pli} / ${seg0.en}`;
            this.sutta.author = translation.author;
            this.tracks = sections.map((sect,i) => ({
                sutta_uid: this.sutta_uid,
                title: this.sutta.title,
                language: this.language,
                translator: this.translator,
                iSection: i,
                nSegments: sect.segments.length,
            }));
            this.$nextTick(() => this.$refs.refSutta.focus());
        },
        loadSutta(search) {
            console.log(`search ${search}`);
            var tokens = search.toLowerCase().split('/');
            (tokens.length < 2) && tokens.push(this.scvOpts.lang);
            (tokens.length < 3) && tokens.push('sujato'); // TODO remove sujato
            var url = this.url(`sutta/${tokens.join('/')}`);
            var timer = this.startWaiting();
            this.$http.get(url).then(res => {
                this.showSutta(res.data);
                this.stopWaiting(timer);
            }).catch(e => {
                var data = e.response && e.response.data && e.response.data.error 
                    || `Not found.`;
                this.error.search = {
                    http: e.message,
                    data,
                };
                console.error(e.stack, data);
                this.stopWaiting(timer);
                this.$nextTick(() => this.$refs.refErrorHelp.setFocus());
            });

        },
        url(path) {
            return window.location.origin === 'http://localhost:8080'
                ? `http://localhost/scv/${path}`
                : `./${path}`;
        },
        searchSuttas(search) {
            var uriSearch = encodeURIComponent(search);
            var url = this.url(`search/${uriSearch}`+
                `?maxResults=${this.scvOpts.maxResults}`);
            var timer = this.startWaiting();
            this.$http.get(url).then(res => {
                this.clear();
                var data = res.data;
                console.log('searchResults', data);
                Vue.set(this, 'searchResults', data);
                this.stopWaiting(timer);
                this.$nextTick(() => {
                    if (data.results.length === 1)  {
                        console.log(`searchSuttas(${search}) showSutta`);
                        this.showSutta(data.results[0].sutta);
                    } else {
                        this.$refs.refResults.focus();
                    }
                });
            }).catch(e => {
                var data = e.response && e.response.data && e.response.data.error 
                    || `Not found.`;
                this.error.search = {
                    http: e.message,
                    data,
                };
                console.error(e.stack, data);
                this.stopWaiting(timer);
                this.$nextTick(() => this.$refs.refErrorHelp.setFocus());
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
        translationSearch(translation) {
            var author_uid = translation.author_uid;
            var lang = translation.lang;
            return `${this.sutta_uid}/${lang}/${author_uid}`;
        },
        clickTranslation(translation,event) {
            var search = this.translationSearch(translation);
            console.log(`clickTranslation(${search})`,event);
            this.loadSutta(search);
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
        audioLink(guid, sutta_uid){
            var lang = this.language;
            var trans = this.author_uid;
            var link = `./audio/${guid}`;
            if (sutta_uid) {
                link += `/${this.sutta_uid}-${lang}-${trans}.mp3`;
            }
            return this.url(link);
        },
        sectionAriaLabel(sect) {
            var label =  `Section `;
            if (this.scvOpts.showId) {
                label += 'segment ';
                label += sect.segments[0].scid.split(':')[1];
            }
            label += `${sect.title}`;

            return label;
        },
        searchUrl(pat) {
            var search = encodeURIComponent(pat);
            return `./?r=${Math.random}/#/?`+
                `search=${search}&`+
                `lang=${this.language}`;
        },
    },
    computed: {
        audioUrl() {
            return `https://github.com/sc-voice/sc-voice/wiki/Audio-${this.sutta_uid}`;
        },
        cookies() {
            return document.cookies;
        },
        downloadFile() {
            return `${this.sutta_uid}-${this.language}-${this.author_uid}.mp3`;
        },
        downloadUrl() {
            var usage = ['recite','review'][this.scvOpts.iVoice];
            var ref = `${this.sutta_uid}/${this.language}/${this.author_uid}`;
            return this.url(`download/sutta/${ref}/${usage}`);
        },
        showPali( ){
            var showLang = this.scvOpts && this.scvOpts.showLang || 0;
            return showLang === 0 || showLang === 1;
        },
        showTrans( ){
            var showLang = this.scvOpts && this.scvOpts.showLang || 0;
            return showLang === 0 || showLang === 2;
        },
        sutta_uid() {
            if (this.suttaplex) {
                return this.suttaplex.uid;
            } 
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
        postDownloadFocus() {
            var vSearch = this.$refs.refSearch;
            return vSearch && vSearch.$refs.input;
        },
    },
    mounted() {
        var that = this;
        that.$nextTick(() => {
            var search = that.scvOpts.search;
            console.log(`cookies`, that.$cookie);
            Vue.set(that, 'search', search);
            if (search) {
                console.log(`sutta.mounted() searchSuttas(${search})`);
                that.searchSuttas(search);
            } else {
                console.log(`sutta.mounted() no search`);
            } 
            var FOCUS_SEARCH = false;
            FOCUS_SEARCH && that.$nextTick( () => {
                var vSearch = this.$refs.refSearch;
                var input = vSearch && vSearch.$refs.input;
                if (input) {
                    console.log('selected search', input);
                    input.focus();
                }
            });
        });
    },

    components: {
        ErrorHelp,
        ScvDownloader,
        ScvPlayer,
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
    flex-flow: row ;
    justify-content: space-around;
}
.scv-search-row2 {
    display: flex;
    flex-flow: row ;
    align-items: center;
    justify-content: space-around;
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
    border: 1pt solid #333;
    border-radius: 3pt;
    padding: 0.5em;
}
.scv-search-result:focus-within {
    border: 1pt solid #666;
}
.scv-search-result-summary {
    font-weight: bold;
}
.scv-search-result-lang {
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.5em;
    padding-left: 1.6em;
}
.scv-btn-playing {
    color: var(--accent-color);
}
.scv-search-result-pli {
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: space-between;
    font-style: italic !important;
    padding-left: 1.6em;
    margin-top: 0.5em;
}
.scv-error-help {
    margin: 0em;
}
.scv-error-help > a:hover {
    text-decoration: none;
}
.scv-home-blurb {
    display: flex; 
    flex-flow: column;
    justify-content: space-around; 
    margin-top: 5em;
}
</style>
