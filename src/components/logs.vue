<template>
    <v-sheet style="border-top:3px solid #eee" light>
        <v-card >
            <v-card-title>
                <div class="title">Voice Server Logs</div>
            </v-card-title>
            <v-card-text>
                <v-data-table
                    :headers="headers"
                    :items="logs"
                    class="elevation-1"
                    disable-initial-sort
                  >
                    <template v-slot:items="props">
                      <th class="text-xs-left">
                        <a @click="getLog(props.item.name)">{{ props.item.name }}</a>
                    </th>
                      <td class="text-xs-left">{{ props.item.size }}</td>
                      <td class="text-xs-left">{{ props.item.ctime }}</td>
                      <td class="text-xs-left">{{ props.item.mtime }}</td>
                    </template>
                  </v-data-table>
            </v-card-text>
        </v-card>
        <v-card v-if="iLog != null">
            <v-card-title class="title">{{logs[iLog].name}}</v-card-title>
            <v-card-text>
                <pre class="scv-log" >{{logs[iLog].log}}</pre>
            </v-card-text>
        </v-card>
    </v-sheet>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";

export default {
    name: 'Logs',
    data: () => {
        return {
            user:{},
            logs: [],
            headers: [{
                text: 'Log file',
                value: 'name',
            },{
                text: 'Size',
                value: 'size',
            },{
                text: 'Created',
                value: 'ctime',
            },{
                text: 'Last modified',
                value: 'mtime',
            }],
            iLog: null,
        }
    },
    methods: {
        getLogs() {
            var url = this.url('auth/logs');
            this.$http.get(url, this.authConfig).then(res => {
                this.logs = res.data;
            }).catch(e => {
                console.error(e.response);
            });
        },
        getLog(name) {
            var ilog = this.logs.reduce((acc,log,i) => {
                return log.name === name ? i : acc;
            }, 0);
            var url = this.url(`auth/log/${ilog}`);
            this.$http.get(url, this.authConfig).then(res => {
                Vue.set(this.logs[ilog], 'log', res.data);
                this.iLog = ilog;
            }).catch(e => {
                console.error(e.response);
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
        this.getLogs();
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
.scv-log {
    background: #eee;
    overflow-y: auto;
    max-height: 40em;
}
</style>
