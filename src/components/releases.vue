<template>
    <v-sheet style="border-top:3px solid #eee" 
        color="red lighten-4" light>
      <v-container fluid grid-list-md >
        <div class="scv-loadavg">
            <table v-if="identity" class="scv-identity">
                <tr>
                    <th>Application name</th>
                    <td>{{identity.name}}</td>
                </tr>
                <tr>
                    <th>Package</th>
                    <td>{{identity.package}}</td>
                </tr>
                <tr>
                    <th>Hostname</th>
                    <td>{{identity.hostname}}</td>
                </tr>
                <tr>
                    <th>Version</th>
                    <td>{{identity.version}}</td>
                </tr>
                <tr>
                    <th>Free memory</th>
                    <td>{{(identity.freemem/1E9).toFixed(1)}}GB</td>
                </tr>
                <tr>
                    <th>Total memory</th>
                    <td>{{(identity.totalmem/1E9).toFixed(1)}}GB</td>
                </tr>
                <tr>
                    <th>Disk available</th>
                    <td>{{(identity.diskavail/1E9).toFixed(1)}}GB</td>
                </tr>
                <tr>
                    <th>Disk total</th>
                    <td>{{(identity.disktotal/1E9).toFixed(1)}}GB</td>
                </tr>
                <tr>
                    <th>Uptime</th>
                    <td>{{(identity.uptime/(3600*24)).toFixed(1)}} days</td>
                </tr>
                <tr>
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
            <v-checkbox v-model="confirmRestart"
                :label="`STEP 1: Restart server (~${restartMinutes} minutes)`">
            </v-checkbox>
            <v-btn @click="onRestart()"
                :disabled="!confirmRestart"
                class="error">
                Restart
            </v-btn>
            <v-checkbox v-model="confirmUpdate"
                :label="`STEP 2: Update release (~${updateMinutes} minutes)`">
            </v-checkbox>
            <v-btn @click="onUpdateRelease()"
                :disabled="!confirmUpdate"
                class="error">
                Update
            </v-btn>
            <v-alert :value="!error && isRestarting" type="info">
                Restarting server in {{refreshSecs}} seconds...
            </v-alert>
            <v-alert :value="!isReleaseCurrent & !error && isUpdating" type="info">
                Updating server in {{refreshSecs}} seconds...
            </v-alert>
            <v-alert v-if="(!confirmRestart || !confirmUpdate) && error" 
                :value="error" type="error">
                {{error.message}}
            </v-alert>
            <v-alert :value="isReleaseCurrent" type="success">
                Current release is latest. No action taken.
            </v-alert>
            <img src="img/danger.gif" width="200px"
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
            identity: null,
            error: null,
            confirmUpdate: false,
            confirmRestart: false,
            isUpdating: false,
            isRestarting: false,
            refreshSecs: 0,
            updateMinutes: 1.5,
            restartMinutes: 1.5,
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
        onRestart() {
            var that = this;
            console.log('onRestart');
            var url = this.url("auth/reboot"); 
            var data = {};
            Vue.set(this, "isRestarting", true);
            Vue.set(this, "confirmRestart", false);
            Vue.set(that, "refreshSecs", that.restartMinutes * 60);
            Vue.set(this, "error", null);
            this.$http.post(url, data, this.authConfig).then(res => {
                console.log(res.data);
                var interval = setInterval(() => {
                    Vue.set(that, "refreshSecs", that.refreshSecs-1);
                    if (that.refreshSecs < 0) {
                        clearInterval(interval);
                        window.location.reload(true);
                    }
                }, 1000);
            }).catch(e => {
                this.error = e;
                console.error(`onRestart() failed`, e.stack);
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
