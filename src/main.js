import '@babel/polyfill'
import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios'
import VueCookie from 'vue-cookie'
import VueAxios from 'vue-axios'
import Vuetify from 'vuetify'
import App from './App.vue'
import Authenticated from './components/authenticated.vue'
import Sutta from './components/sutta.vue'
import 'vuetify/dist/vuetify.min.css'

// eslint no-console 0 

Vue.use(VueAxios, axios);
Vue.use(VueRouter);
Vue.use(VueCookie);
Vue.use(Vuetify);

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

const vuetifyOptions = {
  theme: { 
    dark: true,
    themes: {
        dark: {
            primary: '#82B1FF',
            secondary:'#00ff00',
            accent: '#82B1FF',
        },
    }
  }
};

console.log(`mounting #app ...`);
var vueRoot = new Vue({
    render: h => h(App),
    router,
    data: scvSingleton,
    //el: '#app',
    vuetify: new Vuetify(vuetifyOptions),
    mounted() {
        console.log(`dbg vueRoot mounted`);
        scvSingleton.mounted(this);
    },
//});
}).$mount('#app')
console.log(`mounting #app OK`, typeof vueRoot);

//scvSingleton.mounted(vueRoot);

