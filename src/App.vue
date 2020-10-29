<template> <v-app >
<v-app-bar app flat dark 
  color="grey darken-4"
  aria-role="navigation">
  <a :href="homeHref" @click="clickHome()"
    class="scv-favicon"
    aria-label="Soota Central Voice">
  <img aria-hidden="true" class="pt-1"
      style="margin-left: -4px"
      src="img/favicon.png" height=34px/>
  </a>
  <v-toolbar-title style="margin-left:8px">
      <div style="position: relative; margin-top:-2px;">
          <div class="scv-logo-small" aria-hidden="true">
              SuttaCentral</div>
          <div class="scv-logo-large" aria-hidden="true">
              VOICE</div>
      </div>
  </v-toolbar-title>
  <v-spacer></v-spacer>
  <v-btn href="https://sc-voice.github.io/sc-voice" target="_blank"
    icon dark small
    class="scv-icon-btn scv-app-icon-btn" :style="cssProps"
    :title="$vuetify.lang.t('$vuetify.scv.aboutTitle')"
    :aria-label="$vuetify.lang.t('$vuetify.scv.ariaAbout')"
    >
      <v-icon aria-hidden="true">info</v-icon>
  </v-btn>
  <div class="scv-more" >
    <v-btn icon
        id="more-menu-btn"
        @click="clickMore()"
        aria-haspopup="true"
        aria-controls="more-menu"
        :aria-label="$vuetify.lang.t('$vuetify.scv.ariaMore')"
        :aria-expanded="moreVisible"
        class="scv-icon-btn" :style="cssProps" small>
        <v-icon>settings</v-icon>
    </v-btn>
    <ul class="scv-more-menu" 
      id = "more-menu"
      ref="ref-more-menu"
      aria-labelledby="more-menu-btn"
      v-if="moreVisible"
      @focusin="focusMore(true)"
      :aria-hidden="!moreVisible">
      <li class="" role="none" >
        <details role="menuitem" 
          @click="clickDetails('lang', $event)"
          :open="showDetail('lang')"
        >
          <summary class="scv-settings-title">
            {{$vuetify.lang.t('$vuetify.scv.uiLanguage')}}
          </summary>
          <div class="scv-settings">
            <v-radio-group v-model="gscv.locale"
              @change="localeChanged()"
              column>
            <v-radio v-for="lang in gscv.languages" 
              :key="`lang${lang.name}`"
              :disabled="lang.disabled"
              :label="lang.label" :value="lang.name" 
              > </v-radio>
            </v-radio-group>
          </div>
        </details>
      </li>
      <li class="" role="none" >
        <details role="menuitem" 
          @click="clickDetails('trans', $event)"
          :open="showDetail('trans')"
        >
          <summary class="scv-settings-title">
              {{$vuetify.lang.t('$vuetify.scv.translation')}}
          </summary>
          <div class="scv-settings">
            <v-checkbox v-model="showPali" role="checkbox"
              :aria-checked="showPali"
              v-on:change="gscv.changed('showLang')"
              :label="$vuetify.lang.t('$vuetify.scv.showPaliText')"
              />
            <v-checkbox v-model="showTrans" role="checkbox"
              :aria-checked="showTrans"
              v-on:change="gscv.changed('showLang')"
              :label="$vuetify.lang.t('$vuetify.scv.showTransText')"
              />
            <v-checkbox v-model="fullLine" role="checkbox"
              :aria-checked="fullLine"
              v-on:change="gscv.changed('fullLine')"
              :label="$vuetify.lang.t('$vuetify.scv.showLineByLine')"
              />
            <div class="subheading scv-settings-subtitle">
              {{$vuetify.lang.t('$vuetify.scv.transLanguage')}}
            </div>
            <v-radio-group v-model="gscv.lang"
              @change="langChanged()"
              column>
             <v-radio v-for="lang in gscv.transLanguages"
               :disabled="lang.disabled"
               :label="lang.label" :value="lang.name" :key="`lang${lang.name}`">
               </v-radio>
            </v-radio-group>
          </div>
        </details>
      </li>
      <li class="" role="none" >
        <details role="menuitem"
          @click="clickDetails('reader', $event)"
          :open="showDetail('reader')"
          >
          <summary class="scv-settings-title">
              {{$vuetify.lang.t('$vuetify.scv.reader')}}
          </summary>
          <div class="scv-settings">
            <v-radio-group v-model="gscv.vnameTrans"
                @change="gscv.changed('vnameTrans')"
                column>
               <v-radio v-for="v in gscv.langVoices()"
                 :label="v.label" :value="v.name" 
                 :key="`voice${v.name}`">
                 </v-radio>
            </v-radio-group>

            <div class="subheading scv-settings-subtitle">
              {{$vuetify.lang.t('$vuetify.scv.rootLanguage')}}
            </div>
            <v-radio-group v-model="gscv.vnameRoot"
                @change="gscv.changed('vnameRoot')"
                column>
               <v-radio v-for="v in gscv.langVoices('pli')"
                 :label="v.label" :value="v.name" :key="`voice${v.name}`">
                 </v-radio>
            </v-radio-group>
          </div>
        </details>
      </li>
      <li class="" role="none" >
        <details role="menuitem" 
          @click="clickDetails('sound', $event)"
          :open="showDetail('sound')"
          >
          <summary class="scv-settings-title">
            {{$vuetify.lang.t('$vuetify.scv.bellSound')}}
          </summary>
          <div class="scv-settings" v-if="gscv">
            <v-radio-group v-model="gscv.ips" 
                @change="gscv.changed('ips')"
                column>
               <v-radio v-for="(ips) in ipsChoices.filter(ips=>!ips.hide)"
                 :label="ips.label" :value="ips.value" 
                 :key="`ips${ips.value}`">
                 </v-radio>
            </v-radio-group>
          </div>
        </details>
      </li>
      <li class="" role="none" >
        <details role="menuitem" 
          @click="clickDetails('search', $event)"
          :open="showDetail('search')"
          >
          <summary class="scv-settings-title">
            {{$vuetify.lang.t('$vuetify.scv.searchResults')}}
          </summary>
          <div class="scv-settings" v-if="gscv">
            <v-radio-group v-model="gscv.maxResults"
                @change="gscv.changed('maxResults')"
                column>
               <v-radio v-for="(mr) in maxResultsChoices"
                 :label="mr.label" :value="mr.value" 
                 :key="`maxResults${mr.value}`">
                 </v-radio>
            </v-radio-group>
          </div>
        </details>
      </li>
      <li class="" role="none" >
        <details role="menuitem" 
          @click="clickDetails('audio', $event)"
          :open="showDetail('audio')"
          >
          <summary class="scv-settings-title">
            {{$vuetify.lang.t('$vuetify.scv.audio')}}
          </summary>
          <div class="scv-settings" v-if="gscv">
            <v-radio-group v-model="gscv.audio"
              v-on:change="gscv.changed('audio')"
              row>
              <v-radio label="Opus" :value="gscv.AUDIO_OPUS" > </v-radio>
              <v-radio label="Ogg" :value="gscv.AUDIO_OGG" > </v-radio>
              <v-radio label="MP3" :value="gscv.AUDIO_MP3" > </v-radio>
            </v-radio-group>
          </div>
        </details> <!-- General -->
      </li>
      <li class="" role="none" >
        <details role="menuitem" 
          @click="clickDetails('general', $event)"
          :open="showDetail('general')"
          >
          <summary class="scv-settings-title">
            {{$vuetify.lang.t('$vuetify.scv.general')}}
          </summary>
          <div class="scv-settings" v-if="gscv">
            <v-checkbox v-model="gscv.showId" role="checkbox"
              :aria-checked="gscv.showId"
              v-on:change="gscv.changed('showId')"
              :label="$vuetify.lang.t('$vuetify.scv.showTextSegmentIds')"
              />
            <v-checkbox v-model="gscv.useCookies" role="checkbox"
              v-on:change="gscv.changed('useCookies')"
              :aria-checked="gscv.useCookies"
              :label="$vuetify.lang.t('$vuetify.scv.storeSettingsInCookies')"
              />
            <span class="scv-version">v{{version}}</span>
          </div>
        </details> <!-- General -->
      </li>
      <li class="text-center settings-close" role="none">
        <v-btn id="btnSettings" 
          small
          class="scv-text-button"
          dark :style="cssProps"
          :aria-label="$vuetify.lang.t('$vuetify.scv.ariaClose')"
          @click="focusMore(false,$event)"
          >
          {{$vuetify.lang.t('$vuetify.close')}}
        </v-btn>
      </li>
    </ul> <!-- scv-more-menu -->
  </div> <!-- scv-more -->
</v-app-bar>

<div class="scv-content">
    <transition name="fade">
        <div v-if="bgShow" class="scv-background">
        </div>
    </transition>
    <v-content class="" >
        <router-view></router-view>
    </v-content>
    <div class="scv-more-backdrop" v-if="moreVisible"
      @click="clickBackdrop()"
      >
    </div> <!-- scv-more-backdrop -->
</div>
<v-footer fixed class="pt-2 pl-2 pr-2 caption" app >
  <div style="margin-top:-0.35em" >
      <a :href="searchDedicated"
        class="scv-a"
        :aria-label="$vuetify.lang.t('$vuetify.scv.ariaDedicated')"
        >
          <i>
          {{$vuetify.lang.t('$vuetify.scv.dedicated')}}
          </i>
      </a>
  </div>
  <v-spacer/>
  <div class="pl-2" style="margin-top:-0.35em" >
    {{user.username}}
    <router-link class="scv-a-btn" to="/app"
        v-if="isAuth" aria-hidden=true >
        <v-btn icon
            :class="userBtnClass" :style="cssProps" small>
            <v-icon>supervisor_account</v-icon>
        </v-btn>
    </router-link>
    <router-link class="scv-a-btn" to="/auth"
        v-else aria-hidden=true >
        <v-btn icon
            class="scv-icon-btn" :style="cssProps" small>
            <v-icon>supervisor_account</v-icon>
        </v-btn>
    </router-link>
  </div>
</v-footer>
</v-app> </template>

<script>
import Vue from "vue";
import scvPackage from '../package';
// eslint no-console 0

const ZEROWIDTHSPACE = '\u200b';

export default {
    name: 'App',
    components: {
    },
    data () {
        return {
            openDetail: null,
            focused: {
                'settings': false,
            },
            identity: {
            },
            items: [{
                title:'red',
            },{
                title:'blue',
            },{
                title:'green',
            }],
            title: 'SuttaCentral Voice Assistant',
            bgShow: false,
            moreVisible: false,
            moreFocus: false,
            user: {},
            authors: {},
            transLanguages: [],
        }
    },
    methods: {
      clickDetails(id, evt) {
        Vue.set(this, "openDetail", 
          id === this.openDetail ? undefined : id);
        evt.preventDefault();
      },
      showDetail(id) {
        return this.openDetail === id;
      },
      langChanged() {
          this.gscv.changed('lang');
          this.gscv.checkVoiceLang();
      },
      localeChanged() {
          this.gscv.changed('locale');
          this.gscv.reload();
      },
      clickHome() {
          Vue.set(this.gscv, "search", null);
      },
      focusMore(focus) {
          this.moreFocus = focus;
          setTimeout(()=>{
              if (!this.moreFocus) {
                  this.moreVisible = false;
              }
          }, 500);
      },
      clickBackdrop(){
          this.focusMore(false);
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
      onfocus(id) {
          this.focused[id] = true;
      },
      onblur(id) {
          this.focused[id] = false;
      },
      url(path) {
          var origin = window.location.origin;
          return origin.endsWith(':8080') 
            ? `${origin.substring(0, origin.length-5)}/scv/${path}` 
            : `./${path}`;
      },
      searchUrl(pat) {
          var search = encodeURIComponent(pat);
          return `./?r=${Math.random}/#/?`+
              `search=${search}&`+
              `lang=${this.gscv.lang}`;
      },
      getAuthors() {
          var that = this;
          var {
              gscv,
          } = that;
          var url = this.url(`authors`);
          this.$http.get(url).then(res => {
              var authors = res.data;
              gscv.authors = authors;
              var langs = Object.keys(authors).map(a => authors[a].lang);
              var langNames = {
                  pt: true,
                  ja: true,
              };
              gscv.transLanguages = gscv.languages.filter(l => 
                  langs.indexOf(l.name) >= 0 || langNames[l.name]);
              console.log(`authors`, gscv.authors, gscv.transLanguages);
          }).catch(e => {
              console.error(e.stack);
          });
      },
      getVoices() {
          var that = this;
          var url = this.url(`voices`);
          this.$http.get(url).then(res => {
              var voices = res.data;
              that.gscv.voices = res.data;
              console.log(`voices`, voices);
          }).catch(e => {
              console.error(e.stack);
          });
      },
    },
    computed: {
        showPali: {
            get: function() {
                let gscv = this.gscv;
                return gscv.showLang === gscv.SHOWLANG_BOTH ||
                    gscv.showLang === gscv.SHOWLANG_PALI;
            },
            set: function(value) {
                let gscv = this.gscv;
                switch (gscv.showLang) {
                case gscv.SHOWLANG_PALI:
                    Vue.set(gscv, "showLang", value 
                        ? gscv.SHOWLANG_PALI
                        : gscv.SHOWLANG_TRANS);
                    break;
                case gscv.SHOWLANG_TRANS:
                    Vue.set(gscv, "showLang", value 
                        ? gscv.SHOWLANG_BOTH
                        : gscv.SHOWLANG_TRANS);
                    break;
                default:
                case gscv.SHOWLANG_BOTH:
                    Vue.set(gscv, "showLang", value 
                        ? gscv.SHOWLANG_BOTH 
                        : gscv.SHOWLANG_TRANS);
                    break;
                }
            },
        },
        fullLine: {
          get: function() {
            let gscv = this.gscv;
            return gscv.fullLine;
          },
          set: function(value) {
            let gscv = this.gscv;
            Vue.set(gscv, "fullLine", value);
          },
        },
        showTrans: {
            get: function() {
                let gscv = this.gscv;
                return gscv.showLang === gscv.SHOWLANG_BOTH ||
                    gscv.showLang === gscv.SHOWLANG_TRANS;
            },
            set: function(value) {
                let gscv = this.gscv;
                switch (gscv.showLang) {
                case gscv.SHOWLANG_PALI:
                    Vue.set(gscv, "showLang", value 
                        ? gscv.SHOWLANG_BOTH
                        : gscv.SHOWLANG_PALI);
                    break;
                case gscv.SHOWLANG_TRANS:
                    Vue.set(gscv, "showLang", value 
                        ? gscv.SHOWLANG_TRANS
                        : gscv.SHOWLANG_PALI);
                    break;
                default:
                case gscv.SHOWLANG_BOTH:
                    Vue.set(gscv, "showLang", value 
                        ? gscv.SHOWLANG_BOTH 
                        : gscv.SHOWLANG_PALI);
                    break;
                }
            },
        },
        searchDedicated() {
            var searchLang = this.$vuetify.lang.t(
                '$vuetify.scv.dedicatedSearch');
            return this.searchUrl(searchLang);
        },
        voice() {
            return this.gscv.voices.filter(v => v.name === this.gscv.vnameTrans)[0];
        },
        gscv() {
            return this.$root && this.$root.$data;
        },
        showLangChoices() {
            var {
                $vuetify,
              } = this;
            return [{
                label: $vuetify.lang.t('$vuetify.scv.showPaliTransText'),
                value: 0,
            },{
                label: $vuetify.lang.t('$vuetify.scv.showOnlyPaliText'),
                value: 1,
            },{
                label: $vuetify.lang.t('$vuetify.scv.showOnlyTransText'),
                value: 2,
            }];
        },
        homeHref(){
            return `./?r=${Math.random()}#/?`;
        },
        ipsChoices() {
            var {
                gscv,
                $vuetify,
            } = this;
            return gscv.ipsChoices.map(ch => {
                ch.label = $vuetify.lang.t(`$vuetify.scv.${ch.i18n}`);
                return ch;
            });
        },
        maxResultsChoices() {
            var tmplt = this.$vuetify.lang.t('$vuetify.scv.returnSearchResults');
            return [5,10,25,50].map(n => ({
              label: tmplt.replace(/A_COUNT/, n),
              value: n,
            }));
        },
        cssProps() {
            return {
                'margin': '0',
            };
        },
        isAuth() {
            var cr = this.$route;
            return cr && cr.path==='/auth' || false;
        },
        userBtnClass() {
            return this.user.isAdmin
                ? "scv-icon-btn deep-orange darken-3"
                : "scv-icon-btn indigo darken-2";
        },
        goSuttaCentral() {
            //window.open("https://suttacentral.net","_blank");
            return null;
        },

    },
    mounted() {
        this.getVoices();
        this.getAuthors();
        this.user = this.gscv.user;
    },
    created() {
        var that = this;
        setTimeout(() => {
            // The background interferes with legibility
            // that.bgShow = true; // trigger CSS transition
        }, 1000);
        that.version = scvPackage.version.replace(/\./g, `.${ZEROWIDTHSPACE}`);
    }
}
</script>
<style >
a {
    text-decoration: none;
    padding-left: 0.2em;
    padding-right: 0.2em;
}
a:visited {
    //color: #ffffff !important;
}
a:hover {
    text-decoration: underline;
}
.scv-icon-btn:focus {
    border-radius:5px;
    border: 1pt solid #82B1FF;
}
.scv-dialog-button {
    border-radius: 5px;
    border: 1pt solid #888;
    padding-left: 0.4em;
    padding-right: 0.4em;
    text-align: center;
    margin-left: 1.2em;
}
.scv-dialog-button:focus {
    border-color: #82B1FF;
    outline: 1pt solid #82B1FF;
}
.scv-dialog-title {
    border-bottom: 1pt solid white;
}
details.scv-dialog {
    margin-left: 1em;
}
summary {
    padding-left: 0.2em;
    padding-right: 0.2em;
}
button {
    background-color: #82B1FF;
}
.scv-content {
    position: relative;
    height: 100%;
    width: 100%;
}
.scv-version {
    padding-top: 0.6em;
    font-size: small;
}
.scv-background {
    position: absolute;
    bottom: 35px;
    background-image: url("/img/lotus.png") ;
    background-size: 350px 200px;
    background-repeat: no-repeat;
    background-position: center bottom;
    opacity: 1;
    height: 100%;
    width: 100%;
}
.scv-settings {
    margin-left: 1em;
}
.scv-icon-btn {
    margin: 0;
    border-radius:5px;
    border: 1pt solid #303030;
}
.scv-icon-btn:focus {
    border: 1pt solid #82B1FF;
}
.scv-app-icon-btn {
    border: 1pt solid #222222;
}
.scv-text-button {
    border-radius: 4px;
    border: 1pt solid #888;
    padding-left: 0.4em;
    padding-right: 0.4em;
    text-align: center;
    margin-left: 1.2em;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
}
.scv-text-button:focus {
    border-color: #82B1FF;
    outline: 1pt solid #82B1FF;
}
.fade-enter-active, .fade-leave-active {
    transition: opacity 10s linear !important;
}
.fade-enter {
    opacity: 0;
}
.scv-logo-large {
    //cursor: default;
    margin-top: -8px;
    font-size: 22px;
    letter-spacing: 1px;
}
.scv-logo-small {
    //cursor: pointer;
    margin-top: 2px;
    font-size: .6em;
    //font-variant: small-caps;
    color: #ce8400;
}
.scv-a {
    color: #ffffff !important;
}
scv-a-btn {
    color: #ffffff;
    text-decoration: none;
}

nav ul {
    list-style-type: none;
    display: inherit;
}

.about-text a {
    color: #ce8400;
}

.scv-settings {
    padding-top: 0.4em;
    padding-left: 0.8em;
}

.scv-settings-title {
    margin-top: 0.1em;
    font-size: 120%;
    font-weight: 500;
}
.scv-favicon{
    border-radius: 5pt;
}
.scv-favicon:focus {
    border-color: #82B1FF;
    outline: 1pt solid #82B1FF;
    padding-left: 5px;
}

.scv-settings-title:focus {
    border-color: #82B1FF;
    outline: 1pt solid #82B1FF;
}

.scv-settings-subtitle {
    margin-bottom: 0.1em;
    font-weight: 500;
}
.scv-matched {
    color: #ff4;
    font-style: italic;
}
.scv-more {
    position: relative;
}
.scv-more > a {
    color: #fff;
}
.scv-more-menu {
    position: absolute;
    list-style: none;
    top: 3em;
    right: 0;
    min-width: 23em;
    text-align: left;
    border-top: 1pt solid #888;
    padding-top: 0.5em;
    padding-bottom: 1em;
    border: 1pt solid #555;
    border-right: 1pt solid #555;
    border-bottom: 1pt solid #555;
    border-radius: 2pt;
    background-color: #282727;
}
.settings-close {
    margin-top: .7em;
    margin-bottom: -0.3em;
    margin-left:-1.5em;
}
.scv-more-backdrop {
    position: fixed;
    background-color: rgba(0,0,0,0.7);
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

@media print {
  .v-btn,
  .scv-icon-btn {
    display: none;
  }
}

</style>
