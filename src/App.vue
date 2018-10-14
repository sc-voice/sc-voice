<template>
  <v-app dark>
    <v-toolbar app flat dark >
      <img src="/favicon.png" height=30px/>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn tabindex=-1 id="btnSettings" icon dark class="scv-icon-btn" :style="cssProps"
        aria-label="Settings"
        @click="dialogSettings = !dialogSettings"
        >
        <v-icon>settings</v-icon>
      </v-btn>
    </v-toolbar>
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
                <summary class="subheading">Content settings</summary>
                <div class="scv-settings">
                    <v-checkbox v-if="scvOpts" 
                        v-model="scvOpts.showId" role="checkbox" 
                        :aria-checked="scvOpts.showId"
                        label="Show SuttaCentral text segment identifiers">
                    </v-checkbox>
                </div>
            </details>
            <details class="scv-dialog" >
                <summary class="subheading">Voice settings</summary>
                <div class="scv-settings">
                    <v-radio-group v-model="scvOpts.iVoice" column>
                       <v-radio v-for="(v,i) in scvOpts.voices" 
                         :label="v.label" :value="i" :key="`voice${v.value}`">
                         </v-radio>
                    </v-radio-group>
                </div>
            </details>
            <details class="scv-dialog" >
                <summary class="subheading">Search settings</summary>
                <div class="scv-settings">
                    <v-radio-group v-if="scvOpts" v-model="scvOpts.maxResults" column>
                       <v-radio v-for="(mr) in maxResultsChoices" 
                         :label="mr.label" :value="mr.value" :key="`maxResults${mr.value}`">
                         </v-radio>
                    </v-radio-group>
                </div>
            </details>
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
        <v-content class="">
          <Sutta />
        </v-content>
    </div>
    <v-footer fixed>
      <div class="pl-2">{{scvOpts.scid}}</div>
      <v-spacer/>
      <v-btn id="btnSettings" icon dark class="scv-icon-btn" :style="cssProps"
        aria-label="Settings"
        @click="dialogSettings = !dialogSettings"
        >
        <v-icon>settings</v-icon>
      </v-btn>
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
        }
    },
    methods: {
        onfocus(id) {
            this.focused[id] = true;
        },
        onblur(id) {
            this.focused[id] = false;
        },
        closeDialog() {
            console.log('closeDialog()');
            this.scvOpts.reload();
        },
    },
    computed: {
        voice() {
            return this.scvOpts.voices[this.scvOpts.iVoice];
        },
        scvOpts() {
            return this.$root && this.$root.$data;
        },
        maxResultsChoices() {
            return [{
                label: "Return up to 3 search results",
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
            }];
        },
        cssProps() {
            return {
                '--accent-color': this.$vuetify.theme.accent,
            };
        },
    },
    mounted() {
        this.$nextTick(() => {
            console.debug(`App.mounted(nextTick)`, this.$route.query);
        });
        var query = this.$route.query;
        console.debug('App.mounted() with query:', query);
        if (query) {
            query.iVoice && Vue.set(this.scvOpts, "iVoice", Number(query.iVoice));
            query.maxResults && Vue.set(this.scvOpts, "maxResults", 
                Number(query.maxResults));
            query.showId != null && 
                Vue.set(this.scvOpts, "showId", query.showId==='true');
            var search = query.scid || query.search || '';
            query.search && Vue.set(this.scvOpts, "search", search);
        }
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
    //color: #ffcc66 !important;
    color: #ffffff !important;
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
    background-color: var(accentColor);
}
:focus {
    background-color: #000 !important;
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

</style>
