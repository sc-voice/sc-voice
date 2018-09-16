<template>
  <v-app dark>
    <v-toolbar app flat dark >
      <img src="/favicon.png" height=30px/>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn id="btnSettings" icon dark class="scv-icon-btn" :style="cssProps"
        aria-label="Settings"
        @click="dialogSettings = !dialogSettings"
        >
        <v-icon>settings</v-icon>
      </v-btn>
    </v-toolbar>
    <v-dialog v-model="dialogSettings" fullscreen persistent>
        <v-card>
          <v-card-title class="title scv-dialog-title">
              Settings
              <v-spacer/>
              <v-btn id="btnSettings" icon dark class="scv-icon-btn" :style="cssProps"
                aria-label="Close"
                @click="dialogSettings = false"
                >
                <v-icon>close</v-icon>
              </v-btn>
          </v-card-title>
          <v-card-text>
            <details class="scv-dialog" >
                <summary class="subheading">Content</summary>
                <v-checkbox v-model="showId" role="checkbox" :aria-checked="showId"
                    label="Show SuttaCentral text segment identifiers">
                </v-checkbox>
            </details>
          </v-card-text>
          <v-card-actions>
            <button class="scv-dialog-button" :style="cssProps"
                @click="dialogSettings=false" >
                Close </button>
          </v-card-actions>
        </v-card>
    </v-dialog>
    <transition name="fade">
        <div v-if="bgShow" class="scv-background">
            <v-content class="">
              <Sutta :showId="showId"/>
            </v-content>
        </div>
    </transition>
  </v-app>
</template>

<script>
import Sutta from './components/Sutta'

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
            showId: false,
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
    },
    computed: {
        cssProps() {
            return {
                '--accent-color': this.$vuetify.theme.accent,
            };
        },
    },
    created() {
        setTimeout(() => {
            this.bgShow = true; // trigger CSS transition
        }, 1);
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
.scv-background {
    background-image: url("/img/buddha-head.png") ;
    background-repeat: no-repeat;
    background-position: center bottom;
    opacity: 1;
    height: 100%;
}
.fade-enter-active, .fade-leave-active {
    transition: opacity 2s linear !important;
}
.fade-enter {
    opacity: 0;
}

</style>
