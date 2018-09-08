<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <blockquote>
          <details v-for="(sect,i) in sections" :key="sect+i">
            <summary >section {{i+1}}</summary>
            <p v-for="(seg,j) in sect.segments" :key="seg+j" class="scv-text">
                <span aria-hidden="true" class='scv-scid'>{{seg.scid.split(":")[1]}}</span> 
                {{seg.en}}
            </p>
          </details>
          <footer>
            <small>
              <em>&mdash;MN1</em>
            </small>
          </footer>
        </blockquote>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>
/* eslint no-console: 0*/

export default {
  name: 'Sutta',
  props: {
    msg: String
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
    width: 6em;
}
.scv-section-body {
    width: 40em;
}
.scv-text {
}
</style>
