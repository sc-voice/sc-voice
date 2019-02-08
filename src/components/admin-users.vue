<template>
    <v-card>
        <v-card-text >
            <v-sheet light>
              <v-container fluid grid-list-md >
                <v-data-iterator
                  :items="users"
                  :rows-per-page-items="userRowsPerPageItems"
                  :pagination.sync="pagination"
                  content-tag="v-layout"
                  row wrap light
                >
                    <v-flex slot="item" slot-scope="props"
                        xs12 sm6 md4 lg3 >
                        <v-card>
                            <v-card-title>
                                <v-spacer/>
                                <h3>{{props.item.username}}</h3>
                                <v-spacer/>
                            </v-card-title>
                            <v-divider/>
                            <v-list dense>
                              <v-list-tile>
                                <v-list-tile-content>
                                  Administrator:
                                </v-list-tile-content>
                                <v-list-tile-content class="align-end">
                                  {{ props.item.isAdmin }}
                                </v-list-tile-content>
                              </v-list-tile>
                              <v-list-tile>
                                <v-list-tile-content>
                                  User added:
                                </v-list-tile-content>
                                <v-list-tile-content class="align-end">
                                  {{ props.item.dateAdded.toLocaleString() || na}}
                                </v-list-tile-content>
                              </v-list-tile>
                              <v-list-tile>
                                <v-list-tile-content>
                                  Password set:
                                </v-list-tile-content>
                                <v-list-tile-content class="align-end">
                                  {{ props.item.dateSetPassword.toLocaleString() || na}}
                                </v-list-tile-content>
                              </v-list-tile>
                              <v-list-tile>
                                <v-list-tile-content>
                                  Last login:
                                </v-list-tile-content>
                                <v-list-tile-content class="align-end">
                                  {{ props.item.dateAuthenticated.toLocaleString() || na}}
                                </v-list-tile-content>
                              </v-list-tile>
                            </v-list>
                            <v-card-actions>
                                <change-password :username="props.item.username"/>
                            </v-card-actions>
                        </v-card>
                    </v-flex>
                </v-data-iterator>
              </v-container>
            </v-sheet>
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
        </v-card-text>
    </v-card>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";
import ChangePassword from "./change-password";

export default {
    name: 'AdminUsers',
    data: () => {
        return {
            username: "",
            password: "",
            isAdmin: false,
            dialog: false,
            user: {
            },
            users: [],
            isWaiting: false,
            userRowsPerPageItems: [4, 8, 12],
            pagination: {
                rowsPerPage: 4
            },
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
                Vue.set(this, "users", usernames.map(username=>{
                    var user = res.data[username];
                    user.dateAdded && 
                        (user.dateAdded = new Date(user.dateAdded));
                    user.dateAuthenticated && 
                        (user.dateAuthenticated = new Date(user.dateAuthenticated));
                    user.dateSetPassword && 
                        (user.dateSetPassword = new Date(user.dateSetPassword));
                    return user;
                }));
            }).catch(e => {
                console.error(`getUsers() failed`, e.stack);
            });
        },
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
            return [{
                text: 'Username',
                value: 'username',
            },{
                text: 'Admin?',
                value: 'isAdmin',
            },{
                text: 'Added',
                value: 'dateAdded',
            }];
        },
    },
    components: {
        ChangePassword,
    },
}
</script>

<style scoped>
</style>
