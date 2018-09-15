<template>
  <v-container fluid class="scv-sutta">
      <v-layout column align-left >
          <div class="scv-search-row">
              <v-text-field placeholder="Enter sutta id" 
                  v-model="search" 
                  label = "Search" ></v-text-field>
              <v-btn icon @click="onSearch()" class="scv-icon-btn" :style="cssProps"
                aria-label="Search Suttas">
                <v-icon>search</v-icon>
              </v-btn>
              <v-btn icon @click="search=''" class="scv-icon-btn" :style="cssProps"
                aria-label="Clear Search">
                <v-icon>clear</v-icon>
              </v-btn>
          </div>
          <div tabindex=0 v-if="error.search" class="error scv-error" >
              <div>
                {{error.search.data.error}}
                <br>
                <span class="font-italic">{{error.search.http}}</span>
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
          <details class="scv-section-body" v-for="(sect,i) in sections" :key="`sect${i}`" v-if="i>0">
            <summary class="subheading" >
                Section {{i}} 
                <div v-show="showId" class='scv-scid'>
                    SC&nbsp;{{sect.segments[0].scid.split(":")[1]}}
                </div> 
                <i>{{sect.title}}</i>
            </summary>
            <button :ref="`play${i}`" @click="recite(i)"
                class="scv-text-button" :style="cssProps">
                Recite Section {{i}}
            </button>
            <div tabindex=0 v-if="error[i]" class="error scv-error" >
              <div>
                {{error[i].data.error}}<br>
                <span class="font-italic">{{error[i].http}}</span>
              </div>
              <v-btn icon @click="error[i]=null" class="scv-icon-btn" :style="cssProps"
                aria-label="Dismiss Error">
                <v-icon>clear</v-icon>
              </v-btn>
            </div>
            <div v-for="(seg,j) in sect.segments" :key="seg+j" class="scv-para">
                <div v-show="showId" class='scv-scid'>
                    SC&nbsp;{seg.scid.split(":")[1]}}
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

export default {
    name: 'Sutta',
    props: {
        msg: String,
        showId: {
            default: true,
        },
    },
    data: function( ){
        return {
            search: null,
            error: {},
            sections: null,
        }
    },
    methods: {
        recite(iSection) {
            console.debug("recite", iSection);
            var url = `/scv/recite/section/${this.search}/sujato/${iSection}`;
            this.$http.get(url).then(res => {
                console.log(res.data);
                //this.sections = res.data.sections;
            }).catch(e => {
                this.error[iSection] = {
                    http: e.message,
                    data: e.response.data,
                }
                console.error(e.stack, e.response.data);
            });
        },
        onSearch() {
            console.debug("search", this.search);
            var url = `/scv/sutta/${this.search}/en/sujato`;
            Object.keys(this.error).forEach(key => {
                Vue.set(this.error, key, null);
            });
            this.$http.get(url).then(res => {
                this.sections = res.data.sections;
            }).catch(e => {
                this.error.search = {
                    http: e.message,
                    data: e.response.data,
                };
                console.error(e.stack, e.response.data.error);
            });

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
    width: 40em;
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
    padding-left: 1em;
    margin-bottom: 0.2em;
}
.scv-sutta {
    width: 40em;
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
}
.scv-icon-btn:focus {
    border-radius:5px;
    border: 1pt solid var(--accent-color);
}
.scv-error {
    border-bottom-left-radius: .5em;
    border-bottom-right-radius: .5em;
    padding-left: 0.5em;
    padding-right: 0.5em;
    margin-bottom: 1em;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: larger;
}
.scv-sutta-col {
    border: 1pt solid red;
}
</style>
