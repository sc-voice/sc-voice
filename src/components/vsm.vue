<template>
  <v-sheet style="border-top:3px solid #eee" light>
    <v-card >
      <v-card-title>
          <div class="title"> 
            {{$vuetify.lang.t('$vuetify.auth.vsmS3Credentials')}}
          </div>
          <v-spacer/>
          <v-btn @click='onEditCredentials()' dark
              color="deep-orange darken-3">
              {{$vuetify.lang.t("$vuetify.auth.editCredentials")}}
          </v-btn>
      </v-card-title>
      <v-card-text>
        <div v-if="vsmCreds.Bucket">
          <table class='vsm-cred-table'>
            <tr>
              <th>{{$vuetify.lang.t("$vuetify.auth.endpoint")}}</th>
              <td>{{vsmCreds.s3.endpoint}}</td>
            </tr>
            <tr>
              <th>{{$vuetify.lang.t("$vuetify.auth.region")}}</th>
              <td>{{vsmCreds.s3.region}}</td>
            </tr>
            <tr>
              <th>{{$vuetify.lang.t("$vuetify.auth.bucket")}}</th>
              <td>{{vsmCreds.Bucket}}</td>
            </tr>
            <tr>
              <th>{{$vuetify.lang.t("$vuetify.auth.accessKeyId")}}</th>
              <td>{{vsmCreds.s3.accessKeyId}}</td>
            </tr>
            <tr>
              <th>{{$vuetify.lang.t("$vuetify.auth.secretAccessKey")}}</th>
              <td>{{vsmCreds.s3.secretAccessKey}}</td>
            </tr>
          </table>
        </div>
        <div v-else>
          {{$vuetify.lang.t("$vuetify.auth.noCredentials")}}
        </div>
      </v-card-text>
      <v-dialog v-model="isEditCredentials" persistent>
        <v-card>
          <v-card-title class="deep-orange darken-3">
            <div>
              <h3 class="">
                {{$vuetify.lang.t('$vuetify.auth.editCredentials')}}
              </h3>
            </div>
            <v-spacer/>
            <v-btn @click='isEditCredentials=false' small>
              {{ $vuetify.lang.t('$vuetify.auth.cancel') }}
            </v-btn>
          </v-card-title>
          <v-card-text >
            <v-text-field 
                class="mt-2"
                :label="$vuetify.lang.t('$vuetify.auth.endpoint')"
                placeholder="(e.g., 'https://s3.us-west-1.wasabisys.com')"
                v-model="editCreds.s3.endpoint">
            </v-text-field>
            <v-text-field 
                :label="$vuetify.lang.t('$vuetify.auth.region')"
                placeholder="(e.g., 'us-west-1')"
                v-model="editCreds.s3.region">
            </v-text-field>
            <v-text-field 
                :label="$vuetify.lang.t('$vuetify.auth.bucket')"
                placeholder="(e.g., 'sc-voice-wasabi')"
                v-model="editCreds.Bucket">
            </v-text-field>
            <v-text-field 
                :label="$vuetify.lang.t('$vuetify.auth.accessKeyId')"
                :placeholder="$vuetify.lang.t('$vuetify.auth.required')"
                v-model="editCreds.s3.accessKeyId">
            </v-text-field>
            <v-text-field 
                :label="$vuetify.lang.t('$vuetify.auth.secretAccessKey')"
                :placeholder="$vuetify.lang.t('$vuetify.auth.required')"
                v-model="editCreds.s3.secretAccessKey">
            </v-text-field>
            <v-alert type="error" :value="editCredError">
              <b> 
                {{$vuetify.lang.t("$vuetify.auth.invalidCredentials")}}
                {{editCredError && editCredError.response.data.error}}
              </b>
              <p>
                {{$vuetify.lang.t("$vuetify.auth.cancelOrSubmitCredentials")}}
              </p>
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn @click="onSubmitCredentials()">
              {{$vuetify.lang.t("$vuetify.auth.submit")}}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
    <v-card>
      <v-card-title >
        <div class="title">
            {{$vuetify.lang.t('$vuetify.auth.installableVsmModules')}}
        </div>
        <v-btn icon @click="getCredentials()">
            <v-icon>refresh</v-icon>
        </v-btn>
        <v-spacer/>
        <v-btn @click="onVsmInstall()"
            color="warning" :disabled="!vsmSelected.length">
            {{$vuetify.lang.t("$vuetify.auth.install")}}
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table
            v-model="vsmSelected"
            :headers="vsmHeaders"
            :items="vsmObjects"
            class="elevation-1"
            dense
            :show-select="true"
            :single-select="false"
            item-key="Key"
          >
        </v-data-table>
        <v-alert type="info" :value="isVsmRestoring">
            {{$vuetify.lang.t("$vuetify.auth.installingVsmModules")}}
        </v-alert>
        <v-alert type="error" v-if="vsmRestoreError" :value="true">
            {{vsmRestoreError.message}}
        </v-alert>
      </v-card-text>
    </v-card>
    <v-card v-if="vsmFactoryTask">
      <v-card-title>
        <div class="title">
          {{$vuetify.lang.t("$vuetify.auth.vsmFactory")}}
        </div>
        <v-spacer/>
        <div v-if="vsmFactoryTask.isActive">
          <v-progress-circular color="success" 
           size="50"
           :value="vsmFactoryProgress" >
          {{vsmFactoryProgress.toFixed(0)}}%
          </v-progress-circular>
        </div><div v-else>
          {{$vuetify.lang.t("$vuetify.auth.idle")}}
        </div>
        <v-spacer/>
        <v-dialog v-model="vsmFactoryDialog" persistent>
          <template v-slot:activator="{ on }">
            <v-btn color="deep-orange darken-3" dark v-on="on" >
              {{$vuetify.lang.t("$vuetify.auth.buildVsm")}}
            </v-btn>
          </template>
          <v-card> <!-- BuildVSM -->
            <v-card-title class="deep-orange darken-3">
              <div class="title">
                {{$vuetify.lang.t("$vuetify.auth.buildVsm")}}
              </div>
              <v-spacer/>
              <v-btn @click="vsmFactoryDialog = false">
                {{$vuetify.lang.t("$vuetify.auth.cancel")}}
              </v-btn>
            </v-card-title>
            <v-card-text>
              <div>
                {{$vuetify.lang.t("$vuetify.auth.vsmBuildIntro")}}
              </div>
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
                <v-radio-group 
                  label="Nikaya" 
                  v-model="vsmCreate.nikaya">
                  <v-radio label="Anguttara" value="an"/>
                  <v-radio label="Digha" value="dn"/>
                  <v-radio label="Khuddhaka" value="kn"/>
                  <v-radio label="Majjhima" value="mn"/>
                  <v-radio label="Saṁyutta" value="sn"/>
                </v-radio-group>
                <v-radio-group 
                  :label="$vuetify.lang.t('$vuetify.auth.language')"
                  v-model="vsmCreate.lang">
                  <v-radio label="English" value="en"/>
                  <v-radio label="Pali" value="pli"/>
                </v-radio-group>
                <v-radio-group 
                  :label="$vuetify.lang.t('$vuetify.auth.author')"
                  v-model="vsmCreate.author">
                  <v-radio label="Sujato/Mahasangiti" value="sujato"/>
                </v-radio-group>
                <v-radio-group 
                  :label="$vuetify.lang.t('$vuetify.auth.voice')"
                  v-model="vsmCreate.voice">
                  <v-radio label="Aditi (hi-IN)" value="aditi"
                      v-show="vsmCreate.lang==='pli'" />
                  <v-radio label="Amy (en-GB)" value="amy"
                      v-show="vsmCreate.lang==='en'" />
                  <v-radio label="Matthew (en-US)" value="matthew"
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
                      {{$vuetify.lang.t("$vuetify.auth.create")}}
                  </v-btn>
              </v-card-actions>
              <v-alert type="error" v-if="vsmCreateError" :value="true">
                  {{$vuetify.lang.t("$vuetify.auth.vsmBuildFailed")}}
                  {{vsmCreateError.message}}
              </v-alert>
            </v-card-text>
          </v-card> <!-- BuildVSM -->
        </v-dialog> <!-- VSMFactoryDialog -->
      </v-card-title>
      <v-card-text>
        <table class='vsm-cred-table'>
          <tr>
            <th>{{$vuetify.lang.t("$vuetify.auth.summary")}}</th> 
            <td>{{vsmFactoryTask.summary}} </td> 
          </tr>
          <tr>
            <th>{{$vuetify.lang.t("$vuetify.auth.started")}}</th> 
            <td>{{new Date(vsmFactoryTask.started).toLocaleString()}}</td>
          </tr>
          <tr>
            <th>{{$vuetify.lang.t("$vuetify.auth.lastActive")}}</th> 
            <td>{{vsmFactoryTask.summary}} </td> 
            <td>{{new Date(vsmFactoryTask.lastActive).toLocaleString()}}
              (started +
              {{(vsmFactoryTask.msActive/1000).toFixed(0)}} 
              {{$vuetify.lang.t("$vuetify.auth.seconds")}})
            </td>
          </tr>
        </table>
        <v-alert type="error" v-if="vsmFactoryTask.error" :value="true">
          <h3>
            {{$vuetify.lang.t('$vuetify.auth.vsmBuildFailed')}}
          </h3>
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
                Bucket: 'sc-voice-vsm',
                s3: {
                    endpoint: 'https://s3.us-west-1.amazonaws.com',
                    region: 'us-west-1',
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
            this.$http.post(url, this.vsmCreate, this.authConfig)
            .then(res => {
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
                this.vsmObjects = res.data.Contents.map(vo => {
                    vo.installed = vo.upToDate ? "\u26f1" : "\u2601";
                    return vo;
                });
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
                console.log('could not restore S3 archives', 
                  e.response.data);
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
          var origin = window.location.origin;
          return origin.endsWith(':8080') 
            ? `${origin.substring(0, origin.length-5)}:3000/scv/${path}` 
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
                text: this.$vuetify.lang.t("$vuetify.auth.vsmModule"),
                value: 'Key',
            },{
                text: this.$vuetify.lang.t("$vuetify.auth.installed"),
                value: 'installed',
            },{
                text: this.$vuetify.lang.t("$vuetify.auth.vsmSize"),
                value: 'Size',
            },{
                text: this.$vuetify.lang.t("$vuetify.auth.eTag"),
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
