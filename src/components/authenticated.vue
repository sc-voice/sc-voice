<template>
<div class="auth-grp">
    <login/>
    <v-tabs fixed-tabs v-model="tabsModel" v-if="token"
       class="auth-tabs"
       dark :color="tabsColor"
       slider-color="yellow accent-2">
        <v-tab> Users </v-tab>
        <v-tab-item>
            <change-password/>
            <add-user/>
        </v-tab-item>
        <v-tab> Releases </v-tab>
        <v-tab-item>
            Release stuff goes here...
        </v-tab-item>
        <v-tab> Translator </v-tab>
        <v-tab-item>
            Translator stuff goes here...
        </v-tab-item>
    </v-tabs>
</div>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";
import ChangePassword from "./change-password";
import AddUser from "./add-user";
import Login from "./login";

export default {
    name: 'Authenticated',
    data: () => {
        return {
            user: {
            },
            tabsModel: null,
            isWaiting: false,
            loginError: null,
        }
    },
    methods: {
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
        isAdmin() {
            return this.user.isAdmin
        },
        tabsColor() {
            return this.isAdmin
                ? "deep-orange darken-3"
                : "indigo darken-2"
        },
    },
    components: {
        AddUser,
        ChangePassword,
        Login,
    },
}
</script>

<style scoped>
.auth-grp {
    display: flex;
    justify-content: center;
    align-items: center;
}
a.v-tabs__item {
    color: #ff00ff !important;
}
.auth-tabs {
    width: 100%;
}
</style>
