import '@babel/polyfill'
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
//import Vuetify from 'vuetify'
import './plugins/vuetify'
import App from './App.vue'

Vue.config.productionTip = false

Vue.use(VueAxios, axios);
//Vue.use(Vuetify);

new Vue({
    render: h => h(App)
}).$mount('#app')
