<template>
    <details>
        <summary>Help</summary>
        <div class="scv-help-title">HTTP Response Status</div>
        <div >{{httpError}}</div>
        <div class="scv-help-title">Sutta Identifier Search</div>
        <div>
        Search for suttas by SuttaCentral identifier 
        (e.g., "mn1", "an2.1-10", "dn2", "sn3.18").
        </div>
        <div class="scv-help-title">Keyword Search 
            <span class="caption">NOT IMPLEMENTED</span></div>
        <div>
        Search for suttas with given keyword(s) (e.g., "root of suffering")
        </div>
        <div class="scv-help-title">Title Search 
            <span class="caption">NOT IMPLEMENTED</span></div>
        <div>
        Search for suttas with English or romanized Pali title:
        <br/><code class="ml-2">root of all things</code>
        <br/><code class="ml-2">mulapariyaya</code>
        </div>
        <div class="scv-help-title">Literal Search 
            <span class="caption">NOT IMPLEMENTED</span></div>
        <div>
        Search for suttas having exact match of quoted text. 
        <br/><code class="ml-2">"Root of All Things"</code>
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
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
button {
    background-color: var(accentColor);
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.scv-scid {
    display: inline-block;
    font-size: xx-small;
    color: #888;
    padding-right: 1em;
}
.scv-section-body {
    width: 40em;
}
.scv-header {
    margin-bottom: 0.5em;
}
.scv-header-body {
    font-style: italic;
    margin-left: 1.4em;
}
.scv-para {
    margin-top: 0.5em;
    padding-left: 1.5em;
    margin-bottom: 0.2em;
}
.scv-sutta {
    width: 40em;
    padding-left: auto;
    padding-right: auto;
}
.scv-text-button {
    border-radius: 4px;
    border: 1pt solid #888;
    padding-left: 0.4em;
    padding-right: 0.4em;
    text-align: center;
    margin-left: 1.2em;
}
.scv-text-button:focus {
    border-color: var(--accent-color);
    outline: 1pt solid var(--accent-color);
}
.scv-search-row {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
}
.scv-icon-btn {
    margin: 0;
}
.scv-icon-btn:focus {
    border-radius:5px;
    border: 1pt solid var(--accent-color);
}
.scv-error {
    background-color: #403030 !important;
    border-top: 2pt solid #ff3232;
    border-bottom-left-radius: .5em;
    border-bottom-right-radius: .5em;
    padding: 0.4em;
    padding-left: 0.5em;
    padding-right: 0.5em;
    margin-top: 0.5em;
    margin-bottom: 1em;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}
.scv-sutta-col {
    border: 1pt solid red;
}
.scv-help-title {
    font-weight: 900;
    margin-top: 0.5em;
}
</style>
