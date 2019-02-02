<template>
<div class="admin-grp">
    <v-card width="20em" >
        <v-sheet color="rgb(96,36,8)">
            <v-card-title primary-title>
                <h3>Admin Login</h3>
            </v-card-title>
            <v-card-text>
                <v-text-field label="Username" >
                </v-text-field>
                <v-text-field label="Password" type="password">
                </v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer/>
                <v-btn small secondary>
                    Login
                </v-btn>
            </v-card-actions>
        </v-sheet>
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
        }
    },
    methods: {
    },
}
</script>

<style scoped>
.admin-grp {
    margin-top: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
