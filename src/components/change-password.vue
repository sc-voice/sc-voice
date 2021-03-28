<template>
<v-dialog v-model="dialog" v-if="token" persistent>
  <template v-slot:activator="{ on }">
    <v-btn text small light v-on="on" >
      {{ $vuetify.lang.t('$vuetify.auth.changePassword') }}
    </v-btn>
  </template>
  <v-card>
    <v-card-title class="deep-orange darken-3">
      <h3 class="">
        {{ $vuetify.lang.t('$vuetify.auth.changePassword') }}
      </h3>
    </v-card-title>
    <v-card-text>
      <v-text-field 
        :label="$vuetify.lang.t('$vuetify.auth.username')"
        disabled
        v-model="username">
      </v-text-field>
      <form ><!-- Chrome silliness-->
        <v-text-field 
          :label="$vuetify.lang.t('$vuetify.auth.newPassword')"
          type="password"
          autofocus
          autocomplete
          v-model="password">
        </v-text-field>
        <v-text-field 
          :label="$vuetify.lang.t('$vuetify.auth.confirmPassword')"
          type="password"
          autocomplete
          v-model="password2">
        </v-text-field>
      </form ><!-- Chrome silliness-->
    </v-card-text>
    <v-card-actions>
      <v-btn text small @click="dialog=false">
        {{ $vuetify.lang.t('$vuetify.auth.cancel') }}
      </v-btn>
      <v-spacer/>
      <v-btn text small
          :disabled="disabled()"
          @click="onChangePassword()"
          >
          {{ $vuetify.lang.t('$vuetify.auth.changePassword') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog> <!-- Change Password -->
</template>

<script>
/* eslint no-console: 0*/

export default {
    name: 'ChangePassword',
    data: () => {
        return {
            dialog: false,
            password: "",
            password2: "",
            user:{},
            disabled() {
                var pwdMismatch = this.password && this.password2 
                    && this.password !== this.password2;
                return !this.password || pwdMismatch;
            },
            isWaiting: false,
        }
    },
    props: {
        username: String,
    },
    methods: {
        onChangePassword() {
            var username = this.username;
            console.log(`change password for ${username}`);
            this.dialog = false;
            var url = this.url('auth/set-password');
            var config = {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                }
            }
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
          var origin = window.location.origin;
          return origin.endsWith(':8080') 
            ? `${origin.substring(0, origin.length-5)}:3000/scv/${path}` 
            : `./${path}`;
        },
    },
    mounted() {
        this.user = this.gscv.user;
    },
    updated() {
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
