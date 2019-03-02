<template>
  <v-app dark>
    <header role="banner">
      <v-toolbar app flat dark role="navigation">
        <a :href="homeHref" @click="clickHome()"
          aria-label="Soota Central Home Page">
          <img aria-hidden="true" class="pt-1"
            style="margin-left: -4px"
            src="img/favicon.png" height=34px/>
        </a>
        <v-toolbar-title style="margin-left:8px">
            <div aria-label="soota central voice"
                aria-role="heading"
                style="position: relative; margin-top:-2px; ">
                <div class="scv-logo-small "
                    aria-hidden="true"
                    @click="clickHome()">SuttaCentral</div>
                <div class="scv-logo-large"
                    aria-hidden=true
                    aria-label="soota central voice"
                    @click="clickHome()">VOICE</div>
            </div>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <ul>
            <li>
                <v-btn id="btnHelp" icon dark class="scv-icon-btn" :style="cssProps"
                  aria-label="About"
                  title="About"
                  @click="openHelp()"
                  >
                  <v-icon>info</v-icon>
                </v-btn>
            </li>
            <li>
                <v-btn id="btnSettings" icon dark class="scv-icon-btn" :style="cssProps"
                  aria-label="Settings"
                  title="Settings"
                  @click="dialogSettings = !dialogSettings"
                  >
                  <v-icon>settings</v-icon>
                </v-btn>
            </li>
        </ul>
      </v-toolbar>
    </header>

    <v-dialog v-model="dialogHelp" persistent max-width="45em">
        <v-card >
          <v-card-title class="title scv-dialog-title">
              About
              <v-spacer/>
              <v-btn id="btnSettings" icon dark class="scv-icon-btn" :style="cssProps"
                aria-label="Close Help"
                @click="closeDialog()"
                >
                <v-icon>close</v-icon>
              </v-btn>
          </v-card-title>
          <v-card-text>
          <span v-html="helpHtml"/>
          </v-card-text>
        </v-card>
    </v-dialog>
    <v-dialog v-model="dialogSettings" fullscreen persistent>
        <v-card>
          <v-card-title class="title scv-dialog-title">
              Settings&nbsp;&nbsp;<span class="scv-version">v{{version}}</span>
              <v-spacer/>
              <v-btn id="btnSettings" icon dark class="scv-icon-btn" :style="cssProps"
                aria-label="Close Settings"
                @click="closeDialog()"
                >
                <v-icon>close</v-icon>
              </v-btn>
          </v-card-title>
          <v-card-text>
            <details class="scv-dialog" >
                <summary class="subheading">Sutta Player settings</summary>
                <div class="scv-settings">
                    <v-radio-group v-model="gscv.iVoice"
                        @change="gscv.changed('iVoice')"
                        column>
                       <v-radio v-for="(v,i) in gscv.voices"
                         :label="v.label" :value="i" :key="`voice${i}`">
                         </v-radio>
                    </v-radio-group>
                    <v-radio-group v-model="gscv.showLang"
                        @change="gscv.changed('showLang')"
                        column>
                       <v-radio v-for="(sl,i) in showLangChoices"
                         :label="sl.label" :value="i" :key="`showLang${sl.value}`">
                         </v-radio>
                    </v-radio-group>
                    <v-radio-group v-model="gscv.ips"
                        @change="gscv.changed('ips')"
                        column>
                       <v-radio v-for="(ips) in ipsChoices"
                         :label="ips.label" :value="ips.value" :key="`ips${ips.value}`">
                         </v-radio>
                    </v-radio-group>
                </div>
            </details>
            <details class="scv-dialog" >
                <summary class="subheading">General settings</summary>
                <div class="scv-settings">
                    <v-radio-group v-if="gscv" v-model="gscv.maxResults"
                        @change="gscv.changed('maxResults')"
                        column>
                       <v-radio v-for="(mr) in maxResultsChoices"
                         :label="mr.label" :value="mr.value" :key="`maxResults${mr.value}`">
                         </v-radio>
                    </v-radio-group>
                    <v-checkbox v-if="gscv"
                        v-model="gscv.showId" role="checkbox"
                        :aria-checked="gscv.showId"
                        v-on:change="gscv.changed('showId')"
                        label="Show SuttaCentral text segment identifiers">
                    </v-checkbox>
                </div>
            </details>
            <v-checkbox v-if="gscv"
                v-model="gscv.useCookies" role="checkbox"
                v-on:change="gscv.changed('useCookies')"
                :aria-checked="gscv.useCookies"
                style="margin-left: 0.8em"
                label="Store settings using web browser cookies ">
            </v-checkbox>
          </v-card-text>
          <v-card-actions>
            <button class="scv-dialog-button" :style="cssProps"
                @click="closeDialog()" >
                Close Settings</button>
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
            aria-label="dedicated to the dark bound for light">
              To <i>the dark bound for light</i>
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
            (async function() {
                console.log('openHelp()');
                that.dialogHelp = true;
                var url = that.url('wiki-aria/Home');
                that.$http.get(url).then(res => {
                    Vue.set(that, "helpHtml", res.data.html);
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
    },
    computed: {
        voice() {
            return this.gscv.voices[this.gscv.iVoice];
        },
        gscv() {
            return this.$root && this.$root.$data;
        },
        showLangChoices() {
            return [{
                label: "Show both Pali text and translated text",
                value: 0,
            },{
                label: "Show only Pali text",
                value: 1,
            },{
                label: "Show only translated text",
                value: 2,
            }];
        },
        homeHref(){
            return `./?r=${Math.random()}#/?`;
        },
        ipsChoices() {
            return this.gscv.ipsChoices;
        },
        maxResultsChoices() {
            return [{
                label: "Return up to 3 search results (fast)",
                value: 3,
            },{
                label: "Return up to 5 search results",
                value: 5,
            },{
                label: "Return up to 10 search results",
                value: 10,
            },{
                label: "Return up to 25 search results",
                value: 25,
            },{
                label: "Return up to 50 search results (slow)",
                value: 50,
            }];
        },
        cssProps() {
            return {
                '--accent-color': this.$vuetify.theme.accent,
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
        this.$nextTick(() => {
            console.debug(`App.mounted(nextTick)`, this.$route.query);
        });
        var query = this.$route.query;
        console.debug('App.mounted() with query:', query);
        if (query) {
            if (!this.gscv.useCookies) {
                query.showId != null &&
                    Vue.set(this.gscv, "showId", query.showId==='true');
                query.iVoice &&
                    Vue.set(this.gscv, "iVoice", Number(query.iVoice||0));
                query.maxResults &&
                    Vue.set(this.gscv, "maxResults", Number(query.maxResults));
                query.showLang &&
                    Vue.set(this.gscv, "showLang", Number(query.showLang||0));
                query.ips != null &&
                    Vue.set(this.gscv, "ips", Number(query.ips));
            }
            var search = query.scid || query.search || '';
            query.search && Vue.set(this.gscv, "search", search);
        }
        Vue.set(this, "user", this.gscv.user);
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
    border: 1pt solid var(--accent-color);
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
    border-color: var(--accent-color);
    outline: 1pt solid var(--accent-color);
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
    background-color: var(--accent-color);
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
    border: 1pt solid #222222;
}
.scv-icon-btn:focus {
    border: 1pt solid var(--accent-color);
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
    border-color: var(--accent-color);
    outline: 1pt solid var(--accent-color);
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
    cursor: default;
    margin-top: -8px;
    font-size: 22px;
    letter-spacing: 1px;
}
.scv-logo-small {
    //cursor: pointer;
    margin-top: 2px;
    font-size: 11px;
    //font-variant: small-caps;
    color: #ce8400;
}
.scv-a {
    color: #ffffff;
}
scv-a-btn {
    color: #ffffff;
    text-decoration: none;
}

header a {
    text-decoration: none;
    color: inherit;
}

header ul {
    list-style-type: none;
    display: inherit;
}

</style>
