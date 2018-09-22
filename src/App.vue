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
                @click="dialogSettings = false"
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
        cssProps() {
            return {
                '--accent-color': this.$vuetify.theme.accent,
            };
        },
    },
    mounted() {
        this.$nextTick(() => {
            console.log('App mounted');
            var query = this.$route.query;
            if (query) {
                query.iVoice && Vue.set(this.scvOpts, "iVoice", Number(query.iVoice));
                query.showId != null && 
                    Vue.set(this.scvOpts, "showId", query.showId==='true');
                query.scid && Vue.set(this.scvOpts, "scid", query.scid);
            }
        });
    },
    created() {
        var that = this;
        setTimeout(() => {
            this.bgShow = true; // trigger CSS transition
        }, 1000);
        this.version = scvPackage.version;
    }
}
</script>
<style >
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
    bottom: 32px;
    background-image: url("/img/lotus.png") ;
    background-repeat: no-repeat;
    background-position: center bottom;
    opacity: 1;
    height: 100%;
    width: 100%;
}
.scv-settings {
    margin-left: 1em;
}
.fade-enter-active, .fade-leave-active {
    transition: opacity 10s linear !important;
}
.fade-enter {
    opacity: 0;
}

</style>
