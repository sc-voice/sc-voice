import '@babel/polyfill'
import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios'
import VueCookie from 'vue-cookie'
import VueAxios from 'vue-axios'
//import Vuetify from 'vuetify'
import './plugins/vuetify'
import App from './App.vue'
// eslint no-console 0 

Vue.use(VueAxios, axios);
Vue.use(VueRouter);
Vue.use(VueCookie);
var router = new VueRouter();

Vue.config.productionTip = false;

var scvSingleton = new exports.ScvSingleton({
    window,
    Vue,
});

var vueRoot = new Vue({
    render: h => h(App),
    router,
    data: scvSingleton,
}).$mount('#app')

scvSingleton.mounted(vueRoot);

