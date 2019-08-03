<template>
<div class="auth-grp">
    <login/>
    <v-tabs fixed-tabs v-model="tabsModel" v-if="token"
       class="auth-tabs"
       dark :color="tabsColor"
       slider-color="yellow accent-2">
        <v-tab> Users </v-tab>
        <v-tab-item dark>
            <admin-users/>
        </v-tab-item>
        <v-tab v-if="isAdmin"> Caches </v-tab>
        <v-tab-item v-if="isAdmin"> 
            <caches/>
        </v-tab-item>
        <v-tab v-if="isAdmin"> Releases </v-tab>
        <v-tab-item v-if="isAdmin"> 
            <releases/>
        </v-tab-item>
        <v-tab v-if="isAdmin"> VSM </v-tab>
        <v-tab-item v-if="isAdmin">
            <vsm/>
        </v-tab-item>
        <v-tab v-if="isAdmin"> Content<br/>Updater</v-tab>
        <v-tab-item v-if="isAdmin">
            <content-updater/>
        </v-tab-item>
        <v-tab v-if="isAdmin"> Logs </v-tab>
        <v-tab-item v-if="isAdmin">
            <logs/>
        </v-tab-item>
        <v-tab v-if="isTranslator || isEditor"> Content </v-tab>
        <v-tab-item v-if="isTranslator || isEditor">
            Translator/Editor stuff goes here...
        </v-tab-item>
    </v-tabs>
</div>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";
import AdminUsers from "./admin-users";
import Vsm from "./vsm";
import ContentUpdater from './content-updater';
import Logs from "./logs";
import Caches from "./caches";
import Releases from "./releases";
import Login from "./login";

export default {
    name: 'Authenticated',
    data: () => {
        return {
            user: {
                isTranslator: false,
                isEditor: false,
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
        isEditor() {
            return this.user.isEditor
        },
        isTranslator() {
            return this.user.isTranslator
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
        AdminUsers,
        Caches,
        Releases,
        ContentUpdater,
        Vsm,
        Logs,
        Login,
    },
}
</script>

<style scoped>
.auth-grp {
    display: flex;
    flex-flow: column;
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
