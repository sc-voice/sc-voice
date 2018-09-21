<template>
    <details>
        <summary class="scv-help-title">{{title}}</summary>
        <div class="ml-3">
            <div class=""> HTTP {{httpError}} </div>
            <div class="scv-help-title">Instructions</div>
            <ul class="scv-help">
                <li>Search for suttas by SuttaCentral identifier 
                    such as 
                    <i>mn1</i>, 
                    <i>dn2</i>, 
                    <i>sn39.1-15</i>
                </li>
                <li>Leave SuttaCentral Voice Assistant and continue search 
                    at&nbsp;<a :href="searchSuttaCentral()">SuttaCentral.net</a>
                </li>
                <li class="scv-not-implemented">
                    Search for suttas with keywords 
                    such as <i>root of suffering</i>
                    &nbsp;<span class="caption">NOT IMPLEMENTED</span>
                </li>
                <li class="scv-not-implemented">
                    Search for suttas exactly matching quoted text 
                    such as "Root of All Things"
                    &nbsp;<span class="caption">NOT IMPLEMENTED</span>
                </li>
                <li class="scv-not-implemented">
                    Search for suttas with English or romanized Pali title such as
                    <i>root of all things</i> or <i>mulapariyaya</i>
                    &nbsp;<span class="caption">NOT IMPLEMENTED</span>
                </li>
            </ul>
        </div>
    </details>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";
const MAX_SECTIONS = 100;

export default {
    name: 'search-help',
    props: {
        httpError: null,
        title: {
            default: 'Help',
        },
    },
    methods: {
        searchSuttaCentral() {
            return `https://suttacentral.net/search?query=${this.$root.$data.scid}`;
        },
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
button {
    background-color: var(accentColor);
}
.scv-help > li {
    list-style-type: disc !important;
}
.scv-help-title {
    font-weight: 900;
    margin-top: 0.5em;
}
.scv-not-implemented {
    color: #888;
}
</style>
