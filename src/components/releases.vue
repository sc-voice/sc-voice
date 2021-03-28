<template>
    <v-sheet style="border-top:3px solid #eee" 
        color="red lighten-4" light>
      <v-container fluid grid-list-md >
        <div class="scv-loadavg">
            <table v-if="identity" class="scv-identity">
                <tr>
                    <th>{{$vuetify.lang.t('$vuetify.auth.applicationName')}}</th>
                    <td>{{identity.name}}</td>
                </tr>
                <tr>
                    <th>{{$vuetify.lang.t('$vuetify.auth.packageName')}}</th>
                    <td>{{identity.package}}</td>
                </tr>
                <tr>
                    <th>{{$vuetify.lang.t('$vuetify.auth.hostname')}}</th>
                    <td>{{identity.hostname}}</td>
                </tr>
                <tr>
                    <th>{{$vuetify.lang.t('$vuetify.auth.version')}}</th>
                    <td>{{identity.version}}</td>
                </tr>
                <tr>
                    <th>{{$vuetify.lang.t('$vuetify.auth.freeMemory')}}</th>
                    <td>{{(identity.freemem/1E9).toFixed(1)}}GB</td>
                </tr>
                <tr>
                    <th>{{$vuetify.lang.t('$vuetify.auth.totalMemory')}}</th>
                    <td>{{(identity.totalmem/1E9).toFixed(1)}}GB</td>
                </tr>
                <tr>
                    <th>{{$vuetify.lang.t('$vuetify.auth.diskAvailable')}}</th>
                    <td>{{(identity.diskavail/1E9).toFixed(1)}}GB</td>
                </tr>
                <tr>
                    <th>{{$vuetify.lang.t('$vuetify.auth.diskTotal')}}</th>
                    <td>{{(identity.disktotal/1E9).toFixed(1)}}GB</td>
                </tr>
                <tr>
                    <th>{{$vuetify.lang.t('$vuetify.auth.uptime')}}</th>
                    <td>{{(identity.uptime/(3600*24)).toFixed(1)}} days</td>
                </tr>
                <tr>
                    <th>{{$vuetify.lang.t('$vuetify.auth.loadAverage')}}</th>
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
          <div style="display: flex; align-items: center">
            <v-checkbox v-model="confirmRestart"
                :label="$vuetify.lang.t('$vuetify.auth.step1Release')"
                >
            </v-checkbox>
            <v-btn @click="onRestart()"
                small
                :disabled="!confirmRestart"
                class="error ml-2">
                {{ $vuetify.lang.t('$vuetify.auth.restart') }}
            </v-btn>
          </div>
          <div style="display: flex; align-items: center">
            <v-checkbox v-model="confirmUpdate"
                :label="$vuetify.lang.t('$vuetify.auth.step2Release')"
                >
            </v-checkbox>
            <v-btn @click="onUpdateRelease()"
                small
                :disabled="!confirmUpdate"
                class="error ml-2">
                {{ $vuetify.lang.t('$vuetify.auth.updateRelease') }}
            </v-btn>
          </div>
          <v-alert :value="!error && isRestarting" type="info">
            {{ $vuetify.lang.t('$vuetify.auth.restartingServer') }}
            {{refreshSecs}} ...
          </v-alert>
          <v-alert :value="!isReleaseCurrent & !error && isUpdating" type="info">
            {{ $vuetify.lang.t('$vuetify.auth.updatingServer') }}
            {{refreshSecs}} ...
          </v-alert>
          <v-alert v-if="(!confirmRestart || !confirmUpdate) && error" 
              :value="error" type="error">
              {{error.message}}
          </v-alert>
          <v-alert :value="isReleaseCurrent" type="success">
              {{ $vuetify.lang.t('$vuetify.auth.releaseIsCurrent') }}
          </v-alert>
          <img src="img/danger.gif" width="200px" 
            style="border-radius: 0.4em;" 
            class="mb-3"/>
        </div>
      </v-container>
    </v-sheet>
</template>

<script>
/* eslint no-console: 0*/

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
                this.identity = identity;
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
            this.isRestarting = true;
            this.confirmRestart = false;
            this.refreshSecs = that.restartMinutes * 60;
            this.error = null;
            this.$http.post(url, data, this.authConfig).then(res => {
                console.log(res.data);
                var interval = setInterval(() => {
                    that.refreshSecs = that.refreshSecs-1;
                    if (that.refreshSecs < 0) {
                        this.isRestarting = false;
                        clearInterval(interval);
                        window.location.reload(true);
                    }
                }, 1000);
            }).catch(e => {
                this.error = e;
                this.isRestarting = false;
                console.error(`onRestart() failed`, e.stack);
            });
        },
        onUpdateRelease() {
            var that = this;
            console.log('onUpdateRelease');
            var url = this.url("auth/update-release"); 
            var data = {};
            this.isUpdating = true;
            this.confirmUpdate = false;
            that.refreshSecs = that.updateMinutes * 60;
            that.isReleaseCurrent = false;
            this.error = null;
            this.$http.post(url, data, this.authConfig).then(res => {
                console.log(res.data);
                if (res.data.updateRelease) {
                    var interval = setInterval(() => {
                        that.refreshSecs = that.refreshSecs-1;
                        if (that.refreshSecs < 0) {
                            clearInterval(interval);
                            window.location.reload(true);
                        }
                    }, 1000);
                } else {
                    that.isReleaseCurrent = true;
                }
            }).catch(e => {
                this.error = e;
                console.error(`onUpdateRelease() failed`, e.stack);
            });
        },
        url(path) {
          var origin = window.location.origin;
          return origin.endsWith(':8080') 
            ? `${origin.substring(0, origin.length-5)}:3000/scv/${path}` 
            : `./${path}`;
        },
    },
    mounted() {
        this.user = this.gscv.user;
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
