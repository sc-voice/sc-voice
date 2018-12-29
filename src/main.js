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

const DEFAULT_VOICES = [{
    name: 'Amy',
    value: 'recite',
    label: 'Amy for meditation and contemplation (slow)',
},{
    name: 'Russell',
    value: 'recite',
    label: 'Russell for general listening and high-frequency hearing loss (medium)',
},{
    name: 'Raveena',
    value: 'review',
    label: 'Raveena for review and study (fast)',
}];

const IPS_CHOICES = [{
    url: '',
    label: "Launch Sutta Player without sound",
    value: 0,
},{
    url: '/audio/rainforest-ambience-glory-sunz-public-domain.mp3',
    label: "Launch Sutta Player with Rainforest Ambience Glory Sunz (Public Domain)",
    volume: 0.1,
    value: 1,
},{
    url: '/audio/indian-bell-flemur-sampling-plus-1.0.mp3',
    label: "Launch Sutta Player with Indian Bell by Flemur (Sampling Plus 1.0)",
    volume: 0.1,
    value: 2,
},{
    url: '/audio/tibetan-singing-bowl-horst-cc0.mp3',
    label: "Launch Sutta Player with Tibetan Singing Bowl by Horst (CC0)",
    volume: 0.3,
    value: 3,
},{
    url: '/audio/jetrye-bell-meditation-cleaned-CC0.mp3',
    label: "Launch Sutta Player with Bell Meditation Cleaned by JetRye (CC0)",
    volume: 0.1,
    value: 4,
}];

Vue.use(VueAxios, axios);
Vue.use(VueRouter);
Vue.use(VueCookie);
var router = new VueRouter();

/*
 * SC-Voice shared state
 */
const scvState = {
    showId: 0,
    iVoice: 0,
    scid: null,
    showLang: 0,
    search: null,
    maxResults: 5,
    ips: 4,
    lang: 'en',
};
var vueRoot;
Object.defineProperty(scvState, "deleteCookies", {
    value: () => {
        vueRoot.$cookie.delete('useCookies');
        Object.keys(scvState).forEach(key => {
            vueRoot.$cookie.delete(key);
        });
        console.log('cookies deleted');
    },
});
Object.defineProperty(scvState, "loadCookie", {
    value: (prop) => {
        var v = vueRoot.$cookie.get(prop);
        if (v != null) {
            var vnum = Number(v);
            Vue.set(scvState, prop, `${vnum}`===v ? vnum : v);
        }
    },
});
Object.defineProperty(scvState, "changed", {
    value: (prop) => {
        var cookie = vueRoot.$cookie;
        var v = scvState[prop];
        if (v != null && vueRoot) {
            if (scvState.useCookies) {
                cookie.set(prop, v);
                console.log(`setting cookie (${prop}):${v}`,
                    `${vueRoot.$cookie.get(prop)}`, 
                    typeof vueRoot.$cookie.get(prop));
            }
            if (prop === 'useCookies') {
                if (v) {
                    cookie.set( "showId", scvState.showId);
                    cookie.set( "iVoice", scvState.iVoice);
                    cookie.set( "maxResults", scvState.maxResults);
                    cookie.set( "showLang", scvState.showLang);
                    cookie.set( "ips", scvState.ips);
                    cookie.set( "useCookies", scvState.useCookies);
                    console.log(`saved settings to cookies`, cookie);
                } else {
                    cookie.delete( 'useCookies' );
                }
            }
        }
    },
});
Object.defineProperty(scvState, "ipsChoices", {
    writable: true,
    value: IPS_CHOICES,
});

Vue.config.productionTip = false

// global options

vueRoot = new Vue({
    render: h => h(App),
    router,
    data: scvState,
}).$mount('#app')

var cookie = vueRoot.$cookie;
var useCookies = cookie.get('useCookies') === 'true';
if (useCookies) {
    scvState.loadCookie('showId');
    scvState.loadCookie('iVoice');
    scvState.loadCookie('maxResults');
    scvState.loadCookie('showLang');
    scvState.loadCookie('ips');
}
Object.defineProperty(scvState, 'hash', {
    value: (opts={}) => {
        var state = Object.assign({}, scvState, opts);
        var hash = '';
        if (scvState.useCookies) {
            var search = state.search || '';
            hash = `#/?search=${search}`;
        } else {
            hash = Object.keys(state).reduce((acc,key) => {
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
        }
        return `${hash}`;
    }
});
Object.defineProperty(scvState, 'url', {
    value: (opts={}) => {
        var hash = scvState.hash(opts);
        var loc = window.location;
        //return `${loc.origin}${loc.pathname}${hash}`;
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
Object.defineProperty(scvState, "useCookies", {
    writable: true,
    value: cookie.get("useCookies") === 'true',
});

