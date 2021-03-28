<template>
<div class="login-grp">
    <v-card width="20em" light v-if="!user.token">
        <v-form :submit="onLogin">
            <v-card-title primary-title>
                <h3>
                  {{$vuetify.lang.t('$vuetify.auth.voiceLogin')}}
                </h3>
            </v-card-title>
            <v-card-text>
                <v-text-field 
                    :label="$vuetify.lang.t('$vuetify.auth.username')"
                    v-model="username"
                    ref="refUsername">
                </v-text-field>
                <v-text-field 
                    :label="$vuetify.lang.t('$vuetify.auth.password')"
                    v-model="password" 
                    ref="refPassword"
                    type="password"   
                    autocomplete>
                </v-text-field>
                <v-alert type="warning" :value="!!loginError">
                    {{loginError}}
                </v-alert>
                <div v-if="isWaiting">
                    {{$vuetify.lang.t('$vuetify.auth.loggingIn')}}
                </div>
            </v-card-text>
            <v-card-actions>
                <router-link class="scv-a" to="/app" aria-hidden=true >
                    <v-btn small text light
                        :disabled="isWaiting" >
                        {{$vuetify.lang.t('$vuetify.auth.cancel')}}
                    </v-btn>
                </router-link>
                <v-spacer/>
                <v-btn small @click="onLogin" text light
                    type="submit"
                    :disabled="isWaiting || !username || !password" >
                    {{$vuetify.lang.t('$vuetify.auth.login')}}
                </v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</div>
</template>

<script>
/* eslint no-console: 0*/

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
                that.isWaiting = false;
                that.gscv.user = res.data;
                that.user = this.gscv.user;
                setTimeout(()=>that.autoLogout(window.location.href),60*60*1000);
                console.log(`onLogin() ${username} ${this.gscv.user}`);
            }).catch(e => {
                that.isWaiting = false;
                that.loginError = 
                    that.$vuetify.lang.t('$vuetify.auth.invalidUsernamePassword');
                console.error(e.stack);
            });
        },
        autoLogout(url) {
            console.log(`autoLogout()`, window.location);
            if (window.location.href.indexOf("#/auth") > 0) {
                window.location = url;
                window.location.reload(true);
            }
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
