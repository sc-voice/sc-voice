<template>
    <v-sheet style="border-top:3px solid #eee" light>
        <v-card >
            <v-card-title>
                <div class="title"> VSM S3 Credentials </div>
                <v-spacer/>
                <v-btn @click='onEditCredentials()' color="warning">
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
                        <v-btn @click="onSubmitCredentials()">
                            Submit
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-card>
        <v-card>
            <v-card-title >
                <div class="title">Importable VSM Modules</div>
                <v-spacer/>
                <v-btn color="warning" :disabled="!vsmSelected.length">
                    Import
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
                      <td class="text-xs-left">{{ props.item.Key }}</td>
                      <td class="text-xs-left">{{ props.item.Size }}</td>
                      <td >{{ props.item.ETag }}</td>
                    </template>
                </v-data-table>
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
            editCredError: null,
            vsmSelected: [],
            vsmObjects: [],
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
        getListObjects() {
            var url = this.url('auth/vsm/list-objects');
            this.$http.get(url, this.authConfig).then(res => {
                Vue.set(this, 'vsmObjects', res.data.Contents);
            }).catch(e => {
                console.error(e.response);
            });
        },
        getCredentials() {
            var url = this.url('auth/vsm/s3-credentials');
            this.$http.get(url, this.authConfig).then(res => {
                Vue.set(this, 'vsmCreds', res.data);
                if (res.data.Bucket) {
                    Vue.set(this, 'editCreds', JSON.parse(JSON.stringify(res.data)));
                    Vue.set(this.editCreds.s3, 'accessKeyId', '');
                    Vue.set(this.editCreds.s3, 'secretAccessKey', '');
                }
                this.getListObjects();
            }).catch(e => {
                console.error(e.response);
                Vue.set(this, 'vsmCreds', {});
            });
        },
        onEditCredentials() {
            Vue.set(this, 'isEditCredentials', true);
        },
        onSubmitCredentials() {
            var that = this;
            var url = this.url('auth/vsm/s3-credentials');
            this.$http.post(url, this.editCreds, this.authConfig).then(res => {
                console.log(`updated VSM credentials`, res.data);
                Vue.set(this, 'isEditCredentials', false);
                Vue.set(this, 'editCredError', null);
                that.getCredentials();
            }).catch(e => {
                console.log('could not update credentials', e.response.data);
                Vue.set(this, 'editCredError', e);
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
        this.getCredentials();
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
                text: 'Size',
                value: 'Size',
            },{
                text: 'ETag',
                value: 'ETag',
            }];
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
</style>
