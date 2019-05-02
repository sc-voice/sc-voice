<template>
    <v-sheet style="border-top:3px solid #eee" light>
      <v-container fluid grid-list-md >
        <div class="text-xs-center pb-3">
        <v-progress-circular :value="cachePercent"
            v-if="identity"
            size="50" width="6" rotate="90"
            color="red">
            <div style="font-size:12px; line-height:1.1 !important">
            {{cachePercent}}%
            {{cacheUsed}}GB
            </div>
        </v-progress-circular>
        </div>

        <v-data-iterator
          :items="caches"
          :rows-per-page-items="cacheRowsPerPageItems"
          :pagination.sync="pagination"
          content-tag="v-layout"
          row wrap 
        >
            <v-flex slot="item" slot-scope="props"
                xs12 sm6 md4 lg3 >
                <v-card color="grey lighten-3">
                    <v-card-title>
                        <v-spacer/>
                        <h3>{{props.item.name}}</h3>
                        <v-spacer/>
                    </v-card-title>
                    <v-divider/>
                    <v-list dense class="ml-2 mr-2">
                      <v-list-tile>
                        <v-list-tile-content>
                          Size:
                        </v-list-tile-content>
                        <v-list-tile-content class="align-end">
                          {{ (props.item.size/1E6).toFixed(2)}}MB
                        </v-list-tile-content>
                      </v-list-tile>
                    </v-list>
                    <v-card-actions>
                        <v-btn @click='onClearCache(props.item.name)'>
                            Clear Cache
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-data-iterator>
      </v-container>
    </v-sheet>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";

export default {
    name: 'Caches',
    props: {
        maxSize: {
            type: Number,
            default: 4, // GB
        },
    },
    data: () => {
        return {
            user:{},
            caches: [],
            identity: null,
            isWaiting: false,
            cacheRowsPerPageItems: [4, 8, 12],
            pagination: {
                rowsPerPage: 4
            },
        }
    },
    methods: {
        getIdentity() {
            var urlVol = this.url("identity");
            this.$http.get(urlVol).then(res => {
                var identity = res.data;
                Vue.set(this, "identity", identity);
                console.log(res.data);
            }).catch(e => {
                console.error(`getIdentity() failed`, e.stack);
            });
        },
        getCaches() {
            var urlVol = this.url("auth/sound-store/volume-info"); 
            this.$http.get(urlVol, this.authConfig).then(res => {
                var cacheNames = Object.keys(res.data);
                Vue.set(this, "caches", cacheNames.map(name => {
                    var cache = res.data[name];
                    return cache;
                }));
                console.log(res.data);
            }).catch(e => {
                console.error(`getCaches() failed`, e.stack);
            });
        },
        onClearCache(volume) {
            console.log('onClearCache', volume);
            var urlVol = this.url("auth/sound-store/clear-volume"); 
            var data = {
                volume,
            }
            this.$http.post(urlVol, data, this.authConfig).then(res => {
                console.log(res.data);
                this.getCaches();
            }).catch(e => {
                console.error(`onClearCache() failed`, e.stack);
            });
        },
        url(path) {
            return window.location.origin === 'http://localhost:8080'
                ? `http://localhost/scv/${path}`
                : `./${path}`;
        },
        dateString(date) {
            return date && date.toLocaleString() || this.na;
        },
    },
    mounted() {
        Vue.set(this, "user", this.gscv.user);
        this.getCaches();
        this.getIdentity();
    },
    computed: {
        gscv() {
            return this.$root.$data;
        },
        cacheUsed() {
            var used = this.caches.reduce((acc, c) => {
                return acc + c.size;
            }, 0);
            return (used/1E9).toFixed(1);
        },
        cachePercent() {
            if (!this.identity) {
                return '--';
            }
            var {
                diskavail,
                disktotal,
            } = this.identity;
            var cacheUsed = this.cacheUsed;
            var cacheTotal = disktotal - diskavail - cacheUsed;
            return (cacheUsed / cacheTotal * 100).toFixed(0);
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
</style>
