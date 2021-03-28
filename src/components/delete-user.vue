<template>
  <v-dialog v-model="dialog" v-if="token" persistent>
    <template v-slot:activator="{ on }">
      <v-btn icon text small 
        v-on="on"
        @click="onActivated()">
        <v-icon>delete</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="deep-orange darken-3">
        <h3 class="">
          {{ $vuetify.lang.t('$vuetify.auth.deleteUser') }}
          {{username}}
        </h3>
      </v-card-title>
      <v-card-text>
          {{ $vuetify.lang.t('$vuetify.auth.confirmDeleteUser') }}
          <v-checkbox v-model="confirm" v-if="username !== user.username"
              autofocus
              :label='yesDeleteUser + username'/>
          <v-checkbox v-model="confirm" v-else
              autofocus
              class="deep-orange lighten-4 pl-2 pt-4"  light
              :label='yesDeleteMe + username'/>
          <v-alert type="warning" :value="!!errMsg">
              {{errMsg}}
          </v-alert>
      </v-card-text>
      <v-card-actions>
          <v-btn text small @click="dialog=false">
            {{ $vuetify.lang.t('$vuetify.auth.cancel') }}
          </v-btn>
          <v-spacer/>
          <v-btn text small
            :disabled="!confirm"
            @click="onDeleteUser()"
            >
            {{ $vuetify.lang.t('$vuetify.auth.delete') }}
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
            return this.user.token;
        },
        yesDeleteMe() {
            return this.$vuetify.lang.t("$vuetify.auth.yesDeleteMe");
        },
        yesDeleteUser() {
            return this.$vuetify.lang.t("$vuetify.auth.yesDeleteUser");
        },
    },
}
</script>

<style scoped>
</style>
