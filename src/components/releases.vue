<template>
    <v-sheet style="border-top:3px solid #eee" 
        color="red lighten-4" light>
      <v-container fluid grid-list-md >
        <div class="scv-loadavg">
            <table class="scv-identity">
                <tr v-if="identity.name">
                    <th>Application name</th>
                    <td>{{identity.name}}</td>
                </tr>
                <tr v-if="identity.package">
                    <th>Package</th>
                    <td>{{identity.package}}</td>
                </tr>
                <tr v-if="identity.hostname">
                    <th>Hostname</th>
                    <td>{{identity.hostname}}</td>
                </tr>
                <tr v-if="identity.version">
                    <th>Version</th>
                    <td>{{identity.version}}</td>
                </tr>
                <tr v-if="identity.freemem">
                    <th>Free memory</th>
                    <td>{{(identity.freemem/1E9).toFixed(1)}}GB</td>
                </tr>
                <tr v-if="identity.totalmem">
                    <th>Total memory</th>
                    <td>{{(identity.totalmem/1E9).toFixed(1)}}GB</td>
                </tr>
                <tr v-if="identity.uptime">
                    <th>Uptime</th>
                    <td>{{(identity.uptime/(3600*24)).toFixed(1)}} days</td>
                </tr>
                <tr v-if="identity.loadavg" >
                    <th>Load average</th>
                    <td>
                        <div class="scv-loadavg-line">
                        {{identity.loadavg[0].toFixed(1)}}%
                            <v-sparkline 
                                :value="identity.loadavg" auto-draw >
                            </v-sparkline>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        <div class="scv-release">
            <h2> Update Release </h2>
            <v-checkbox v-model="confirmUpdate"
                :label="`Update release and restart server (~${updateMinutes} minutes)`">
            </v-checkbox>
            <v-btn 
                :disabled="!confirmUpdate"
                @click="onUpdateRelease()"
                class="error">
                Update
            </v-btn>
            <v-alert :value="!isReleaseCurrent & !error && isUpdating" type="info">
                Updating server in {{refreshSecs}} seconds...
            </v-alert>
            <v-alert v-if="!confirmUpdate && error" :value="error" type="error">
                {{error.message}}
            </v-alert>
            <v-alert :value="isReleaseCurrent" type="success">
                Current release is latest. No action taken.
            </v-alert>
            <img src="scv/img/danger.gif" width="200px"
                class="mb-2"/>
        </div>
      </v-container>
    </v-sheet>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";

export default {
    name: 'Releases',
    props: {
        maxSize: {
            type: Number,
            default: 4, // GB
        },
    },
    data: () => {
        return {
            user:{},
            identity: {},
            error: null,
            confirmUpdate: false,
            isUpdating: false,
            refreshSecs: 0,
            updateMinutes: 1.5,
            isReleaseCurrent: false,
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
        onUpdateRelease() {
            var that = this;
            console.log('onUpdateRelease');
            var url = this.url("auth/update-release"); 
            var data = {};
            Vue.set(this, "isUpdating", true);
            Vue.set(this, "confirmUpdate", false);
            Vue.set(that, "refreshSecs", that.updateMinutes * 60);
            Vue.set(that, "isReleaseCurrent", false);
            Vue.set(this, "error", null);
            this.$http.post(url, data, this.authConfig).then(res => {
                console.log(res.data);
                if (res.data.updateRelease) {
                    var interval = setInterval(() => {
                        Vue.set(that, "refreshSecs", that.refreshSecs-1);
                        if (that.refreshSecs < 0) {
                            clearInterval(interval);
                            window.location.reload(true);
                        }
                    }, 1000);
                } else {
                    Vue.set(that, "isReleaseCurrent", true);
                }
            }).catch(e => {
                this.error = e;
                console.error(`onUpdateRelease() failed`, e.stack);
            });
        },
        url(path) {
            return window.location.origin === 'http://localhost:8080'
                ? `http://localhost/scv/${path}`
                : `./${path}`;
        },
    },
    mounted() {
        Vue.set(this, "user", this.gscv.user);
        this.getIdentity();
    },
    computed: {
        gscv() {
            return this.$root.$data;
        },
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
    },
    components: {
    },
}
</script>

<style scoped>
th {
    text-align: right;
    padding-right: 1em;
}
.scv-release {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    border-radius: 0.5em;
    border: 3px dashed red;
}
.scv-loadavg {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
}
.scv-loadavg-line {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    width: 200px;
}
</style>
