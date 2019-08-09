<template>
<v-dialog v-model="dialog" v-if="token" persistent>
    <v-btn icon flat small slot="activator"
        @click="onActivated()">
        <v-icon>delete</v-icon>
    </v-btn>
    <v-card>
        <v-card-title class="deep-orange darken-3">
            <h3 class="">
                Delete User {{username}}
            </h3>
        </v-card-title>
        <v-card-text>
            Please confirm that you wish to delete user "{{username}}", who
            will no longer have access to authenticated Voice features:
            <v-checkbox v-model="confirm" v-if="username !== user.username"
                :label='`Yes. I wish to delete user "${username}".`'/>
            <v-checkbox v-model="confirm" v-else
                class="deep-orange lighten-4 pl-2 pt-4"  light
                :label='`Yes. I wish to delete myself`'/>
            <v-alert type="warning" :value="errMsg">
                {{errMsg}}
            </v-alert>
        </v-card-text>
        <v-card-actions>
            <v-btn flat small @click="dialog=false">Cancel</v-btn>
            <v-spacer/>
            <v-btn flat small
                :disabled="!confirm"
                @click="onDeleteUser()"
                >
                Delete
            </v-btn>
        </v-card-actions>
    </v-card>
</v-dialog> <!-- Delete User -->
</template>

<script>
/* eslint no-console: 0*/

export default {
    name: 'Login',
    data: () => {
        return {
            dialog: false,
            confirm: false,
            errMsg: null,
            user:{},
            isWaiting: false,
        }
    },
    props: {
        username: String,
        onDelete: Function,
    },
    methods: {
        onActivated() {
            console.log(`deleting user: ${this.username}`);
            this.errMsg = null;
            this.confirm = false;
            this.dialog = true;
        },
        onDeleteUser() {
            var username = this.username;
            var url = this.url('auth/delete-user');
            var config = {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                }
            }
            var data = {
                username,
            };
            this.$http.post(url, data, config).then(res => {
                console.log(`onDeleteUser() ${username} OK`, res.data);
                this.dialog = false;
                this.onDelete && this.onDelete();
            }).catch(e => {
                var data = e.response && e.response.data;
                this.errMsg = data.error || e.message;
                console.error(`onDeleteUser() ${username} failed`, 
                    Object.keys(e.response.data), e.stack);
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
    },
    computed: {
        gscv() {
            return this.$root.$data;
        },
        token() {
            return this.user.token;
        },
    },
}
</script>

<style scoped>
</style>
