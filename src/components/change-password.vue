<template>
<v-dialog v-model="dialog" v-if="token" persistent>
    <v-btn flat slot="activator">
        Change Password
    </v-btn>
    <v-card>
        <v-card-title class="deep-orange darken-3">
            <h3 class="">
                Change Password 
            </h3>
        </v-card-title>
        <v-card-text>
            <v-text-field label="Username" 
                disabled
                v-model="username">
            </v-text-field>
            <form ><!-- Chrome silliness-->
                <v-text-field label="New password" 
                    type="password"
                    autocomplete
                    v-model="password">
                </v-text-field>
                <v-text-field label="Confirm password" 
                    type="password"
                    autocomplete
                    v-model="password2">
                </v-text-field>
            </form ><!-- Chrome silliness-->
        </v-card-text>
        <v-card-actions>
            <v-btn flat @click="dialog=false">Cancel</v-btn>
            <v-spacer/>
            <v-btn flat 
                :disabled="disabled()"
                @click="onChangePassword()"
                >
                Change
            </v-btn>
        </v-card-actions>
    </v-card>
</v-dialog> <!-- Change Password -->
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";

export default {
    name: 'Login',
    data: () => {
        return {
            dialog: false,
            password: "",
            password2: "",
            user:{},
            disabled() {
                return !this.password || this.password !== this.password2;
            },
            isWaiting: false,
        }
    },
    props: {
        username: String,
    },
    methods: {
        onChangePassword() {
            console.log(`change password for ${this.username}`);
            this.dialog = false;
            var url = this.url('auth/set-password');
            var config = {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                }
            }
            var username = this.username;
            var data = {
                username,
                password: this.password,
            };
            this.$http.post(url, data, config).then(res => {
                console.log(`onChangePassword() ${username} OK`, res.data);
            }).catch(e => {
                console.error(`onChangePassword() ${username} failed`, e.stack);
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
        token() {
            return this.user.token;
        },
    },
}
</script>

<style scoped>
</style>
