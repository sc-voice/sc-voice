<template>
  <v-sheet style="border-top:3px solid #eee" light>
    <v-container fluid grid-list-md >
      <div class="stats">
        <v-progress-circular :value="diskPercent"
          v-if="identity"
          :title="$vuetify.lang.t('$vuetify.auth.diskUsage')"
          size="35" width="6" rotate="90"
          color="red">
          <div style="font-size:12px; line-height:1.1 !important"
            v-if="identity">
          {{diskPercent}}%
          </div>
        </v-progress-circular>
        <div v-if="identity" class="ml-3">
            <b>{{ $vuetify.lang.t('$vuetify.auth.cacheUsed') }}</b>
            {{cacheUsed}}GB
            <br/> 
            <b>{{ $vuetify.lang.t('$vuetify.auth.diskUsed') }}</b>
            {{diskUsed}}GB
            <br/> 
            <b>{{ $vuetify.lang.t('$vuetify.auth.diskAvailable') }}</b>
            {{(identity.diskavail/1E9).toFixed(1)}}GB
        </div>
        <div v-if="identity == null">
            {{ $vuetify.lang.t('$vuetify.auth.loading') }}
        </div>
      </div>

      <div class="pruner" v-if="pruner">
        <v-card width="40em">
          <v-card-text>
            <details> 
              <summary class="subtitle-1">Sound Cache Pruner...</summary>
              <v-text-field
                label="Maximum days to keep cached files"
                v-model="pruner.pruneDays"
              ></v-text-field>
              <table class="pruner-stats">
                <tr> <th>started:</th>
                  <td>{{localeDateTime(pruner.started)}} </td> </tr>
                <tr><th>files pruned:</th>
                  <td>{{pruner.filesPruned}}</td></tr>
                <tr><th>bytes scanned:</th>
                  <td>{{(pruner.bytesScanned/1000000).toFixed(1)}}MB</td></tr>
                <tr><th>bytes pruned:</th>
                  <td>{{(pruner.bytesPruned/1000000).toFixed(1)}}MB</td></tr>
                <tr><th>earliest entry:</th>
                  <td>{{localeDateTime(pruner.earliest)}} </td> </tr>
                <tr><th>pending:</th><td>{{pruner.pruning}}</td> </tr>
                <tr><th>done:</th>
                  <td>{{localeDateTime(pruner.done)}} </td> </tr>
              </table>
              <v-btn @click="onPrune"
                class="mt-2 orange darken-2" dark text small
                :disabled="!!pruner.pruning"
              >Start</v-btn>
              <v-alert type="error" color="red darken-4"
                :value="!!pruner.error"
                transition="scale-transition"
                class="mt-3"
              >{{pruner.error}}</v-alert>
            </details>
          </v-card-text>
        </v-card>
      </div>

      <div class="cache-table">
        <v-data-table
          v-model="selected"
          :headers="cacheHeaders"
          :items="caches"
          class="elevation-1 "
          dense
          style="max-width:40em"
          item-key="name"
          :show-select="true"
          :single-select="false"
          >
          <template v-slot:item.size="{ item }">
            {{(item.size/1E6).toFixed(1)}}MB
          </template>
          <template v-slot:no-data>
            {{ $vuetify.lang.t('$vuetify.auth.loading') }}
          </template>
        </v-data-table>
        <v-btn :disabled="selected.length===0"
          small
          class="mt-2 orange darken-2" dark
          @click="onClearCaches">
          {{ $vuetify.lang.t('$vuetify.auth.clearCache') }}
        </v-btn>
      </div>

    </v-container>
  </v-sheet>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";

export default {
  name: 'Caches',
  props: {
  },
  data: () => {
    return {
        user:{},
        selected: [],
        caches: [],
        cleared: {},
        identity: null,
        isWaiting: false,
        pruner: { 
          bytesScanned:0,
          bytesPruned:0,
          filesPruned:0,
        },
    }
  },
  methods: {
    localeDateTime(date) {
      if (!date) {
        return "--";
      }
      date = typeof date === 'string' ? new Date(date) : date;
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    },
    async onPrune() {
      var that = this;
      var url = this.url("auth/sound-store/pruner"); 
      var data = {
        pruneDays: that.pruner.pruneDays,
      };
      that.pruner.pruning = 1;
      that.pruner.error = '';
      var monitor = async()=>{
        var eCaught;
        try {
          var res = await that.getPruner();
          console.log('monitor ok', res);
          await that.getCaches();
        } catch(e) {
          console.log('monitor fail', e);
          eCaught = e;
        }
        if (eCaught) {
          console.error("pruning error", eCaught);
          Vue.set(that.pruner, "error", eCaught.message);
          Vue.set(that.pruner, "pruning", 0);
        } else if (that.pruner.pruning) {
          setTimeout(monitor, 1000);
        } else {
          console.log("done pruning", JSON.stringify(that.pruner));
        }
      }
      try {
        var res = await that.$http.post(url, data, that.authConfig);
        console.log(`onPrune()`, res.data);
        monitor();
      } catch(e) {
        console.error(`onPrune() fail`, e);
        Vue.set(that.pruner, "error", e.message);
        Vue.set(that.pruner, "pruning", 0);
      }
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
    getCaches() {
        var urlVol = this.url("auth/sound-store/volume-info"); 
        var {
            cleared,
        } = this;
        this.$http.get(urlVol, this.authConfig).then(res => {
            var cacheNames = Object.keys(res.data);
            this.caches = cacheNames.map(name => {
                var cache = res.data[name];
                cache.cleared = cleared[cache.name] 
                    ? this.$vuetify.lang.t("$vuetify.auth.cleared")
                    :'';
                return cache;
            });
            console.log(res.data);
        }).catch(e => {
            console.error(`getCaches() failed`, e.stack);
        });
    },
    getPruner() {
        var that = this;
        var url = this.url("auth/sound-store/pruner"); 
        return new Promise((resolve, reject) => {
          that.$http.get(url, this.authConfig).then(res=>{
            Vue.set(that, "pruner", res.data);
            console.log('getPruner()', that.pruner);
            resolve(that.pruner);
          }).catch(e=>{
            Vue.set(that.pruner, "error", e.message);
            Vue.set(that.pruner, "pruning", 0);
            reject(e);
          });
        });
    },
    onClearCaches() {
        this.selected.forEach(cache => {
            this.clearCache(cache);
        });
    },
    clearCache(cache) {
        var volume = cache.name;
        console.log('clearCache', volume);
        var urlVol = this.url("auth/sound-store/clear-volume"); 
        var data = {
            volume,
        }
        var that = this;
        this.$http.post(urlVol, data, this.authConfig).then(res => {
            console.log(`cleared cache:${volume}`,res.data);
            that.getCaches();
            Vue.set(that.cleared, volume, 'cleared');
        }).catch(e => {
            console.error(`onClearCache() failed`, e.stack);
        });
    },
    url(path) {
      var origin = window.location.origin;
      return origin.endsWith(':8080') 
        ? `${origin.substring(0, origin.length-5)}:3000/scv/${path}` 
        : `./${path}`;
    },
    dateString(date) {
        return date && date.toLocaleString() || this.na;
    },
},
  mounted() {
      this.user = this.gscv.user;
      setTimeout(() => {
          this.getCaches();
          this.getPruner();
          this.getIdentity();
      }, 1000);
  },
  computed: {
      cacheHeaders() {
          return [{
              text: this.$vuetify.lang.t("$vuetify.auth.cacheName"),
              align: 'left',
              value: 'name'
          },{
              text: this.$vuetify.lang.t("$vuetify.auth.cacheSize"),
              align: 'right',
              value: 'size',
          },{
              text: this.$vuetify.lang.t("$vuetify.auth.cacheCleared"),
              align: 'right',
              value: 'cleared',
          }];
      },
      cacheName() {
          return this.$vuetify.lang.t("$vuetif.auth.cacheName");
      },
      cacheSize() {
          return this.$vuetify.lang.t("$vuetif.auth.cacheSize");
      },
      cacheCleared() {
          return this.$vuetify.lang.t("$vuetif.auth.cacheCleared");
      },
      gscv() {
          return this.$root.$data;
      },
      cacheUsed() {
          var used = this.caches.reduce((acc, c) => {
              return acc + c.size;
          }, 0);
          return (used/1E9).toFixed(1);
      },
      diskUsed() {
          if (!this.identity) {
              return '--';
          }
          var {
              diskavail,
              disktotal,
          } = this.identity;
          return ((disktotal - diskavail)/1E9).toFixed(1);
      },
      diskPercent() {
          if (!this.identity) {
              return '--';
          }
          var {
              diskavail,
              disktotal,
          } = this.identity;
          var diskused = disktotal - diskavail;
          return (diskused / disktotal * 100).toFixed(0);
      },
      token() {
          return this.user && this.user.token;
      },
      na() {
          return "--";
      },
      authConfig() {
          return {
              headers: {
                  Authorization: `Bearer ${this.token}`,
              }
          }
      },
  },
  components: {
  },
}
</script>

<style scoped>
.pruner {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
    margin-bottom: 0.5em;
}
.pruner-stats th {
  text-align: right;
  padding-right: 1em;
}
.stats {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
    margin-bottom: 0.5em;
}
.cache-table {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
}
th {
    text-align: left;
}
</style>
