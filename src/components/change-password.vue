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
                v-model="user.username">
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
            username: "",
            isWaiting: false,
        }
    },
    methods: {
        onChangePassword() {
            console.log('change password tbd');
            this.dialog = false;
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
