<template>
<form class="admin-grp">
    <v-card width="20em" light v-if="!token">
        <v-card-title primary-title>
            <h3>Translator/Admin Login</h3>
        </v-card-title>
        <v-card-text>
            <v-text-field label="Username" v-model="username">
            </v-text-field>
            <v-text-field label="Password" v-model="password" type="password" >
            </v-text-field>
            <v-alert type="warning" :value="loginError">
                {{loginError}}
            </v-alert>
        </v-card-text>
        <v-card-actions>
        token:{{token}}
            <v-spacer/>
            <v-btn small @click="onClickLogin" flat
                :disabled="!username || !password"
                >
                Login
            </v-btn>
        </v-card-actions>
    </v-card>
    <v-card width="40em" light v-if="token">
        <v-card-text>
        Welcome.
        {{token}}
        </v-card-text>
    </v-card>
</form>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";

export default {
    name: 'Login',
    data: () => {
        return {
            username: "",
            password: "",
            token: null,
            loginError: null,
        }
    },
    methods: {
        onClickLogin() {
            var username = this.username;
            var password = this.password;
            var url = this.url(`login`);
            var data = {
                username,
                password,
            }
            var that = this;
            this.loginError = null;
            this.$http.post(url, data).then(res => {
                //this.gscv.token = res.data;
                this.$nextTick(() => {
                    Vue.set(this, "token", res.data);
                });
                console.log(`login user:${username}`, res);
            }).catch(e => {
                Vue.set(that, "loginError", "Invalid Username/Password");
                console.error(e.stack);
            });
        },
        url(path) {
            return window.location.origin === 'http://localhost:8080'
                ? `http://localhost/scv/${path}`
                : `./${path}`;
        },
    },
    mounted() {
        Vue.set(this, "token", this.gscv.token);
        console.log('dbg admin mounted');
    },
    computed: {
        gscv() {
            return this.$root.$data;
        },
        //token() {
            //return this.gscv.token;
        //},
    },
}
</script>

<style scoped>
.admin-grp {
    margin-top: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
