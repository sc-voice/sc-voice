<template>
  <v-sheet style="border-top:3px solid #eee" light>
    <v-container fluid grid-list-md >
      <v-data-iterator
        :items="users"
        :items-per-page.sync="itemsPerPage"
        :footer-props="{ itemsPerPageOptions }"
        row wrap 
      >
        <template v-slot:default="props">
          <v-layout wrap>
            <v-flex 
              v-for="item in props.items" :key="item.name"
              xs12 sm6 md4 lg3 >
              <v-card color="grey lighten-3">
                <v-card-title>
                  <v-spacer/>
                  <h4>{{item.username}}</h4>
                  <v-spacer/>
                </v-card-title>
                <v-divider/>
                <v-list dense class="ml-2 mr-2">
                  <v-list-item>
                    <v-list-item-content>
                      {{ $vuetify.lang.t('$vuetify.auth.administrator') }}:
                    </v-list-item-content>
                    <v-list-item-content class="align-end">
                      {{ !!item.isAdmin }}
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      {{ $vuetify.lang.t('$vuetify.auth.translator') }}
                    </v-list-item-content>
                    <v-list-item-content class="align-end">
                      {{ !!item.isTranslator }}
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      {{ $vuetify.lang.t('$vuetify.auth.editor') }}
                    </v-list-item-content>
                    <v-list-item-content class="align-end">
                      {{ !!item.isEditor }}
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      {{ $vuetify.lang.t('$vuetify.auth.userAdded') }}
                    </v-list-item-content>
                    <v-list-item-content class="align-end">
                      {{ dateString(item.dateAdded) }}
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      {{ $vuetify.lang.t('$vuetify.auth.passwordSet') }}
                    </v-list-item-content>
                    <v-list-item-content class="align-end">
                      {{ dateString(item.dateSetPassword) }}
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      {{ $vuetify.lang.t('$vuetify.auth.lastLogin') }}
                    </v-list-item-content>
                    <v-list-item-content class="align-end">
                      {{ dateString(item.dateAuthenticated) }}
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <v-card-actions>
                    <change-password :username="item.username"/>
                    <v-spacer/>
                    <delete-user :username="item.username"
                        :onDelete="onDeleteUser"/>
                </v-card-actions>
              </v-card>
            </v-flex>
          </v-layout>
        </template>
      </v-data-iterator>
    </v-container>
    <add-user :onAdd="onAddUser"/>
  </v-sheet>
</template>

<script>
/* eslint no-console: 0*/
import ChangePassword from "./change-password";
import DeleteUser from "./delete-user";
import AddUser from "./add-user";

export default {
    name: 'AdminUsers',
    data: () => {
        return {
            user: {
            },
            users: [],
            isWaiting: false,
            itemsPerPage: 4,
            itemsPerPageOptions: [4, 8, 12],
        }
    },
    methods: {
        getUsers() {
            var url = this.url('auth/users');
            var config = {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                }
            }
            this.$http.get(url, config).then(res => {
                var usernames = Object.keys(res.data);
                this.users = usernames.map(username=>{
                    var user = res.data[username];
                    user.dateAdded && 
                        (user.dateAdded = new Date(user.dateAdded));
                    user.dateAuthenticated && 
                        (user.dateAuthenticated = new Date(user.dateAuthenticated));
                    user.dateSetPassword && 
                        (user.dateSetPassword = new Date(user.dateSetPassword));
                    return user;
                });
            }).catch(e => {
                console.error(`getUsers() failed`, e.stack);
            });
        },
        onDeleteUser(){
            console.log('onDeleteUser');
            this.getUsers();
        },
        onAddUser() {
            console.log('onAddUser');
            this.getUsers();
        },
        url(path) {
          var origin = window.location.origin;
          return origin.endsWith(':8080') 
            ? `${origin.substring(0, origin.length-5)}:3000/scv/${path}` 
            : `./${path}`;
        },
        dateString(date) {
            return date && date.toLocaleString() || this.na;
        },
    },
    mounted() {
        this.user = this.gscv.user;
        this.getUsers();
    },
    computed: {
        gscv() {
            return this.$root.$data;
        },
        token() {
            return this.user && this.user.token;
        },
        na() {
            return "--";
        },
        userHeaders() {
            var t = this.$vuetify.lang.t;
            return [{
                text: t('$vuetify.auth.username'),
                value: 'username',
            },{
                text: t('$vuetify.auth.isAdmin'),
                value: 'isAdmin',
            },{
                text: t('$vuetify.auth.dateAdded'),
                value: 'dateAdded',
            }];
        },
    },
    components: {
        ChangePassword,
        DeleteUser,
        AddUser,
    },
}
</script>

<style scoped>
</style>
