import '@babel/polyfill'
import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios'
import VueAxios from 'vue-axios'
//import Vuetify from 'vuetify'
import './plugins/vuetify'
import App from './App.vue'
// eslint no-console 0 

const DEFAULT_VOICES = [{
    name: 'Amy',
    value: 'recite',
    label: 'Amy for meditation and contemplation',
},{
    name: 'Raveena',
    value: 'review',
    label: 'Raveena for review and study',
}];

Vue.use(VueAxios, axios);
Vue.use(VueRouter);
var router = new VueRouter();

/*
 * SC-Voice shared state
 */
const scvState = {
    showId: false,
    iVoice: 0,
    scid: null,
    search: null,
    maxResults: 5,
    lang: 'en',
};
Object.defineProperty(scvState, 'hash', {
    value: (opts={}) => {
        var state = Object.assign({}, scvState, opts);
        var hash = Object.keys(state).reduce((acc,key) => {
            var val = state[key];
            if (val != null) {
                if (acc == null) {
                    acc = `#/?`;
                } else {
                    acc = acc + '&';
                }
                acc += `${key}=${state[key]}`;
            }
            return acc;
        }, null);
        return `${hash}`;
    }
});
Object.defineProperty(scvState, 'url', {
    value: (opts={}) => {
        var hash = scvState.hash(opts);
        var loc = window.location;
        var r = Math.random();
        return `${loc.origin}${loc.pathname}?r=${r}${hash}`;
    }
});
Object.defineProperty(scvState, 'reload', {
    value: (opts={}) => {
        Object.assign(scvState, opts);
        var url = scvState.url();
        console.debug("main.scvState.reload()", url);
        window.location.href = url;
        return;
    }
});
Object.defineProperty(scvState, "voices", {
    value: DEFAULT_VOICES,
});
Object.defineProperty(scvState, "title", {
    writable: true,
    value: "no title",
});

Vue.config.productionTip = false

//Vue.use(Vuetify);

// global options

new Vue({
    render: h => h(App),
    router,
    data: scvState,
}).$mount('#app')
