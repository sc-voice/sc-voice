<template>
  <v-dialog v-model="dialog" v-if="token" persistent>
    <template v-slot:activator="{ on }">
      <v-btn text v-on="on" @click="onActivate()">
        {{ $vuetify.lang.t('$vuetify.auth.addUser') }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="deep-orange darken-3">
        <h3 class="">Add User</h3>
      </v-card-title>
      <v-card-text>
        <v-text-field 
          :label="$vuetify.lang.t('$vuetify.auth.username')"
          autofocus
          v-model="username">
        </v-text-field>
        <form><!--Chrome silliness-->
          <v-text-field 
            :label="$vuetify.lang.t('$vuetify.auth.password')"
            type="password"
            autocomplete
            v-model="password">
          </v-text-field>
          <v-text-field 
            :label="$vuetify.lang.t('$vuetify.auth.confirmPassword')"
            type="password"
            autocomplete
            v-model="password2">
          </v-text-field>
        </form><!--Chrome silliness-->
        <v-checkbox height="1em"
            :label="$vuetify.lang.t('$vuetify.auth.administrator')"
            v-model="isAdmin">
        </v-checkbox>
        <v-checkbox height="1em"
            :label="$vuetify.lang.t('$vuetify.auth.translator')"
            v-model="isTranslator">
        </v-checkbox>
        <v-checkbox height="1em"
            :label="$vuetify.lang.t('$vuetify.auth.editor')"
            v-model="isEditor">
        </v-checkbox>
        <v-alert type="info" :value="!!statusMsg">
            {{statusMsg}}
        </v-alert>
        <v-alert type="warning" :value="!!errMsg">
            {{errMsg}}
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="dialog=false">
            {{ $vuetify.lang.t('$vuetify.auth.cancel') }}
        </v-btn>
        <v-spacer/>
        <v-btn @click="onAddUser()" text
            :disabled="disabled()"
            >
            {{ $vuetify.lang.t('$vuetify.auth.addUser') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog> <!-- Add User -->
</template>

<script>
/* eslint no-console: 0*/

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
            this.errMsg = null;
            this.statusMsg = null;
            this.username = "";
            this.password = "";
            this.password2 = "";
            this.isAdmin = false;
            this.isTranslator = false;
            this.isEditor = false;
            this.dialog = true;
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
            this.statusMsg = `Adding user ${this.username}...`;
            this.$http.post(url, data, config).then(res => {
                console.log(`onAddUser() ${username} OK`, res.data);
                this.onAdd && this.onAdd();
                this.dialog = false;
            }).catch(e => {
                this.errMsg = e.message;
                console.error(`onAddUser() ${username} failed`, e.stack);
            });
        },
        disabled(){
            return !this.username || !this.password ||
                this.password !== this.password2;
        },
        url(path) {
          var origin = window.location.origin;
          return origin.endsWith(':8080') 
            ? `${origin.substring(0, origin.length-5)}:3000/scv/${path}` 
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
            return this.user && this.user.token;
        },
    },
}
</script>

<style scoped>
</style>
