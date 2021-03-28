<template>
  <v-sheet style="border-top:3px solid #eee" light>
    <v-card >
      <v-card-title>
        <div class="headline"> 
          {{$vuetify.lang.t('$vuetify.auth.contentUpdater')}}
        </div>
      </v-card-title>
      <v-card-text>
        <div style="display:block; max-width:40em">
            {{$vuetify.lang.t("$vuetify.auth.updateBilaraIntro")}}
        </div>
        <div style="display:block; max-width:40em">
            <v-btn @click='onUpdateBilara()'
              color="deep-orange darken-3" dark >
              {{$vuetify.lang.t('$vuetify.auth.updateContent')}}
            </v-btn>
        </div>
        <div style="display:block; max-width:40em" v-if="updateBilaraRes">
            <table class="taskTable" >
                <tr><th>summary</th>
                    <td>{{updateBilaraRes.summary}}</td></tr>
                <tr><th>date</th>
                    <td>{{updateBilaraRes.date}}</td></tr>
                <tr><th>elapsed</th>
                    <td>{{updateBilaraRes.elapsed}}</td></tr>
                <tr><th>error</th>
                    <td>{{updateBilaraRes.error}}</td></tr>
            </table>
        </div>
      </v-card-text>
    </v-card>

  </v-sheet>
</template>

<script>
/* eslint no-console: 0*/

export default {
    name: 'ContentUpdater',
    data: () => {
        return {
            user:{},
            updateBilaraRes: null,
            updateError: null,
        }
    },
    methods: {
        onUpdateBilara() {
            var that = this;
            var url = that.url('auth/update-bilara');
            var data = {};
            that.$http.post(url, data, that.authConfig).then(res => {
                console.log(`update-bilara => `, res.data);
                that.updateBilaraRes = res.data;
                that.updateBilaraRes.date = 
                    new Date(res.data.date).toLocaleString();
            }).catch(e => {
                console.log('could not update content', e.response.data);
                that.updateError = e;
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
            return this.user && this.user.token;
        },
        authConfig() {
            return {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                }
            }
        },
        na() {
            return "--";
        },
    },
    components: {
    },
}
</script>

<style scoped>
.taskTable>tr>th {
    text-align: right;
    padding-right: 1em;
}
.taskTable>caption {
    text-align: left;
    font-weight: 800;
    font-style: italic;
}
</style>
