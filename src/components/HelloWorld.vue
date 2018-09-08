<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <img src="@/assets/logo.png" alt="Vuetify.js" class="mb-5">
        <blockquote>
          <div v-for="(sect,i) in sections" :key="sect+i">
            <h2>section {{i+1}}</h2>
            <div v-for="(seg,j) in sect.segments" :key="seg+j">
                <div class='scv-scid'>{{seg.scid.split(":")[1]}}</div> 
                <div class='scv-en'>{{seg.en}}</div>
            </div>
          </div>
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
  name: 'HelloWorld',
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
.scv-en {
    display: inline-block;
    width: 40em;
}
</style>
