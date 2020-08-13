<template>
  <v-sheet style="border-top:3px solid #eee" light>
    <v-card width="40em" >
      <v-card-title>
        Sound Inspector
      </v-card-title>
      <v-card-text>
        To correct pronunciation, you will need to determine
        what SSML Voice is sending to AWS Polly. 
        Paste the sound url in the text field below.
        <details class="mb-5">
          <summary><i>How do I get the sound url?</i></summary>
          <ol>
            <li>Type CTRL_SHIFT_I to bring up the browser debugger.
                The picture shows the Chrome browser debugger.</li>
            <li>Play the chosen sound and pause the playback</li>
            <li>In the Name pane, select the guid of the sound 
              you want to inspect</li>
            <li>Copy the Request URL of the chosen sound without
              the "Request URL:" label itself.</li>
          </ol>
          <a href="/img/sound_url.png" target="_blank">
            <img src="/img/sound_url.png" height="250px"
          /></a>
        </details>
        <v-text-field 
            label="Paste Sound URL"
            id="soundUrlText"
            v-model="soundUrl" 
            hint="Paste the sound URL here"
            @change="onChangeUrl()"
            clearable
            outlined
        ></v-text-field>
        <div>
          <span class="font-weight-black">Volume:</span> 
          {{volume}} 
        </div>
        <div>
          <span class="font-weight-black">Guid:</span> 
          <a :href="soundUrl" target="_blank">{{guid}}</a>
        </div>
        <v-btn raised dark
          color="deep-orange darken-2"
          @click="inspect()"
          :disabled="!soundUrl"
          >
          Inspect
        </v-btn>
      </v-card-text>
      <v-data-table
        :headers="headers"
        :items="soundInfo"
        >
        <template v-slot:item.guid="{item}">
          <a :href="soundUrl.replace(/[0-9a-f]*$/ui,item.guid)" 
            target="_blank">{{item.guid}}</a>
        </template>
      </v-data-table>
    </v-card>
  </v-sheet>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";

export default {
  name: 'Sounds',
  props: {
  },
  data: () => {
    return {
      user: {},
      soundInfo: [{
        text: "nothing",
      }],
      headers: [{
        text: 'GUID',
        value: 'guid',
      },{
        text: 'SSML',
        value: 'text',
      }],
      soundUrl: null,
      volume: "",
      identity: null,
      guid: "",
    }
  },
  methods: {
    url(path) {
      return window.location.origin === 'http://localhost:8080'
        ? `http://localhost/scv/${path}`
        : `./${path}`;
    },
    parseSoundUrl(url=this.soundUrl) {
      var urlParts = url && url.split("/") || [];
      var guid = urlParts.pop();
      var voice = urlParts.pop();
      var translator = urlParts.pop();
      var lang = urlParts.pop();
      var suid = urlParts.pop();

      var author = lang === 'pli' ? 'mahasangiti' : translator;
      var nikaya = suid.substring(0,2);
      var volume = `${nikaya}_${lang}_${author}_${voice}`.toLowerCase();
      console.log(`dbg parse`, {lang, author});

      return {
        suid,
        guid,
        voice,
        lang,
        translator,
        author,
        volume,
      }
    },
    inspect() {
      var that = this;
      var $http = that.$http;
      var { volume, guid, } = this.parseSoundUrl();
      (async function() { try {
        var url = that.url(`auth/audio-info/${volume}/${guid}`);
        console.log(`inspect ${volume} ${guid} ${url}`, that.authConfig);
        let res = await $http.get(url, that.authConfig);
        console.log(`dbg res`, res);
        Vue.set(that, "soundInfo", res.data);
      } catch(e) { console.error(e); }})();
    },
    onChangeUrl() {
      var { volume, guid, } = this.parseSoundUrl();
      this.volume = volume;
      this.guid = guid;
    },
    getIdentity() {
      var urlVol = this.url("identity");
      this.$http.get(urlVol).then(res => {
          var identity = res.data;
          this.identity = identity;
          console.log(res.data);
      }).catch(e => {
          console.error(`getIdentity() failed`, e.stack);
      });
    },
  },
  mounted() {
    this.user = this.gscv.user;
    setTimeout(() => {
        this.getIdentity();
    }, 1000);
  },
  computed: {
    token() {
        return this.user && this.user.token;
    },
    authConfig() {
      return {
        headers: {
          Authorization: `Bearer ${this.token}`,
        }
      }
    },
    gscv() {
        return this.$root.$data;
    },
  },
  components: {
  },
}
</script>

<style scoped>
</style>
