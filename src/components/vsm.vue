<template>
    <v-sheet style="border-top:3px solid #eee" light>
        <v-card >
            <v-card-title>
                <div class="title"> VSM S3 Credentials </div>
                <v-spacer/>
                <v-btn @click='onEditCredentials()' dark
                    color="deep-orange darken-3">
                    Edit Credentials
                </v-btn>
            </v-card-title>
            <v-card-text>
                <div v-if="vsmCreds.Bucket">
                    <table class='vsm-cred-table'>
                    <tr><th>endpoint:</th><td>{{vsmCreds.s3.endpoint}}</td></tr>
                    <tr><th>region:</th><td>{{vsmCreds.s3.region}}</td></tr>
                    <tr><th>Bucket:</th><td>{{vsmCreds.Bucket}}</td></tr>
                    <tr><th>accessKeyId:</th><td>{{vsmCreds.s3.accessKeyId}}</td></tr>
                    <tr>
                        <th>secretAccessKey:</th>
                        <td>{{vsmCreds.s3.secretAccessKey}}</td>
                    </tr>
                    </table>
                </div>
                <div v-else>
                    (no credentials)
                </div>
            </v-card-text>
            <v-dialog v-model="isEditCredentials" persistent>
                <v-card>
                    <v-card-title class="deep-orange darken-3">
                        <div>
                        <h3 class="">Edit VSM S3 Credentials</h3>
                        </div>
                        <v-spacer/>
                        <v-btn @click='isEditCredentials=false' small>
                            Cancel
                        </v-btn>
                    </v-card-title>
                    <v-card-text>
                        <v-text-field label="endpoint" 
                            placeholder="(e.g., 'https://s3.us-west-1.wasabisys.com')"
                            v-model="editCreds.s3.endpoint">
                        </v-text-field>
                        <v-text-field label="region" 
                            placeholder="(e.g., 'us-west-1')"
                            v-model="editCreds.s3.region">
                        </v-text-field>
                        <v-text-field label="Bucket" 
                            placeholder="(e.g., 'sc-voice-wasabi')"
                            v-model="editCreds.Bucket">
                        </v-text-field>
                        <v-text-field label="accessKeyId" 
                            placeholder="(required)"
                            v-model="editCreds.s3.accessKeyId">
                        </v-text-field>
                        <v-text-field label="secretAccessKey" 
                            placeholder="(required)"
                            v-model="editCreds.s3.secretAccessKey">
                        </v-text-field>
                        <v-alert type="error" :value="editCredError">
                            <b> Invalid credentials:
                            {{editCredError && editCredError.response.data.error}}
                            </b>
                            <p>
                            Cancel or Submit correct credentials
                            </p>
                        </v-alert>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer/>
                        <v-btn @click="onSubmitCredentials()">
                            Submit
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-card>
        <v-card>
            <v-card-title >
                <div class="title">Installable VSM Modules</div>
                <v-btn icon @click="getCredentials()">
                    <v-icon>refresh</v-icon>
                </v-btn>
                <v-spacer/>
                <v-btn @click="onVsmInstall()"
                    color="warning" :disabled="!vsmSelected.length">
                    Install
                </v-btn>
            </v-card-title>
            <v-card-text>
                <v-data-table
                    v-model="vsmSelected"
                    :headers="vsmHeaders"
                    :items="vsmObjects"
                    class="elevation-1"
                    select-all
                    item-key="Key"
                  >
                    <template v-slot:items="props">
                      <td>
                          <v-checkbox v-model="props.selected" primary hide-details/>
                      </td>
                      <td class="text-left">{{ props.item.Key }}</td>
                      <td class="text-left">{{ props.item.upToDate }}</td>
                      <td class="text-left">{{ props.item.Size }}</td>
                      <td >{{ props.item.ETag }}</td>
                    </template>
                </v-data-table>
                <v-alert type="info" :value="isVsmRestoring">
                    Installing selected VSM modules...
                </v-alert>
                <v-alert type="error" v-if="vsmRestoreError" :value="true">
                    {{vsmRestoreError.message}}
                </v-alert>
            </v-card-text>
        </v-card>
        <v-card v-if="vsmFactoryTask">
            <v-card-title>
                <div class="title">VSM Factory</div>
                <v-spacer/>
                <div v-if="vsmFactoryTask.isActive">
                    <v-progress-circular color="success" 
                         size="50"
                         :value="vsmFactoryProgress" >
                        {{vsmFactoryProgress.toFixed(0)}}%
                    </v-progress-circular>
                </div><div v-else>
                    Idle
                </div>
                <v-spacer/>
                <v-dialog v-model="vsmFactoryDialog" persistent>
                    <template v-slot:activator="{ on }">
                        <v-btn color="deep-orange darken-3" dark v-on="on" >
                            Build VSM </v-btn>
                     </template>
                    <v-card>
                        <v-card-title class="deep-orange darken-3">
                            <div class="title">Build Voice Sound Module (VSM)</div>
                            <v-spacer/>
                            <v-btn @click="vsmFactoryDialog = false">
                                Cancel
                            </v-btn>
                        </v-card-title>
                        <v-card-text>
                            Building a VSM takes a long time. For testing, choose fewer suttas.
                            <div class="vsm-row">
                                <v-radio-group label="Suttas" v-model="vsmCreate.maxSuttas">
                                    <v-radio label="All" value="0"/>
                                    <v-radio label="1" value="1"/>
                                    <v-radio label="5" value="5"/>
                                    <v-radio label="10" value="10"/>
                                    <v-radio label="50" value="50"/>
                                    <v-radio label="100" value="100"/>
                                    <v-radio label="150" value="150"/>
                                    <v-radio label="200" value="200"/>
                                </v-radio-group>
                                <v-radio-group label="Nikaya" v-model="vsmCreate.nikaya">
                                    <v-radio label="Anguttara" value="an"/>
                                    <v-radio label="Digha" value="dn"/>
                                    <v-radio label="Khuddhaka" value="kn"/>
                                    <v-radio label="Majjhima" value="mn"/>
                                    <v-radio label="Saṁyutta" value="sn"/>
                                </v-radio-group>
                                <v-radio-group label="Language" v-model="vsmCreate.lang">
                                    <v-radio label="English" value="en"/>
                                    <v-radio label="Pali" value="pli"/>
                                </v-radio-group>
                                <v-radio-group label="Author" v-model="vsmCreate.author">
                                    <v-radio label="Sujato/Mahasangiti" value="sujato"/>
                                </v-radio-group>
                                <v-radio-group label="Voice" v-model="vsmCreate.voice">
                                    <v-radio label="Aditi (hi-IN)" value="aditi"
                                        v-show="vsmCreate.lang==='pli'" />
                                    <v-radio label="Amy (en-GB)" value="amy"
                                        v-show="vsmCreate.lang==='en'" />
                                    <v-radio label="Raveena (en-IN)" value="raveena"
                                        v-show="vsmCreate.lang==='en'" />
                                    <v-radio label="Russell (en-AU)" value="russell"
                                        v-show="vsmCreate.lang==='en'" />
                                    <v-radio label="Sujato (en, pli)" value="sujato" 
                                        :disabled="true" />
                                </v-radio-group>
                            </div>
                            <v-card-actions>
                                <v-spacer/>
                                <v-btn :disabled="!isVsmCreate"
                                    @click="onVsmCreate()">
                                    Create
                                </v-btn>
                            </v-card-actions>
                            <v-alert type="error" v-if="vsmCreateError" :value="true">
                                VSM BUILD FAILED: {{vsmCreateError.message}}
                            </v-alert>
                        </v-card-text>
                    </v-card>
                </v-dialog>
            </v-card-title>
            <v-card-text>
                <table class='vsm-cred-table'>
                <tr><th>summary:</th> <td>{{vsmFactoryTask.summary}} </td> </tr>
                <tr><th>started:</th>
                    <td>{{new Date(vsmFactoryTask.started).toLocaleString()}}</td>
                </tr>
                <tr><th>lastActive:</th>
                    <td>{{new Date(vsmFactoryTask.lastActive).toLocaleString()}}
                        (started +
                        {{(vsmFactoryTask.msActive/1000).toFixed(0)}} seconds)
                    </td>
                </tr>
                </table>
                <v-alert type="error" v-if="vsmFactoryTask.error" :value="true">
                    <h3>VSM Build Failed</h3>
                    {{vsmFactoryTask.error}}
                </v-alert>
            </v-card-text>
        </v-card>

    </v-sheet>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";

export default {
    name: 'Vsm',
    data: () => {
        return {
            user:{},
            isEditCredentials: false,
            isVsmRestoring: false,
            editCredError: null,
            vsmFactoryTask: null,
            vsmRestoreError: null,
            vsmCreateError: null,
            vsmSelected: [],
            vsmObjects: [],
            vsmFactoryDialog: false,
            vsmCreate: {
                nikaya: null,
                lang: 'pli',
                author: 'sujato',
                voice: null,
                maxSuttas: null,
            },
            vsmCreds: {
            },
            editCreds: {
                Bucket: '',
                s3: {
                    endpoint: '',
                    region: '',
                    secretAccessKey: '',
                    accessKeyId: '',
                },
            }
        }
    },
    methods: {
        onVsmCreate() {
            var url = this.url('auth/vsm/create-archive');
            this.vsmCreateError = null;
            this.$http.post(url, this.vsmCreate, this.authConfig).then(res => {
                console.log(`onVsmCreate`, res.data);
                this.vsmFactoryDialog = false;
                this.getVsmFactoryTask();
            }).catch(e => {
                this.vsmCreateError = e;
                console.error(e.response);
            });
        },
        getListObjects() {
            var url = this.url('auth/vsm/list-objects');
            this.$http.get(url, this.authConfig).then(res => {
                this.vsmObjects = res.data.Contents;
            }).catch(e => {
                console.error(e.response);
            });
        },
        getVsmFactoryTask() {
            var that = this;
            var url = that.url('auth/vsm/factory-task');
            that.$http.get(url, that.authConfig).then(res => {
                var {
                    isActive,
                } = res.data;
                this.vsmFactoryTask = res.data;
                if (isActive) {
                    setTimeout(() => {
                        that.getVsmFactoryTask();
                    }, 5000);
                } else {
                    this.getListObjects();
                }
            }).catch(e => {
                console.error(e.response);
            });
        },
        getCredentials() {
            var url = this.url('auth/vsm/s3-credentials');
            this.$http.get(url, this.authConfig).then(res => {
                this.vsmCreds = res.data;
                if (res.data.Bucket) {
                    this.editCreds = JSON.parse(JSON.stringify(res.data));
                    Vue.set(this.editCreds.s3, 'accessKeyId', '');
                    Vue.set(this.editCreds.s3, 'secretAccessKey', '');
                }
                this.getListObjects();
            }).catch(e => {
                console.error(e.response);
                this.vsmCreds = {};
            });
        },
        onEditCredentials() {
            this.isEditCredentials = true;
        },
        onVsmInstall() {
            var that = this;
            var url = that.url('auth/vsm/restore-s3-archives');
            var data = {
                restore: that.vsmSelected,
            };
            this.isVsmRestoring = true;
            this.vsmRestoreError = null;
            that.$http.post(url, data, that.authConfig).then(res => {
                console.log(`restored S3 archives`, res.data);
                this.isVsmRestoring = false;
                that.getCredentials();
            }).catch(e => {
                console.log('could not restore S3 archives', e.response.data);
                this.isVsmRestoring = false;
                this.vsmRestoreError = e;
            });
        },
        onSubmitCredentials() {
            var that = this;
            var url = this.url('auth/vsm/s3-credentials');
            this.$http.post(url, this.editCreds, this.authConfig).then(res => {
                console.log(`updated VSM credentials`, res.data);
                this.isEditCredentials = false;
                this.editCredError = null;
                that.getCredentials();
            }).catch(e => {
                console.log('could not update credentials', e.response.data);
                this.editCredError = e;
            });
        },
        url(path) {
            return window.location.origin === 'http://localhost:8080'
                ? `http://localhost/scv/${path}`
                : `./${path}`;
        },
    },
    mounted() {
        this.user = this.gscv.user;
        this.getCredentials();
        this.getVsmFactoryTask();
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
        na() {
            return "--";
        },
        vsmHeaders() {
            return [{
                text: 'VSM Module',
                value: 'Key',
            },{
                text: 'Installed',
                value: 'upToDate',
            },{
                text: 'Size',
                value: 'Size',
            },{
                text: 'ETag',
                value: 'ETag',
            }];
        },
        vsmFactoryProgress() {
            var {
                actionsDone,
                actionsTotal,
            } = this.vsmFactoryTask;
            return 100 * (actionsTotal ? actionsDone/actionsTotal : 1);
        },
        isVsmCreate() {
            var {
                maxSuttas,
                voice,
                lang,
                nikaya,
                author,
            } = this.vsmCreate;
            return maxSuttas !== null && author !== null &&
                voice !== null && lang !== null && nikaya !== null;
        },
        taskSegmentsDone() {
            return this.vsmFactoryTask && this.vsmFactoryTask.actionsDone
                && (this.vsmFactoryTask.actionsDone - 3) || 0;
        },
        taskSegmentsTotal() {
            return this.vsmFactoryTask && this.vsmFactoryTask.actionsTotal 
                && (this.vsmFactoryTask.actionsTotal - 3) || 0;
        },
    },
    components: {
    },
}
</script>

<style scoped>
.vsm-cred-table {
}
.vsm-cred-table > tr > th {
    text-align: left;
    padding-right: 1em;
}
.vsm-row {
    display: flex;
    flex-flow: row wrap;
    padding-left: 1em;
}
</style>
