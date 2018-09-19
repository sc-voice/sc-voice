<template>
  <v-container fluid class="scv-sutta">
      <v-layout column align-left >
          <div class="scv-search-row">
              <v-text-field placeholder="Enter sutta id" 
                  v-model="search" :change="onSearchChange()" v-on:keypress="onSearchKey($event)"
                  label = "Search" ></v-text-field>
              <v-btn icon @click="onSearch()" v-if="searchButtons" 
                class="scv-icon-btn" :style="cssProps"
                aria-label="Search Suttas">
                <v-icon>search</v-icon>
              </v-btn>
              <v-btn icon @click="search=''" v-if="searchButtons" 
                class="scv-icon-btn" :style="cssProps"
                aria-label="Clear Search">
                <v-icon>clear</v-icon>
              </v-btn>
          </div>
          <div v-if="error.search" class="scv-error" >
              <div>
                <div class="title">{{this.search}}</div>
                <div>{{error.search.data}}</div>
                <search-help :httpError="error.search.http" />
              </div>
              <v-btn icon @click="error.search=null" class="scv-icon-btn" :style="cssProps"
                aria-label="Dismiss Error">
                <v-icon>clear</v-icon>
              </v-btn>
          </div>
          <details v-if="sections && sections[0]" class="scv-header">
            <summary class="subheading scv-header-summary" >
                <span v-for="(seg,i) in sections[0].segments" :key="`hs-seg${i}`" class="title">
                    {{seg.en}}<span v-if="i<sections[0].segments.length-1">&mdash;</span>
                </span>
            </summary>
            <div class="scv-header-body" dark>
                {{sections[0].segments[0].pli}}
                {{sections[0].segments[1].pli}}
            </div>
          </details>
          <details class="scv-section-body" 
            v-for="(sect,i) in sections" :key="`sect${i}`" 
            v-if="i>0">
            <summary class="subheading" >
                Section {{i}} 
                <div v-show="showId" class='scv-scid'>
                    SC&nbsp;{{sect.segments[0].scid.split(":")[1]}}
                </div> 
                <i>{{sect.title}}</i>
            </summary>
            <div class="scv-play-controls">
                <audio v-if="audioGuids[i]" controls class="ml-4 mt-1" 
                    preload=auto
                    :aria-label="`play section ${i}`">
                    <source :src="`./audio/${audioGuids[i]}`" type="audio/mp3"/>
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
                <div v-show="showId" class='scv-scid'>
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
        voice: {
            name: 'default voice',
            value: 'recite',
        },
        showId: {
            default: true,
        },
    },
    data: function( ){
        var error = {
            search: null,
        };
        var audioGuids = [];
        for (var i = 0; i < MAX_SECTIONS; i++) {
            error[i] = null;
            audioGuids[i] = null;
        }
        var that = {
            search: null,
            error,
            audioGuids,
            sections: null,
            suttaId: null,
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
                this.audioGuids[i] = null;
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
            var voice = this.voice.value;
            if (voice !== 'recite' && voice !== 'review' && voice !== 'navigate') {
                voice = 'recite';
            }
            var url = `./${voice}/section/${suttaId}/${language}/${translator}/${iSection}?g=${g}`;
            Vue.set(this, "waiting", true);
            this.$http.get(url).then(res => {
                Vue.set(this.audioGuids, iSection, res.data.guid);
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
                this.onSearch();
            }
        },
        onSearchChange() {
            console.log(`searchChanged search:${this.search}`);
        },
        onSearch() {
            var search = this.search.trim();
            console.debug("search", search);
            var url = `./sutta/${search}/en/sujato`;
            Object.keys(this.error).forEach(key => {
                Vue.set(this.error, key, null);
            });
            this.$http.get(url).then(res => {
                this.clear();
                this.sections = res.data.sections;
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
        segClass(seg) {
            return seg.expanded ? "scv-para scv-para-expanded" : "scv-para";
        },
    },
    computed: {
        cssProps() {
            return {
                '--accent-color': this.$vuetify.theme.accent,
            }
        },
    },
    created() {
    },

    components: {
        SearchHelp,
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
button {
    background-color: var(accentColor);
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
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
    max-width: 40em;
    padding-left: auto;
    padding-right: auto;
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
</style>
