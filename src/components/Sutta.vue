<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-left>
          <details v-if="sections && sections[0]" class="scv-header">
            <summary class="subheading scv-header-summary" >
                <span v-for="(seg,i) in sections[0].segments" :key="hs-seg+i" class="title">
                    {{seg.en}}<span v-if="i<sections[0].segments.length-1">&mdash;</span>
                </span>
            </summary>
            <div class="scv-header-body">
                {{sections[0].segments[0].pli}}
                {{sections[0].segments[1].pli}}
            </div>
          </details>
          <details class="scv-section-body" v-for="(sect,i) in sections" :key="sect+i" v-if="i>0">
            <summary class="subheading" >Section {{i}} {{sect.title}}</summary>
            <button>Play</button>
            <div v-for="(seg,j) in sect.segments" :key="seg+j" class="scv-para">
                <div v-show="showId" class='scv-scid'>
                    SC{{seg.scid.split(":")[1]}}
                </div> 
                {{seg.en}}
            </div>
          </details>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>
/* eslint no-console: 0*/

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
        sections: null,
    }
  },
  methods: {
  },
  created() {
    console.debug("hello created");
    this.$http.get('/mn1-expanded.json').then(res => {
        console.log(res);
        this.sections = res.data.sections;
    }).catch(e => {
        console.error(e.stack);
    });

  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
summary::marker {
    display: none;
    color: red;
}
.scv-header-body {
    font-style: italic;
    margin-left: 1.4em;
}
.scv-para {
    margin-top: 0.5em;
    padding-left: 1em;
}
</style>
