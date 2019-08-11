<template>
    <details>
        <summary ref="refError" class="scv-help-title">{{search}} {{title}}</summary>
        <div class="ml-3">
            <div class=""> HTTP {{httpError}} </div>
            <div tabindex=0 class="scv-help-title">Instructions</div>
            <ul class="scv-help">
                <li tabindex=0>Search for suttas by acronym or SuttaCentral identifier
                    such as 
                    <i>DN 2</i>, 
                    <i>mn1/en/sujato</i>, 
                    <i>sn39.1-15</i>
                </li>
                <li  tabindex=0>
                    Search for suttas by phrase or keyword
                    such as 
                    <i>root of suffering</i>, 
                    <i>yellow blue red white</i>, 
                    <i>jhāna</i>, 
                    <i>Mūlapariyāya</i>, 
                </li>
                <li>
                    <a href="https://github.com/sc-voice/sc-voice/wiki/Search"
                        target="_blank">
                        View search documentation.
                    </a>
                </li>
                <li>
                    <a :href="searchSuttaCentral()">
                        Continue search for "{{search}}" on SuttaCentral.net
                    </a>
                </li>
            </ul>
        </div>
    </details>
</template>

<script>
/* eslint no-console: 0*/

export default {
    name: 'search-help',
    props: {
        httpError: null,
        search: {   
            default: "(search?)",
        },
        title: {
            default: 'Help',
        },
    },
    methods: {
        setFocus() {
            console.log(`search-help setting focus`);
            this.$nextTick(() => this.$refs.refError.focus());
        },
        searchSuttaCentral() {
            console.log('searchSuttaCentral', this.search);
            return `https://suttacentral.net/search?query=${this.search}`;
        },
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
button {
    background-color: #82B1FF;
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
