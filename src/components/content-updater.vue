<template>
    <v-sheet style="border-top:3px solid #eee" light>
        <v-card >
            <v-card-title>
                <div>
                    <div class="headline"> Content Updater </div>
                </div>
            </v-card-title>
            <v-card-text>
                <div style="display:block; max-width:40em">
                    SuttaCentral content changes continuously. 
                    Use this page on a Voice staging server before
                    every release in order to update 
                    <a href="https://github.com/sc-voice/scv-suttas" target="_blank">
                        Voice content
                    </a>
                    to for the release.


                    <br/>
                    WARNING: This task may take the server minutes or hours
                    to complete! And sometimes, nothing changes. 
                </div>
                <div class="mt-3">
                    <details>
                        <summary class="title">
                            Personal Access Token
                        </summary>
                        <div style="width:30em" class="mt-2">
                            Create a Github Personal Access Token 
                            <a href="https://github.com/settings/tokens" 
                                target="_blank">
                                using your Github account.
                            </a>
                            Click <kbd>Generate New Token</kbd> and 
                            select the "repo" checkbox.
                            Copy the generated token and save it on your computer
                            for later reference. Or you can generate a new
                            token every time you Voice update content.
                        </div>
                        <a href="https://raw.githubusercontent.com/sc-voice/sc-voice/master/src/assets/git-pat.png">
                            <img src="https://raw.githubusercontent.com/sc-voice/sc-voice/master/src/assets/git-pat.png" 
                                style="border:1pt solid gray; margin:1em; height:300px"
                            />
                        </a>
                    </details>
                    <v-text-field placeholder="Enter Personal Access Token" 
                        v-model="gitToken">
                    </v-text-field>
                </div>
                <div>
                    <div class="title mb-2">Select Nikayas to update</div>
                    <div style="display: flex; justify-content: space-around">
                        <v-checkbox v-for="nikaya in nikayas" :key="nikaya.id"
                            :label="nikaya.name"
                            v-model="nikaya.update" primary hide-details/>
                    </div>
                </div>
            </v-card-text>
        </v-card>
        <v-card v-if="contentUpdaterTask">
            <v-card-title>
                <div class="title">Content Updater</div>
                <v-spacer/>
                <div v-if="contentUpdaterTask.isActive">
                    <v-progress-circular color="success" 
                         size="50"
                         :value="taskProgress" >
                        {{taskProgress.toFixed(0)}}%
                    </v-progress-circular>
                </div><div v-else>
                    Idle
                </div>
                <v-spacer/>
                <v-btn :disabled="isUpdateDisabled"
                    @click='onUpdateContent()'
                    color="deep-orange darken-3" dark >
                    Update Content 
                </v-btn>
            </v-card-title>
            <v-card-text>
                <div style="display: flex; justify-content: space-between">
                    <table class="taskTable" v-if="contentUpdaterTask">
                        <tr><th>summary</th>
                            <td>{{contentUpdaterTask.summary}}</td>
                        </tr>
                        <tr><th>started</th>
                            <td>{{contentUpdaterTask.started}}</td>
                        </tr>
                        <tr><th>last active</th>
                            <td>{{contentUpdaterTask.lastActive}}</td>
                        </tr>
                        <tr><th>time active</th>
                            <td>{{
                                Math.round(contentUpdaterTask.msActive / 1000) 
                            }} seconds</td>
                        </tr>
                    </table>

                    <div v-if="contentUpdaterTask.isActive">
                        <v-alert type="info" 
                            :value="!isStuck">
                            <h3>Updating content...</h3>
                            <div v-if="updateSeconds">
                                status updated {{updateSeconds}} seconds ago
                            </div>
                            <v-sparkline style="width: 10em"
                                :value="lastActions"
                                color="yellow"
                                auto-draw
                            ></v-sparkline>
                        </v-alert>
                        <v-alert type="error" 
                            v-if="isStuck"
                            :value="true">
                            <h3>Content Updater is stuck. Reboot server!</h3>
                        </v-alert>
                    </div>
                </div>
                <v-alert type="error" v-if="contentUpdaterTask.error" :value="true">
                    <h3>Content Updater Failed</h3>
                    {{contentUpdaterTask.error}}
                </v-alert>
                <v-alert type="error" v-if="updateError" :value="true">
                    <h3>Content Update request failed</h3>
                    {{updateError}}
                </v-alert>
            </v-card-text>
        </v-card>

    </v-sheet>
</template>

<script>
/* eslint no-console: 0*/

export default {
    name: 'ContentUpdater',
    data: () => {
        return {
            user:{},
            updateError: null,
            isUpdating: false,
            gitToken: '',
            contentUpdaterTask: null,
            actionsDone: [0],
            nikayas: [{
                id: 'an',
                name: 'Aṅguttara Nikāya',
                update: false,
            },{
                id: 'dn',
                name: 'Digha Nikāya',
                update: false,
            },{
                id: 'kn',
                name: 'Khuddaka Nikāya',
                update: false,
            },{
                id: 'mn',
                name: 'Majjhima Nikāya',
                update: false,
            },{
                id: 'sn',
                name: 'Saṃyutta Nikāya',
                update: false,
            }],
        }
    },
    methods: {
        getContentUpdaterTask() {
            var that = this;
            var url = that.url('auth/update-content/task');
            that.$http.get(url, that.authConfig).then(res => {
                var {
                    isActive,
                } = res.data;
                that.contentUpdaterTask = res.data;
                res.data.actionsDone && that.actionsDone.push(res.data.actionsDone);
                if (isActive) {
                    setTimeout(() => {
                        that.getContentUpdaterTask();
                    }, 5000);
                }
            }).catch(e => {
                console.error(e.response);
            });
        },
        onUpdateContent() {
            var that = this;
            var nikayas = that.nikayas.reduce((acc,n) => {
                n.update && acc.push(n.id);
                return acc;
            }, []);
            var url = that.url('auth/update-content');
            var data = {
                nikayas,
                token: that.gitToken,
            };
            that.updateError = null;
            that.isUpdating = true;
            that.$http.post(url, data, that.authConfig).then(res => {
                1==0 && console.log(`update-content => `, res.data);
            }).catch(e => {
                console.log('could not update content', e.response.data);
                that.updateError = e;
            }).finally(() => {
                that.isUpdating = false;
                that.$nextTick(() => that.getContentUpdaterTask());
            });
            that.$nextTick(() => that.getContentUpdaterTask());
        },
        url(path) {
            return window.location.origin === 'http://localhost:8080'
                ? `http://localhost/scv/${path}`
                : `./${path}`;
        },
    },
    mounted() {
        this.user = this.gscv.user;
        this.getContentUpdaterTask();
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
        taskProgress() {
            var {
                actionsDone,
                actionsTotal,
            } = this.contentUpdaterTask;
            return 100 * (actionsTotal ? actionsDone/actionsTotal : 1);
        },
        taskSegmentsDone() {
            return this.contentUpdaterTask && this.contentUpdaterTask.actionsDone
                && (this.contentUpdaterTask.actionsDone - 3) || 0;
        },
        taskSegmentsTotal() {
            return this.contentUpdaterTask && this.contentUpdaterTask.actionsTotal 
                && (this.contentUpdaterTask.actionsTotal - 3) || 0;
        },
        isStuck() {
            var task = this.contentUpdaterTask || {};
            var DEADTIME = 5 * 60 * 1000;
            return task
                && task.isActive
                && (new Date() - new Date(task.lastActive)) > DEADTIME;
        },
        updateSeconds() {
            var task = this.contentUpdaterTask || {};
            var msUpdate = Date.now() - new Date(task.lastActive);
            return Math.round(msUpdate/1000);
        },
        lastActions() {
            var actionsDone = this.actionsDone;
            var result = actionsDone.map((a,i) => {
                var aPrev = i ? actionsDone[i-1] : 0;
                return a - aPrev;
            });
            return result.slice(Math.max(0, result.length - 10));
        },
        isUpdateDisabled() {
            var task = this.contentUpdaterTask || {};
            return this.isUpdating 
                || task.isActive
                || !this.gitToken 
                || !this.nikayas.filter(n => n.update).length;
        },
    },
    components: {
    },
}
</script>

<style scoped>
.taskTable>tr>th {
    text-align: right;
    padding-right: 1em;
}
.taskTable>caption {
    text-align: left;
    font-weight: 800;
    font-style: italic;
}
</style>
