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
                        <v-card color="grey lighten-3">
                            <v-card-title>
                                <v-spacer/>
                                <h3>{{props.item.username}}</h3>
                                <v-spacer/>
                            </v-card-title>
                            <v-divider/>
                            <v-list dense class="ml-2 mr-2">
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
                                  {{ dateString(props.item.dateAdded) }}
                                </v-list-tile-content>
                              </v-list-tile>
                              <v-list-tile>
                                <v-list-tile-content>
                                  Password set:
                                </v-list-tile-content>
                                <v-list-tile-content class="align-end">
                                  {{ dateString(props.item.dateSetPassword) }}
                                </v-list-tile-content>
                              </v-list-tile>
                              <v-list-tile>
                                <v-list-tile-content>
                                  Last login:
                                </v-list-tile-content>
                                <v-list-tile-content class="align-end">
                                  {{ dateString(props.item.dateAuthenticated) }}
                                </v-list-tile-content>
                              </v-list-tile>
                            </v-list>
                            <v-card-actions>
                                <change-password :username="props.item.username"/>
                                <v-spacer/>
                                <delete-user :username="props.item.username"
                                    :onDelete="onDeleteUser"/>
                            </v-card-actions>
                        </v-card>
                    </v-flex>
                </v-data-iterator>
              </v-container>
            </v-sheet>
            <add-user :onAdd="onAddUser"/>
        </v-card-text>
    </v-card>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";
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
        onDeleteUser(){
            console.log('onDeleteUser');
            this.getUsers();
        },
        onAddUser() {
            console.log('onAddUser');
            this.getUsers();
        },
        url(path) {
            return window.location.origin === 'http://localhost:8080'
                ? `http://localhost/scv/${path}`
                : `./${path}`;
        },
        dateString(date) {
            return date && date.toLocaleString() || this.na;
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
        DeleteUser,
        AddUser,
    },
}
</script>

<style scoped>
</style>
