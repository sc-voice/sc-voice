<template>
    <v-dialog v-model="dialog" v-if="token" persistent>
        <v-btn flat slot="activator">
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
                </form><!--Chrome silliness-->
                <v-checkbox label="Administrator"
                    v-model="isAdmin">
                </v-checkbox>
            </v-card-text>
            <v-card-actions>
                <v-btn flat @click="dialog=false">Cancel</v-btn>
                <v-spacer/>
                <v-btn @click="onAddUser" flat
                    :disabled="!username || !password"
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
    name: 'AddUser',
    data: () => {
        return {
            username: "",
            password: "",
            isAdmin: false,
            dialog: false,
            user: {
            },
            isWaiting: false,
        }
    },
    methods: {
        onAddUser() {
            console.log('onAddUser tbd');
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
            return this.user && this.user.token;
        },
    },
}
</script>

<style scoped>
</style>
