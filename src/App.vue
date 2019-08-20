<template>
  <v-app >
    <v-app-bar app flat dark 
      color="grey darken-4"
      aria-role="navigation">
      <a :href="homeHref" @click="clickHome()"
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
      <v-btn id="btnHelp" 
          icon dark class="scv-icon-btn scv-app-icon-btn" :style="cssProps"
          small
          :title="$vuetify.lang.t('$vuetify.scv.aboutTitle')"
          :aria-label="$vuetify.lang.t('$vuetify.scv.ariaAbout')"
          @click="openHelp()">
          <v-icon aria-hidden="true">info</v-icon>
      </v-btn>
      <v-btn id="btnSettings" 
          icon dark class="scv-icon-btn scv-app-icon-btn" :style="cssProps"
          small
          :title="$vuetify.lang.t('$vuetify.scv.settingsTitle')"
          :aria-label="$vuetify.lang.t('$vuetify.scv.ariaSettings')"
          @click="dialogSettings = !dialogSettings">
          <v-icon aria-hidden="true">settings</v-icon>
      </v-btn>
    </v-app-bar>

    <v-dialog v-model="dialogHelp" persistent max-width="45em">
      <v-card >
        <v-card-title class="title scv-dialog-title">
          {{$vuetify.lang.t('$vuetify.scv.aboutTitle')}}
          <v-spacer/>
          <v-btn id="btnSettings" 
            icon small
            dark class="scv-icon-btn" :style="cssProps"
            :aria-label="$vuetify.lang.t('$vuetify.scv.ariaClose')"
            @click="closeDialog()"
            >
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="about-text">
        <span v-html="helpHtml"/>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogSettings" fullscreen persistent>
      <v-card>
        <v-card-title class="headline scv-dialog-title">
          <div>
            <span>{{$vuetify.lang.t('$vuetify.scv.settingsTitle')}}</span>
            &nbsp;
            <span class="scv-version">v{{version}}</span>
          </div>
          <v-spacer/>
          <v-btn id="btnSettings" 
            icon small dark class="scv-icon-btn" :style="cssProps"
            :aria-label="$vuetify.lang.t('$vuetify.scv.ariaClose')"
            @click="closeDialog()"
            >
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <details class="scv-dialog" >
            <summary class="title scv-settings-title">
                {{$vuetify.lang.t('$vuetify.scv.languages')}}
            </summary>
            <div class="scv-settings">
              <v-radio-group v-model="gscv.showLang"
                  @change="gscv.changed('showLang')"
                  column>
                 <v-radio v-for="(sl,i) in showLangChoices"
                   :label="sl.label" :value="i" :key="`showLang${sl.value}`">
                   </v-radio>
              </v-radio-group>
              <div class="subheading scv-settings-subtitle">
                {{$vuetify.lang.t('$vuetify.scv.transLanguage')}}
              </div>
              <v-radio-group v-model="gscv.lang"
                @change="gscv.changed('lang')"
                column>
               <v-radio v-for="lang in gscv.languages"
                 :disabled="lang.disabled"
                 :label="lang.label" :value="lang.name" :key="`lang${lang.name}`">
                 </v-radio>
              </v-radio-group>
              <div class="subheading scv-settings-subtitle">
                {{$vuetify.lang.t('$vuetify.scv.uiLanguage')}}
              </div>
              <v-radio-group v-model="gscv.locale"
                @change="gscv.changed('locale')"
                column>
               <v-radio v-for="lang in gscv.languages"
                 :disabled="lang.disabled"
                 :label="lang.label" :value="lang.name" :key="`lang${lang.name}`">
                 </v-radio>
              </v-radio-group>
            </div>
          </details>
          <details class="scv-dialog" >
            <summary class="title scv-settings-title">
                {{$vuetify.lang.t('$vuetify.scv.reader')}}
            </summary>
            <div class="scv-settings">
              <v-radio-group v-model="gscv.vnameTrans"
                  @change="gscv.changed('vnameTrans')"
                  column>
                 <v-radio v-for="v in gscv.langVoices()"
                   :label="v.label" :value="v.name" :key="`voice${v.name}`">
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
          <details class="scv-dialog" >
            <summary class="title scv-settings-title">
              {{$vuetify.lang.t('$vuetify.scv.bellSound')}}
            </summary>
            <div class="scv-settings">
              <v-radio-group v-model="gscv.ips"
                  @change="gscv.changed('ips')"
                  column>
                 <v-radio v-for="(ips) in ipsChoices"
                   v-if="!ips.hide"
                   :label="ips.label" :value="ips.value" :key="`ips${ips.value}`">
                   </v-radio>
              </v-radio-group>
            </div>
          </details>
          <details class="scv-dialog" >
            <summary class="title scv-settings-title">
              {{$vuetify.lang.t('$vuetify.scv.searchResults')}}
            </summary>
            <div class="scv-settings">
              <v-radio-group v-if="gscv" v-model="gscv.maxResults"
                  @change="gscv.changed('maxResults')"
                  column>
                 <v-radio v-for="(mr) in maxResultsChoices"
                   :label="mr.label" :value="mr.value" :key="`maxResults${mr.value}`">
                   </v-radio>
              </v-radio-group>
            </div>
          </details>
          <details class="scv-dialog" >
            <summary class="title scv-settings-title">
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
            </div>
          </details>
        </v-card-text>
        <v-card-actions>
          <v-btn class="scv-dialog-button" :style="cssProps"
              @click="closeDialog()" >
              {{$vuetify.lang.t('$vuetify.close')}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="scv-content">
        <transition name="fade">
            <div v-if="bgShow" class="scv-background">
            </div>
        </transition>
        <v-content class="" >
            <router-view></router-view>
        </v-content>
    </div>
    <v-footer fixed class="pt-2 pl-2 pr-2 caption" app >
      <div style="margin-top:-0.35em" >
          <a :href="searchUrl('the dark bound for light')"
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
  </v-app>
</template>

<script>
import Vue from "vue";
import Sutta from './components/sutta';
import scvPackage from '../package';
// eslint no-console 0

export default {
    name: 'App',
    components: {
        Sutta
    },
    data () {
        return {
            dialogSettings: false,
            dialogHelp: false,
            focused: {
                'settings': false,
            },
            identity: {
            },
            helpHtml: "(...help...)",
            items: [{
                title:'red',
            },{
                title:'blue',
            },{
                title:'green',
            }],
            title: 'SuttaCentral Voice Assistant',
            bgShow: false,
            user: {},
        }
    },
    methods: {
        clickHome() {
            Vue.set(this.gscv, "search", null);
        },
        onfocus(id) {
            this.focused[id] = true;
        },
        onblur(id) {
            this.focused[id] = false;
        },
        closeDialog() {
            console.log('closeDialog()');
            this.gscv.reload();
        },
        openHelp() {
            var that = this;
            var url = that.url('wiki-aria/Home.md');
            (async function() {
                that.dialogHelp = true;
                if (that.gscv.locale === 'de') {
                    url = that.url('wiki-aria/Home@Deutsch.md');
                }
                console.log(`openHelp(${url})`);
                that.$http.get(url).then(res => {
                    that.helpHtml = res.data.html;
                }).catch(e => {
                    console.error(e.stack);
                });
            })();
        },
        url(path) {
            return window.location.origin === 'http://localhost:8080'
                ? `http://localhost/scv/${path}`
                : `./${path}`;
        },
        searchUrl(pat) {
            var search = encodeURIComponent(pat);
            return `./?r=${Math.random}/#/?`+
                `search=${search}&`+
                `lang=${this.language}`;
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
                label: $vuetify.lang.t('$vuetify.scv.showPaliText'),
                value: 1,
            },{
                label: $vuetify.lang.t('$vuetify.scv.showTransText'),
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
                ch.label = ch.label
                    .replace(/A_NOBELL/, $vuetify.lang.t('$vuetify.scv.noBell'))
                    .replace(/A_PUBLIC/, $vuetify.lang.t('$vuetify.scv.publicDomain'))
                    ;
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
        var query = this.$route.query;
        console.log(`App.mounted() query:`, query);
        this.getVoices();
        this.$nextTick(() => {
            console.debug(`App.mounted(nextTick)`, this.$route.query);
        });
        if (query) {
            if (!this.gscv.useCookies) {
                query.showId != null &&
                    Vue.set(this.gscv, "showId", query.showId==='true');
                query.vnameTrans &&
                    Vue.set(this.gscv, "vnameTrans", query.vnameTrans);
                query.vnameRoot &&
                    Vue.set(this.gscv, "vnameRoot", query.vnameRoot);
                query.maxResults &&
                    Vue.set(this.gscv, "maxResults", Number(query.maxResults));
                query.showLang &&
                    Vue.set(this.gscv, "showLang", Number(query.showLang||0));
                query.ips != null &&
                    Vue.set(this.gscv, "ips", Number(query.ips));
                query.locale != null &&
                    Vue.set(this.gscv, "locale", query.locale);
            }
            var search = query.scid || query.search || '';
            query.search && Vue.set(this.gscv, "search", search);
        }
        Vue.set(this.$vuetify.lang, "current", this.gscv.locale);
        this.user = this.gscv.user;
    },
    created() {
        var that = this;
        setTimeout(() => {
            // The background interferes with legibility
            // that.bgShow = true; // trigger CSS transition
        }, 1000);
        that.version = scvPackage.version;
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
.scv-help {
    margin: 0em;
}
.scv-help > a:hover {
    text-decoration: none;
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

.scv-settings-title {
    margin-top: 0.8em;
}

.scv-settings-subtitle {
    margin-top: 0.3em;
    margin-top: 1em;
}

</style>
