<template>
<div>
<v-progress-linear v-model="waiting" height="4"
  v-if="waiting > 0"
  aria-hidden="true"
  background-color="#000"
  style="width:100%; margin-top:0"
/>
<v-container fluid class="scv-sutta" v-if="examples.length">
  <v-layout column align-left >
    <div class="scv-search-row">
      <div class="scv-search-col">
        <h1 class="title " style="font-size: 18px !important">
          {{$vuetify.lang.t("$vuetify.scv.exploreBuddhasTeaching")}}
        </h1>
        <div class="scv-search-field" role="search">
          <v-autocomplete v-if="examples"
            ref="refSearchAuto"
            v-model="search"
            :items="searchItems"
            :search-input.sync="search"
            :filter="searchFilter"
            clearable
            @input="onSearchInput($event)"
          ></v-autocomplete>
          <v-text-field v-if="false" ref="refSearch"
            :placeholder="searchLabel"
            v-model="search" v-on:keypress="onSearchKey($event)"
            @click:append="onSearchKey()"
            append-icon="search"
            flat single-line
            >
          </v-text-field>
          </div>
          <div class="scv-inspire-row">
            <v-btn @click="clickInspireMe()"
              role="button"
              :aria-label="$vuetify.lang.t('$vuetify.scv.ariaInspireMe')"
              :disabled="!examples.length"
              class="scv-inspire " :style="cssVars" small>
              {{$vuetify.lang.t('$vuetify.scv.inspireMe')}}
            </v-btn>
          </div>
          <div class="scv-sutta-menubar mb-3" v-if="showSuttaMenuBar">
            <div>
              <v-btn icon small fab v-if="playable"
                @click="playSearchText()"
                :title="$vuetify.lang.t('$vuetify.scv.speakSearchText')"
                :disabled="!playSearch.signature"
                class="scv-icon-btn" :style="cssVars" >
                <v-icon>chat_bubble_outline</v-icon>
              </v-btn>
              <v-btn icon small fab v-if="playable"
                  :disabled="waiting > 0"
                  @click="launchSuttaPlayer()"
                  ref="refPlaySutta"
                  :aria-label="ariaPlaySutta(resultId(), stats.seconds)"
                  class="scv-icon-btn" :style="cssVars" >
                  <v-icon>play_circle_outline</v-icon>
              </v-btn>
              <v-btn icon v-if="playable"
                  @click="downloadBuild()"
                  :aria-label="`${ariaDownload} ${resultId()}`"
                  class="scv-icon-btn" :style="cssVars" small>
                  <v-icon>arrow_downward</v-icon>
              </v-btn>
            </div>
            <div class="mt-2" aria-hidden='true'>
                {{duration(stats.seconds).display}}
            </div>
            <div class="scv-more" >
              <v-btn icon
                  id="more-menu-btn"
                  @click="clickMore()"
                  aria-haspopup="true"
                  aria-controls="more-menu"
                  :aria-label="$vuetify.lang.t('$vuetify.scv.ariaMore')"
                  :aria-expanded="moreVisible"
                  class="scv-icon-btn" :style="cssVars" small>
                  <v-icon>more_vert</v-icon>
              </v-btn>
              <ul class="scv-more-menu" role="menu"
                id = "more-menu"
                ref="ref-more-menu"
                aria-labelledby="more-menu-btn"
                v-if="moreVisible"
                @focusin="focusMore(true)"
                @focusout="focusMore(false)"
                :aria-hidden="!moreVisible">
                <li class="" 
                    v-for="(audio,i) in supportedAudio" 
                    role="none"
                    :key="`moreaudio${i}`" >
                    <a class="scv-a" :href="audio.url" 
                        :aria-label="ariaOpensInNewTab(audio.source)"
                        role="menuitem"
                        target="_blank">
                        <span aria-hidden="true">
                            <v-icon class="ml-2" small>headset</v-icon>
                            {{audio.source}}
                        </span>
                    </a>
                </li>
                <li class="" 
                    v-for="(audio,i) in unsupportedAudio" 
                    role="none"
                    :key="`moreaudio${i}`" >
                    <a class="scv-a" :href="audio.url" 
                        role="menuitem"
                        :aria-label="ariaOpensInNewTab(audio.source)"
                        target="_blank">
                        <span aria-hidden="true">
                            <v-icon class="ml-2" style="color:#888" small>
                                format_list_bulleted
                            </v-icon>
                            <i>{{audio.source}}</i>
                        </span>
                    </a>
                </li>
                <li class="" role="none" >
                  <a class="scv-a" 
                    :href="`https://suttacentral.net/${sutta_uid}`"
                    role="menuitem"
                    :aria-label="$vuetify.lang.t('$vuetify.scv.ariaSuttaCentralNewTab')"
                    target="_blank">
                    <span aria-hidden="true">
                      <v-icon class="ml-2" small>notes</v-icon>
                      <i>SuttaCentral.net</i>
                    </span>
                  </a>
                </li>
              </ul> <!-- scv-more-menu -->
            </div> <!-- scv-more -->
          </div>
        </div>
      </div>
      <scv-downloader v-if="playable"
        ref="refScvDownloader"
        :urlBuild="urlBuild"
        :urlDownload="urlDownload"
        :filename="downloadFile"
        :focusElement="postDownloadFocus"
        />
      <div v-if="error.search" class="scv-error" >
          <error-help ref="refErrorHelp" :title="errorSummary"
            :search="search"
            :httpError="error.search.http" />
          <v-btn icon @click="error.search=null"
            class="scv-icon-btn" :style="cssVars"
            :aria-label="$vuetify.lang.t('$vuetify.scv.ariaDismissError')"
            >
            <v-icon>clear</v-icon>
          </v-btn>
      </div>
      <details v-show="searchResults" open>
        <summary v-if="resultCount"
            role="main"
            ref="refResults"
            aria-level="1"
            :aria-label="ariaFoundSuttas(resultCount, playlistDuration.aria)"
            class='title pt-1 pb-1'>
            <span aria-hidden=true>
                {{$vuetify.lang.t('$vuetify.scv.foundSuttas')
                    .replace(/A_RESULTCOUNT/,resultCount)
                    .replace(/A_SEARCH/, search)}}
                ({{playlistDuration.display}})
            </span>
        </summary>
        <summary v-else
            role="main" ref="refResults"
            aria-level="1" 
            :aria-label="$vuetify.lang.t('$vuetify.dataIterator.noResultsText')"
            class='title'>
            {{$vuetify.lang.t('$vuetify.dataIterator.noResultsText')}}
        </summary>
        <div class="scv-playlist ml-3 pt-2 pl-3" 
          v-if="gscv.voices.length" >
          <v-btn icon small fab v-if="playable"
              @click="playSearchText()"
              :title="$vuetify.lang.t('$vuetify.scv.speakSearchText')"
              :disabled="!playSearch.signature"
              class="scv-icon-btn" :style="cssVars" >
              <v-icon>chat_bubble_outline</v-icon>
          </v-btn>
          <v-btn icon v-if="playable"
              @click="playAll()"
              :title="$vuetify.lang.t('$vuetify.scv.playAll')"
              class="scv-icon-btn" :style="cssVars" small>
              <v-icon>play_circle_outline</v-icon>
          </v-btn>
          <v-btn icon v-if="playable"
              @click="downloadBuild()"
              :aria-label="`${ariaDownload} ${resultId()}`"
              class="scv-icon-btn" :style="cssVars" small>
              <v-icon>arrow_downward</v-icon>
          </v-btn>
        </div>
        <details role="heading" aria-level="2"
            v-for="(result,i) in (searchResults && searchResults.results||[])"
            :key="`${result.uid}_${i}`"
            class="scv-search-result" :style="cssVars">
            <summary class="scv-search-result-summary">
                <div style="display: inline-block; width: 96%; ">
                    <div style="display:flex; justify-content: space-between; ">
                        <div v-html="resultTitle(result)"></div>
                        <div class="caption" 
                            :aria-label="duration(result.stats.seconds).aria">
                           {{duration(result.stats.seconds).display}}
                        </div>
                    </div>
                </div>
            </summary>
            <div v-if="gscv.showId" class="scv-search-result-scid scv-scid">
                SC&nbsp;{{result.quote.scid}}
            </div>
            <div v-if="result.quote && showPali && result.quote.pli"
                class="scv-search-result-pli">
                <div>
                    <div v-html="result.quote.pli"></div>
                </div>
            </div>
            <div v-if="result.quote && showTrans && result.quote[language]"
                class="scv-search-result-lang">
                <div>
                    <span v-html="result.quote[gscv.lang]"></span>
                    <div v-if="gscv.showId" class='scv-scid'>
                        &mdash;
                        {{result.author}} 
                    </div>
                </div>
            </div>
            <div class="ml-3 pt-2" 
                style="display:flex; justify-content: space-between">
                <div>
                    <v-btn icon v-if="result.quote && playable"
                        @click="playQuotes(i, result)"
                        :class="btnPlayQuotesClass(i)" :style="cssVars" small>
                        <v-icon>chat_bubble_outline</v-icon>
                    </v-btn>
                    <v-btn icon v-if="result.quote && playable"
                        @click="playOne(result)"
                        class="scv-icon-btn" :style="cssVars" small>
                        <v-icon>play_circle_outline</v-icon>
                    </v-btn>
                    <v-btn icon v-if="result.quote"
                        :href="resultLink(result)"
                        class="scv-icon-btn" :style="cssVars" small>
                        <v-icon>open_in_new</v-icon>
                    </v-btn>
                    <v-btn icon v-if="playable"
                        @click="downloadBuild(resultRef(result))"
                        :aria-label="`${ariaDownload} ${resultId()}`"
                        class="scv-icon-btn" :style="cssVars" small>
                        <v-icon>arrow_downward</v-icon>
                    </v-btn>
                </div>
                <div class="scv-score">
                    {{$vuetify.lang.t('$vuetify.scv.relevance')}}
                    {{score(result)}}
                </div>
            </div>
        </details><!-- search result i -->
      </details><!-- searchresults -->

      <details v-if="sections && sections[0]" class="scv-header">
        <summary class="subheading scv-header-summary" >
            <span v-html="suttaTitle"></span>
        </summary>
        <div class="scv-blurb">{{sutta.blurb}}</div>
        <div class="title pt-4 pb-2 text-center">
            <div>{{this.sutta.titles[0]}}</div>
            {{sutta.original_title}}
        </div>
        <div class="subtitle font-italic pt-1 pb-3 text-center">
            {{$vuetify.lang.t("$vuetify.scv.translatedBy")}}
            {{sutta.author}}
        </div>
        <div class="scv-blurb"><span v-html="metaarea"></span></div>
      </details>
      <details class="scv-section-body"
        v-for="(sect,i) in sections1" :key="`sect${i}`" >
        <summary class="subheading" 
            :aria-label="sectionAriaLabel(sect)"><div 
                style="display:inline-block; width:94%;">
                <div style="display:flex; justify-content: space-between">
                    <div v-html="sect.title"
                        class="section-title" 
                        style="display:inline" 
                    />
                    <div v-if="gscv.showId" class='scv-scid'>
                        {{section_scid(sect)}}
                    </div>
                </div>
            </div>
        </summary>
        <div class="scv-play-controls" v-if="gscv.voices.length">
            <button v-if="playable"
                :disabled="waiting > 0"
                @click="launchSuttaPlayer(i+1)"
                class="scv-text-button mt-3"
                :style="cssVars"
                >
                {{playSectionText(i+2)}}
                ({{voice.name}})
            </button>
        </div>
        <div v-if="error[i+1]" class="scv-error"
            style="margin-left: 1.2em" >
          <div>
            <span class="subheading">{{error[i+1].data}}</span>
            <br>
            <span class="font-italic">{{error[i+1].http}}</span>
          </div>
          <v-btn icon @click="error[i+1]=null" class="scv-icon-btn" :style="cssVars"
            aria-label="Dismiss Error">
            <v-icon>clear</v-icon>
          </v-btn>
        </div>
        <div v-for="(seg,j) in sect.segments" :key="seg+j" 
            :class="segClass(seg)">
            <div class="scv-seg" :style="cssVars">
                <div v-html="segmentPali(seg)" v-if="showPali"
                  class="scv-seg-pali" :style="cssVars">
                </div>
                <div v-html="segmentLang(seg)" v-if="showTrans"
                  class="scv-seg-lang" :style="cssVars">
                </div>
                <div v-show="gscv.showId" class='scv-scid' 
                    style="display:inline-block;">
                    {{segment_scid(seg)}}
                </div>
            </div>
        </div>
      </details> <!-- section i -->
      <scv-player v-if="tracks && playable"
        :ref="`refScvPlayer`" 
        :tracks="tracks" 
        :voice="voice"
        :time="stats"
        :closeFocus="playerCloseFocus"
        />
    </v-layout>
  </v-container>
</div>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";
const { PaliHyphenator } = require("js-ebt");
import ScvDownloader from "./scv-downloader";
import ErrorHelp from "./error-help";
import ScvPlayer from "./scv-player";
const MAX_SECTIONS = 100;
const ZEROWIDTHSPACE = '\u200b';
const PAT_ZWS_ug = new RegExp(ZEROWIDTHSPACE, "ug");

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
            playSearch: {},
            examples: [],
            hasAudio: true,
            moreVisible: false,
            moreFocus: false,
            testFlag: true,
            search: '',
            sectionAudioGuids,
            searchResults: null,
            refPlaying: null,
            suttaAudioGuid: null,
            stats: {},
            support: {
                value: '(n/a)',
                descriptions: '(n/a)',
            },
            supportedAudio: [],
            unsupportedAudio: [],
            language: 'en',
            urlBuild: '',
            urlDownload: '',
            sutta: {},
            suttaplex: {},
            suttaCode: '',
            metaarea: '',
            sections: null,
            tracks: null,
            translator: 'sujato',
            waiting: 0,
            searchButtons: false,
            hyphenator: new PaliHyphenator({
              //hyphen: "-",
              maxWord: 20,
              minWord: 5,
            }),
        }
        return that;
    },
    methods: {
        searchFilter(item, queryText, itemText) {
          let it = itemText.toLowerCase();
          let qt = queryText.toLowerCase();
          return it.indexOf(qt) >= 0;
        },
        playSectionText(section) {
          var tmplt = this.$vuetify.lang.t("$vuetify.scv.playSection");
          return tmplt.replace('A_SECTION', section);
        },
        focusMore(focus) {
            this.moreFocus = focus;
            setTimeout(()=>{
                if (!this.moreFocus) {
                    console.log('hiding more menu');
                    this.moreVisible = false;
                }
            }, 500);
        },
        clickMore() {
            this.moreVisible = !this.moreVisible;
            if (this.moreVisible) {
                this.moreFocus = true;
                this.$nextTick(() => {
                    var a1 = this.$refs['ref-more-menu'];
                    var ali = a1.childNodes;
                    for (var i = 0; i < ali.length; i++) {
                        var li = ali[i];
                        if (li.style.display !== 'none') {
                            var a = li.childNodes[0];
                            a.focus();
                            break;
                        }
                    }
                });
            }
        },
        async getExamples(n=3) { try {
          var lang = this.gscv.lang;
          var url = this.url(`examples/${n}?lang=${lang}`);
          var res = await this.$http.get(url);
          var examples = res.data;
          console.log(`loaded examples`, url);
          return examples
            .sort((a,b)=>a.toLowerCase().localeCompare(b.toLowerCase()));
        } catch(e) {
          console.error(e.stack);
        }},
        async clickInspireMe() {
          var { examples } = this;
          var iExample = Math.trunc(Math.random() * examples.length);
          this.clear();
          this.search = examples[iExample];
          this.onSearch();
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
        downloadUrl(search, build) {
            if (this.gscv.voices == null) {
                return "downloadUrl-unavailable";
            }
            var langs = [];
            this.showPali && langs.push('pli');
            this.showTrans && langs.push(this.gscv.lang);
            var vnameTrans = this.voice.name;
            var prefix = build ? 'build-download' : 'download';
            var urlPath = `${prefix}/${this.gscv.audio}/${langs.join('+')}`
            search = encodeURIComponent(search || this.suttaRef());
            var url = `${urlPath}/${vnameTrans}/${search}`;
            if (this.showPali) {
                var vnameRoot = this.gscv.vnameRoot;
                url = `${urlPath}/${vnameTrans}/${search}/${vnameRoot}`;
            }
            return this.url(url);
        },
        updatePlaySearch(search, searchResults) {
          var that = this;
          var {
            results,
            searchLang,
          } = searchResults || {};
          var {
            quote,
          } = results && results[0] || {};
          quote = quote || {};
          var langQuote = quote[searchLang] || '';
          var word = langQuote.split(/[<>]/)[2];
          var urlWord = that.url(`play/word/${searchLang}/Aditi/${word}`);
          if (word) {
            that.$http.get(urlWord).then(res => {
              var playSearch = res.data || {};
              console.log(`updatePlaySearch ${search}: `, playSearch);
              Vue.set(this, "playSearch", playSearch);
            }).catch(e => {
                console.error(e.stack);
            });
          }
        },
        playSearchText() {
          var that = this;
          var {
            signature,
            langTrans,
          } = that.playSearch || {};
          var urlAudio = this.url([
            `audio`,
            `word`,
            `${langTrans}`,
            `ms`,
            `Aditi`,
            signature.guid,
          ].join('/'));
          window.open(urlAudio, "_blank");
        },
        downloadBuild(search=this.search) {
            var elt = this.$refs['refScvDownloader'];
            var downloading = this.$vuetify.lang.t('$vuetify.scv.buildingAudio');
            console.log(`downloadBuild()`, downloading, search);
            Vue.set(this, "urlBuild", this.downloadUrl(search, true));
            Vue.set(this, "urlDownload", this.downloadUrl(search, false));
            elt && this.$nextTick(()=>elt.update(downloading));
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
        suttaTracks(result) {
            var sutta = result.sutta;
            var tracks = sutta.sections.reduce((acc,sect,i) => {
                acc.push({
                    sutta_uid: sutta.sutta_uid,
                    title: sutta.suttaTitle,
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
            Vue.set(this.stats, 'seconds', result.stats.seconds);
            this.tracks = this.suttaTracks(result);
            this.launchSuttaPlayer();
        },
        playAll() {
            var seconds = 0;
            var results = this.searchResults.results;
            this.tracks = results.reduce((acc,r) => {
                seconds += r.stats.seconds;
                return acc.concat(this.suttaTracks(r));
            }, []);
            Vue.set(this.stats, 'seconds', seconds);
            this.launchSuttaPlayer();
        },
        getResultAudio(result) {
            var that = this;
            return new Promise((resolve, reject) => { try {
                var scid = result.quote.scid || 'getResultAudio_error1';
                var segmentRef = [
                    scid.split(':')[0],
                    result.lang,
                    result.author_uid,
                    scid,
                    this.gscv.vnameTrans,
                    this.gscv.vnameRoot,
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
                    var lang = that.gscv.lang || that.language;
                    var dsa = data.segment.audio;
                    if (that.showPali && dsa.pli) {
                        links.push(that.audioLink(data, "pli"));
                    }
                    if (that.showTrans && dsa[lang]) {
                        links.push(that.audioLink(data, lang));
                    }
                    var audio = links.map(link => new Audio(link));
                    var handler0 = () => {
                        audio[0] && audio[0].removeEventListener("ended", handler0);
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
                    if (audio[0] != null) {
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
                    }

                    //Vue.set(result, "audio", data.segment.audio);
                    console.log(`playQuotes audio:`, data.segment.audio);
                }
            } catch(e) {
                console.log(`playQuotes`, e.stack);
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
                    var audio = that.$refs[ref] && that.$refs[ref][0];
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
                var c = 0.99;
                var waiting = (that.waiting||1) * c + (1-c)*100;
                that.waiting = waiting;
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
            this.waiting = 0;
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
        onSearchInput(value) {
          console.log(`onSearchInput`, value, this.search);
          this.onSearchChange();
        },
        onSearchChange() {
          console.log("searching...", this.search);
          this.clear();
          this.search && this.onSearch();
        },
        onSearchKey(event={key:"Enter"}) {
          event.key === "Enter" && this.onSearchChange();
        },
        showSutta(sutta, stats={}) {
            var that = this;
            this.clear();
            Vue.set(this.stats, 'seconds', stats.seconds);
            console.log(`showSutta`, sutta, this.stats);
            var sections = this.sections = sutta.sections;
            Object.assign(this.support, sutta.support);
            this.metaarea = sutta.metaarea;
            var suttaplex = Object.assign({}, this.suttaplex, 
              sutta.suttaplex);
            this.suttaplex = suttaplex;

            this.author_uid = sutta.author_uid;
            var suid = suttaplex.uid && suttaplex.uid.toUpperCase() || 
                "NOSUID";
            var acronym = suttaplex.acronym || suid;
            this.suttaCode = sutta.suttaCode || '';
            this.language = sutta.lang;
            this.translator = sutta.author_uid;
            this.sutta.blurb = sutta.blurb || sutta.suttaplex.blurb;
            this.sutta.acronym = acronym;
            this.sutta.titles = sutta.titles;
            this.sutta.title = this.suttaTitle;
            this.sutta.original_title = suttaplex.original_title || "?";
            var seg0 = sections[0] && sections[0].segments[0] || {};
            this.sutta.collection = `${seg0.pli} / ${seg0.en}`;
            this.sutta.author = sutta.author || sutta.author_id;
            var {
                sutta_uid,
                language,
                translator,
                hyphenator,
            } = this;
            this.tracks = sections.map((sect,i) => {
              var segments = sect.segments;
              segments.forEach(seg=> {
                if (seg.pli) {
                  seg.pli = seg.pli.split(" ").map(word=>{
                    var hword = hyphenator.hyphenate(word);
                    return hword;
                  }).join(" ");
                }
              });
              return {
                sutta_uid,
                title: this.sutta.title,
                language,
                translator,
                iSection: i,
                nSegments: sect.segments.length,
                segments,
              };
            });
            ['pli', language].forEach(lang => {
                var url = that.url(`/audio-urls/${sutta_uid}`);
                that.$http.get(url).then(res => {
                    that.supportedAudio = res.data.filter(a=>a.supported);
                    that.unsupportedAudio = res.data.filter(a=>!a.supported);
                    console.log(`supportedAudio`, that.supportedAudio);
                    console.log(`unsupportedAudio`, that.unsupportedAudio);
                }).catch(e => {
                    console.error('supported audio:', url, e.stack, lang);
                });
            });
            this.$nextTick(() => {
                var refPlaySutta = this.$refs.refPlaySutta;
                if (refPlaySutta) {
                    console.log('focus refPlaySutta');
                    refPlaySutta.$el.focus();
                } else {
                    console.log("no refPlaySutta");
                }
            });
        },
        url(path) {
          var origin = window.location.origin;
          return origin.endsWith(':8080') 
            ? `${origin.substring(0, origin.length-5)}:3000/scv/${path}` 
            : `./${path}`;
        },
        searchSuttas(search) {
            var uriSearch = encodeURIComponent(search);
            var lang = this.gscv.lang;
            var url = this.url(`search/${uriSearch}/${lang}`+
                `?maxResults=${this.gscv.maxResults}`);
            var timer = this.startWaiting();
            this.$http.get(url).then(res => {
                this.clear();
                var data = res.data;
                console.log('searchResults', data);
                data.results.sort((a,b) => b.score - a.score);
                this.searchResults = data;
                this.updatePlaySearch(search, data);
                this.stopWaiting(timer);
                this.$nextTick(() => {
                    if (data.results.length === 1)  {
                        var d = data.results[0];
                        var sutta = d.sutta;
                        console.log(`searchSuttas(${search}) showSutta`, 
                          sutta);
                        this.showSutta(sutta, d.stats);
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
            this.gscv.reload({
                search: this.search,
            });
        },
        segClass(seg) {
            var cls = 'scv-para ';
            seg.expanded && (cls += "scv-para-expanded ");
            seg.matched && (cls += "scv-para-matched ");
            return cls;
        },
        resultRef(result) {
            return this.suttaRef(result.uid, result.lang, result.author_uid);
        },
        resultLink(result) {
            return this.gscv.url({
                search: this.resultRef(result),
                lang: result.lang,
            });
        },
        translationLink(trans) {
            return this.gscv.url({
                search: this.suttaRef(this.sutta_uid, trans.lang, trans.author_uid),
            });
        },
        audioLink(data, lang){
            var {
                translator,
                segment,
                sutta_uid,
            } = data;
            var audio = segment.audio;
            var guid = audio[lang];
            var vname = lang === 'pli' 
                ? audio.vnamePali || this.gscv.vnameRoot
                : audio.vnameTrans || this.voice.name;
            var link = `./audio/${sutta_uid}/${lang}/${translator}/${vname}/${guid}`;
            //if (sutta_uid) {
                //link += `/${this.sutta_uid}-${lang}-${trans}.mp3`;
            //}
            return this.url(link);
        },
        sectionAriaLabel(sect) {
            var label =  `Section `;
            if (this.gscv.showId) {
                label += 'segment ';
                label += sect.segments[0].scid.split(':')[1];
            }
            label += `${sect.title}`;

            return label;
        },
        segmentPali(seg) {
            var segLang = seg.pli;
            return segLang 
                ? segLang.replace(/\n/g,'</br>') : '';
        },
        segmentLang(seg) {
            var segLang = seg[this.language];
            return segLang 
                ? segLang.replace(/\n/g,'</br>') : '';
        },
        searchUrl(pat) {
            var search = encodeURIComponent(pat);
            return `./?r=${Math.random}/#/?`+
                `search=${search}&`+
                `lang=${this.language}`;
        },
        suttaRef(suid = this.sutta_uid, lang = this.language, auid = this.author_uid) {
            return `${suid}/${lang}/${auid}`;
        },
        segment_scid(seg) {
            var scid = seg.scid || "section_scid_error1";
            return scid.replace(/^an/,'AN')
                .replace(/^th/,'Th')
                .replace(/^mn/,'MN')
                .replace(/^dn/,'DN')
                .replace(/^sn/,'SN')
            ;
        },
        section_scid(sect={}) {
            var seg0 = sect.segments && sect.segments[0] || {};
            return this.segment_scid(seg0);
        },
        resultId(result) {
            var id = result
                ? result.uid || result.suttaplex && result.suttaplex.acronym
                : this.sutta_uid;
            var idchars = [];
            var number = /[0-9.]/;
            for (var i=0; i<id.length; i++) {
                var c = id.charAt(i);
                var iend = idchars.length-1;
                if (number.test(idchars[iend]) && number.test(c)) {
                    idchars[iend] += c;
                } else {
                    idchars.push(c);
                }
            }
            return idchars.join(ZEROWIDTHSPACE);
        },
        playerCloseFocus() {
            var refClose = this.$refs.refPlaySutta;
            return refClose && refClose.$el;
        },
        score(result = {}) {
            return result.score
                ? (Math.round(result.score * 100) / 100)
                    .toLocaleString(this.gscv.locale)
                : result.count || '--';
        },
        duration(t) {
            return this.gscv.durationDisplay(t);
        },
        ariaPlaySutta(resultId, seconds) {
            var search = (this.search||'').toLocaleUpperCase();
            var suttaId = resultId.replace(PAT_ZWS_ug,'')
              .toLocaleUpperCase();
            var point = this.$vuetify.lang.t('$vuetify.scv.point');
            var duration = this.duration(seconds).aria;
            var tmplt = this.$vuetify.lang.t('$vuetify.scv.ariaPlaySutta');
            var result = tmplt.replace(/A_DURATION/, duration);
            var searchIsId = search.localeCompare(suttaId) === 0
                || search.indexOf(suttaId) === 0;
            if (searchIsId) {
                result = result.replace(/A_SEARCH.*A_SUTTAID/, 
                    suttaId.replace(/\./ug,` ${point} `));
            } else {
                result = result.replace(/A_SEARCH/, search)
                .replace(/A_SUTTAID/, suttaId);
            }
            return result;
        },
        ariaOpensInNewTab(source) {
            var tmplt = this.$vuetify.lang.t("$vuetify.scv.ariaOpensInNewTab");
            var text = tmplt.replace("A_SOURCE", source);
            return text;
        },
        ariaFoundSuttas(resultCount, duration) {
            //:aria-label="`Found ${resultCount} sootas ${playlistDuration.aria}`"
            var tmplt = this.$vuetify.lang.t("$vuetify.scv.ariaFoundSuttas");
            var text = tmplt
                .replace("A_SEARCH", this.search)
                .replace("A_RESULTCOUNT", resultCount)
                .replace("A_DURATION", duration);
            return text;

        },
        transLabel(key) {
            var vueLang = this.$vuetify.lang;
            var current = vueLang.current;
            vueLang.current = this.gscv.lang;
            var label = this.$vuetify.lang.t(key);
            vueLang.current = current;
            return label;
        },
        resultTitle(result) {
            return [
                this.resultId(result).toUpperCase(),
                result.title,
            ].join(` \u2022 `);
        },
    },
    computed: {
        searchItems() {
          var slt = (this.search||'').toLowerCase();
          var examples = slt
            ? this.examples.filter(ex=>ex.toLowerCase().indexOf(slt)>=0)
            : this.examples;
          return !slt || examples.includes(this.search) 
            ? [ ...examples ]
            : [`${this.search}`, ...examples];
        },
        segTextWidth() {
          var {
            showPali,
            showTrans,
            fullLine,
          } = this;
          var wide = window.innerWidth > 600;
          var segTextWidth = !fullLine && wide && showPali && showTrans 
            ? "48%" : "100%";
          return segTextWidth;
        },
        cssVars() {
          return {
            "--seg-text-width": this.segTextWidth,
            '--success-color': this.$vuetify.theme.success,
          }
        },
        sections1() {
            return this.sections && this.sections.slice(1) || [];
        },
        searchLabel() {
            return this.transLabel('$vuetify.scv.search');
        },
        otherAudioUrl() {
            return `https://github.com/sc-voice/sc-voice/wiki/Audio-${this.sutta_uid}`;
        },
        cookies() {
            return document.cookies;
        },
        downloadFile() {
            return `${this.sutta_uid}`;
        },
        fullLine() {
            return this.gscv && this.gscv.fullLine;
        },
        showPali( ){
          var showLang = this.gscv && this.gscv.showLang || 0;
          return showLang === 0 || showLang === 1;
        },
        showTrans( ){
          var showLang = this.gscv && this.gscv.showLang || 0;
          return showLang === 0 || showLang === 2;
        },
        sutta_uid() {
            var query = this.$route.query;
            var search = query && query.search || '';
            var suttaplex = this.suttaplex;
            if (suttaplex) {
                var uid = suttaplex.uid;
                if (uid) {
                    return uid;
                }
            }
            var tokens = search.split('/');
            return tokens[0];
        },
        voice() {
            if (this.gscv == null) {
                throw new Error("voice_error1");
            }
            if (this.gscv.voices == null) {
                throw new Error("voice_error2");
            }
            if (this.gscv.voices.length == 0) {
                throw new Error("voice_error3");
            }
            var voice = this.gscv.voices.filter(v => {
                var vnameTrans = this.gscv.vnameTrans;
                return vnameTrans 
                    && v.name.toLowerCase() === vnameTrans.toLowerCase();
            })[0];
            return voice || {
                name: `voice_error4_${this.gscv.vnameTrans}`,
            };
        },
        gscv() {
            return this.$root.$data;
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
        resultCount() {
            var sr = this.searchResults;
            return sr && sr.results.length || 0;
        },
        suttaTitle() {
            // standard title
            var titles = this.sutta.titles;
            if (titles) {
                var trimTitles = titles.slice(1)
                    .filter(t => t.length);

                return [ this.resultId().toUpperCase(), ...trimTitles ]
                    .join(' \u2022 ');
            }

            // legacy titles
            var titleParts = this.sutta.title.split(':');
            if (titleParts.length > 1) {
                titleParts[0] = this.resultId().toUpperCase();
                return titleParts.join(": ");
            } else {
                return titleParts[0];
            }
        },
        playlistDuration() {
            var results = this.searchResults && this.searchResults.results;
            if (results) {
                var seconds = results.reduce((acc,r) => {
                    var stats = r.stats;
                    return (acc + (stats && stats.seconds || 0))
                }, 0);
                return this.gscv.durationDisplay(seconds);
            }
            return {};
        },
        langQuote(seg) {
            return seg[this.gscv.lang] || seg.en || '(n/a)';
        },
        segmentCount() {
            var results = this.searchResults && this.searchResults.results;
            if (results) {
                return results.reduce((acc,r) => {
                    return acc + r.nSegments;
                }, 0);
            } else if (this.sections) {
                return this.sections.reduce((acc,sect) => {
                    return acc + sect.segments.length;
                }, 0);
            } else {
                return 0;
            }
        },
        audioType() {
          let gscv = this.gscv;
          return {
            [gscv.AUDIO_OPUS]: 'audio/opus',
            [gscv.AUDIO_OGG]: 'audio/ogg',
            [gscv.AUDIO_MP3]: 'audio/mp3',
          }[gscv.audio] || gscv.AUDIO_OPUS;
        },
        ariaDownload() {
            return this.$vuetify.lang.t("$vuetify.scv.ariaDownload");
        },
        showSuttaMenuBar() {
            return this.waiting<=0 && 
              this.sutta_uid && 
              !this.searchResults && 
              this.gscv.voices.length;
        },
        playable() {
          let { gscv, } = this;
          if (gscv.voices.length === 0) {
            return false;
          }
          return gscv.voices.some(v=>v.langTrans === this.gscv.lang);
        },
    },
    mounted() {
        var that = this;
        var {
            $route,
            $cookie,
        } = that;
        var init = () => {
          var search = that.gscv.search;
          var query = $route.query;
          if (Object.keys(query).length === 2) {
              console.log(`sutta.mounted() SC`, $cookie, query);
          } else {
              console.log(`sutta.mounted() Voice`, $cookie, query);
          }
          that.search = search;
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
                  console.log('sutta.mounted() selected search', input);
                  input.focus();
              }
          });
          this.getExamples(0).then(examples=>{
            Vue.set(that, "examples", examples);
          });
        };

        // TODO: wait for voices to show up
        setTimeout(() => {
          if (that.gscv.voices && that.gscv.voices.length) {
            console.log(`sutta.mounted() voices available`);
            init();
          } else {
            console.log(`sutta.mounted() voices not available`);
            setTimeout(() => init(), 500);
          }
        }, 100);
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
    margin-top: 0.6em;
    margin-left: 0.2em;
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
    padding-top: 0.5em;
    margin-left: .75em;
    padding-left: .75em;
    padding-bottom: 0.2em;
}
.scv-para-expanded {
    padding-right: 1em;
    border-right: 2pt solid #444;
}
.scv-para-matched {
    border-left: 1px solid #ff4;
}
.scv-playlist {
    margin-top: 0.5em;
    display: flex;
    justify-content: flex-start;
    align-items: center;
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
.scv-search-col {
    display: flex;
    flex-flow: column ;
    align-items: flex-start;
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
.scv-search {
    line-height: 1 !important;
    color: red;
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
    color: #82B1FF;
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
.scv-search-result-scid {
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: space-between;
    font-style: italic !important;
    padding-left: 2.5em;
    margin-top: 0.5em;
    margin-bottom: -0.7em;
    text-transform: uppercase;
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
.scv-search-field {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    margin-right: 1em;
}
.scv-inspire {
    margin-left: 1px;
    border-radius: 4px;
    text-align: center;
    margin-bottom: 1em;
    text-transform: none;
    font-size: 12px;
    border: 1px solid #383838;
    height: 24px;
    background: #212121 !important;
}
.scv-inspire:focus {
    border: 1pt solid #888;
    border-color: #82B1FFa;
    outline: 1pt solid #82B1FF;
}
.scv-inspire-row {
    margin: -0.8em 0 0.5em 0;
    display: flex;
    justify-content: center;
    width: 100%;
}

.scv-sutta a {
  text-decoration: none;
}

.scv-sutta-menubar {
    display:flex; 
    justify-content:space-between;
    width: 100%;
}
.scv-more {
    position: relative;
    font-size: larger;
}
.scv-more > a {
    color: #fff;
}
.scv-more-menu {
    position: absolute;
    list-style: none;
    top: 2em;
    right: 0;
    min-width: 20em;
    text-align: left;
    border-top: 1pt solid #888;
    padding: 1em;
    background-color: #212121;
}
.scv-menu-header {
    margin-top: 0.5em;
    font-size: 10px;
    text-align: left;
}
.scv-score {
    color: #888;
    margin-top: 0.5em;
}
.scv-subheading{
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    min-width: 40em;
}
.scv-seg {
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  justify-content: space-between;
  align-items: flex-start;
}
@media print {
  .scv-search-row,
  .scv-icon-btn,
  .scv-text-button,
  .scv-inspire {
    display: none;
  }
  .scv-para-matched {
    border-left: 1px solid #eee;
  }
  .title,
  .subtitle,
  .scv-subheading,
  .subheading,
  .scv-seg {
    color: black;
  }
}

.scv-seg-pali {
  width: var(--seg-text-width);
  color: #c0c0c0;
  display:inline-block;
  vertical-align: top;
  font-style: italic;
}

.scv-seg-lang {
  width: var(--seg-text-width);
  display:inline-block;
  vertical-align: top;
}

.section-title {
 font-style: italic;
}

</style>
