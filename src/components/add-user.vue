<template>
    <v-dialog v-model="dialog" v-if="token" persistent>
        <v-btn flat slot="activator" @click="onActivate()">
            Add User
        </v-btn>
        <v-card>
            <v-card-title class="deep-orange darken-3">
                <h3 class="">Add User</h3>
            </v-card-title>
            <v-card-text>
                <v-text-field label="Username" 
                    v-model="username">
                </v-text-field>
                <form><!--Chrome silliness-->
                    <v-text-field label="Password"
                        type="password"
                        autocomplete
                        v-model="password">
                    </v-text-field>
                    <v-text-field label="Confirm password"
                        type="password"
                        autocomplete
                        v-model="password2">
                    </v-text-field>
                </form><!--Chrome silliness-->
                <v-checkbox label="Administrator" height="1em"
                    v-model="isAdmin">
                </v-checkbox>
                <v-checkbox label="Translator" height="1em"
                    v-model="isTranslator">
                </v-checkbox>
                <v-checkbox label="Editor" height="1em"
                    v-model="isEditor">
                </v-checkbox>
                <v-alert type="info" :value="statusMsg">
                    {{statusMsg}}
                </v-alert>
                <v-alert type="warning" :value="errMsg">
                    {{errMsg}}
                </v-alert>
            </v-card-text>
            <v-card-actions>
                <v-btn flat @click="dialog=false">Cancel</v-btn>
                <v-spacer/>
                <v-btn @click="onAddUser()" flat
                    :disabled="disabled()"
                    >
                    Add User
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog> <!-- Add User -->
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";

export default {
    name: 'AdminUsers',
    data: () => {
        return {
            username: "",
            password: "",
            password2: "",
            isAdmin: false,
            isTranslator: false,
            isEditor: false,
            dialog: false,
            errMsg: null,
            statusMsg: null,
            user: {
            },
            isWaiting: false,
        }
    },
    props: {
        onAdd: Function,
    },
    methods: {
        onActivate() {
            console.log('onActivate()');
            Vue.set(this, "errMsg", null);
            Vue.set(this, "statusMsg", null);
            Vue.set(this, "username", "");
            Vue.set(this, "password", "");
            Vue.set(this, "password2", "");
            Vue.set(this, "isAdmin", false);
            Vue.set(this, "isTranslator", false);
            Vue.set(this, "isEditor", false);
            Vue.set(this, "dialog", true);
        },
        onAddUser() {
            var username = this.username;
            console.log(`onAddUser ${username}`);
            var url = this.url('auth/add-user');
            var config = {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                }
            }
            var data = {
                username,
                password: this.password,
                isAdmin: this.isAdmin,
                isTranslator: this.isTranslator,
                isEditor: this.isEditor,
            };
            Vue.set(this, "statusMsg", `Adding user ${this.username}...`);
            this.$http.post(url, data, config).then(res => {
                console.log(`onAddUser() ${username} OK`, res.data);
                this.onAdd && this.onAdd();
                this.dialog = false;
            }).catch(e => {
                Vue.set(this, "errMsg", e.message);
                console.error(`onAddUser() ${username} failed`, e.stack);
            });
        },
        disabled(){
            return !this.username || !this.password ||
                this.password !== this.password2;
        },
        url(path) {
            return window.location.origin === 'http://localhost:8080'
                ? `http://localhost/scv/${path}`
                : `./${path}`;
        },
    },
    mounted() {
        Vue.set(this, "user", this.gscv.user);
    },
    computed: {
        gscv() {
            return this.$root.$data;
        },
        token() {
            return this.user && this.user.token;
        },
    },
}
</script>

<style scoped>
</style>
