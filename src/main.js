import '@babel/polyfill'
import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios'
import VueCookie from 'vue-cookie'
import VueAxios from 'vue-axios'
//import Vuetify from 'vuetify'
import './plugins/vuetify'
import App from './App.vue'
import Authenticated from './components/authenticated.vue'
import Sutta from './components/sutta.vue'
// eslint no-console 0 

Vue.use(VueAxios, axios);
Vue.use(VueRouter);
Vue.use(VueCookie);
var routes = [{
    path: "/auth",
    component: Authenticated,
},{
    path: "/sutta",
    component: Sutta,
},{
    path: "*",
    redirect: "/sutta",
}];

var router = new VueRouter({
    routes,
});

Vue.config.productionTip = false;

var scvSingleton = new exports.ScvSingleton({
    window,
    Vue,
});

console.log(`mounting #app ...`);
var vueRoot = new Vue({
    render: h => h(App),
    router,
    data: scvSingleton,
}).$mount('#app')
console.log(`mounting #app OK`);

scvSingleton.mounted(vueRoot);

