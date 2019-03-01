<template>
<div class="login-grp">
    <v-card width="20em" light v-if="!user.token">
        <v-form :submit="onLogin">
            <v-card-title primary-title>
                <h3>Voice Login</h3>
            </v-card-title>
            <v-card-text>
                <v-text-field label="Username" v-model="username"
                    ref="refUsername">
                </v-text-field>
                <v-text-field label="Password" v-model="password" 
                    ref="refPassword"
                    type="password"   
                    autocomplete>
                </v-text-field>
                <v-alert type="warning" :value="loginError">
                    {{loginError}}
                </v-alert>
                <div v-if="isWaiting">
                    Logging in...
                </div>
            </v-card-text>
            <v-card-actions>
                <router-link class="scv-a" to="/app" aria-hidden=true >
                    <v-btn small flat light
                        :disabled="isWaiting" >
                        Cancel
                    </v-btn>
                </router-link>
                <v-spacer/>
                <v-btn small @click="onLogin" flat light
                    type="submit"
                    :disabled="isWaiting || !username || !password" >
                    Login
                </v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</div>
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
            user: {
            },
            isWaiting: false,
            loginError: null,
        }
    },
    methods: {
        onLogin() {
            var username = this.username;
            var password = this.password;
            if (!username || !password || this.isWaiting) {
                return;
            }
            var url = this.url(`login`);
            var data = {
                username,
                password,
            }
            var that = this;
            this.loginError = null;
            this.isWaiting = true;
            console.log(`onLogin() ${username}`);
            this.$http.post(url, data).then(res => {
                Vue.set(this, "isWaiting", false);
                this.gscv.user = res.data;
                Vue.set(this, "user", this.gscv.user);
                console.log(`onLogin() ${username} ${this.gscv.user}`);
            }).catch(e => {
                Vue.set(this, "isWaiting", false);
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
        Vue.set(this, "user", this.gscv.user);
    },
    computed: {
        gscv() {
            return this.$root.$data;
        },
    },
}
</script>

<style scoped>
.login-grp {
    margin-top: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
