<template>
<div class="text-xs-center">
    <v-dialog persistent v-model="visible" 
        width="30em"
        dark>
        <v-card role="alertdialog" class="scv-alert-dialog"
            :style="cssProps">
            <div class="text-center mt-3" aria-hidden=true>
              <img :src="waitPng(1)" :class="waitClass(1)"/>
              <img :src="waitPng(2)" :class="waitClass(2)"/>
              <img :src="waitPng(3)" :class="waitClass(3)"/>
              <img :src="waitPng(4)" :class="waitClass(0)"/>
            </div>
            <v-card-actions>
              <div tabindex=0 ref="refAlert" class="pl-1 pr-1">
                  {{message}}
                  <div style="display:none">
                    <a ref="download-link" type="audio" 
                      :href="urlDownload">{{downloadFile}}</a>
                  </div>
                  <div>{{downloadFile}}</div>
                  <div>{{downloadDate}}</div>
              </div>
              <v-spacer/>
              <v-btn id="btnSettings" 
                  icon small dark 
                  class="scv-icon-btn ml-1" :style="cssProps"
                  :aria-label="$vuetify.lang.t('$vuetify.scv.ariaClose')"
                  @click="dismiss()"
                  @blur="onblur()"
                  >
                  <v-icon>close</v-icon>
              </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</div>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";

export default {
    name: 'scv-downloader',
    props: {
        filename: String,
        urlBuild: String,
        urlDownload: String,
        alertType: {
          default: 'success',
        },
        focusElement: null,
        cookie: {
          default: 'download-date',
        },
    },
    data: function( ){
        return {
            visible: false,
            polling: false,
            waitState: 0,
            waiting: true,
            message: "",
            downloadFile: "",
            downloadDate: "",
            started: Date.now(),
        };
    },
    methods: {
      poll() {
        let that = this;
        Vue.set(that, "polling", true);
        let { urlBuild, urlDownload, } = this;
        that.$http.get(urlBuild).then(resPoll => {
          let { guid, filename } = resPoll.data;
          if (guid == null) {
            //console.log(`scv-downloader.poll() building ${urlBuild} =>`, resPoll.data);
            setTimeout(()=>that.poll(), 5000);
            let mmss = this.$vuetify.lang.t('$vuetify.scv.MMSS');
            let tSec = Math
              .max((that.started + 15*60*1000 - Date.now())/1000,13).toFixed(0);
            let minutes = Math.trunc(tSec/60);
            let seconds = (tSec-minutes*60);
            let estimate = mmss
              .replace('A_SECONDS', seconds)
              .replace('A_MINUTES', minutes);
            Vue.set(that, "downloadDate", estimate);
          } else {
            Vue.set(that, "polling", false);
            let downloadDate = new Date().toLocaleTimeString();
            var downloadComplete = this.$vuetify.lang.t('$vuetify.scv.downloadComplete');
            Vue.set(that, "downloadDate", downloadDate);
            Vue.set(that, "downloadFile", decodeURIComponent(filename));
            that.update(downloadComplete, false);
            console.log(`scv-downloader.poll() downloading guid:${guid}`, urlDownload);
            let link = that.$refs['download-link'];
            link.click();
          }
        }).catch(e=>{
            console.error(e);
        });
      },
      url(path) {
        var origin = window.location.origin;
        return origin.endsWith(':8080') 
          ? `${origin.substring(0, origin.length-5)}:3000/scv/${path}` 
          : `./${path}`;
      },
      setFocus(elt) {
          if (elt instanceof Vue) {
              elt = elt.$el;
          }
          if (elt) {
              this.$nextTick(() => {
                  elt.focus();
              })
          }
      },
      update(status, waiting=true) {
        var that = this;
        if (!this.visible) {
          this.visible = true;
          Vue.set(this, "downloadDate", '');
          Vue.set(this, "downloadFile", '');
          Vue.set(this, "started", Date.now());
          //console.log(`scv-downloader.update() start polling`);
          this.poll();
        }
        Vue.set(that, "message", status);
        var elt = this.$refs.refAlert;
        Vue.set(this, "waiting", waiting);
        //console.log(`scv-downloader.update()`, this.message, waiting);
        this.setFocus(elt);
      },
      onblur() {
          var elt = this.$refs.refAlert;
          this.visible && this.setFocus(elt);
      },
      dismiss() {
          this.visible = false;
          this.setFocus(this.focusElement);
      },
      onKeypress(evt) {
          (evt.key === 'Enter' || evt.key === ' ') && this.dismiss();
      },
      waitClass(n) {
        return this.waitState === n ? "opacity100" : "opacity0";
      },
      waitPng(n) {
        return this.url(`img/wait${n}.png`);
      },
    },
    computed: {
        cssProps() {
            return {
                '--success-color': this.$vuetify.theme.success,
            }
        },
    },
    mounted() {
      var that = this;
      setInterval(()=>{
        if (that.waiting) {
          Vue.set(that, "waitState", (that.waitState+1)%4);
        } else {
          Vue.set(that, "waitState", 0);
        }
      },1500);
    },
}
</script>
<style scoped>
.scv-alert-dialog {
    border-top: 2pt solid;
    border-bottom: 2pt solid;
}
.opacity0 {
  display: none;
}
.opacity100 {
  margin-left: auto;
  margin-right: auto;
  display: block;
}
</style>
