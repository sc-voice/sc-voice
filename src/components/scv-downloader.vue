<template>
<div class="text-xs-center">
    <v-dialog persistent v-model="alert" 
        width="30em"
        dark>
        <v-card role="alertdialog" class="scv-alert-dialog"
            :style="cssProps">
            <v-card-actions>
                <div tabindex=0 ref="refAlert">
                    {{message}}
                </div>
                <v-spacer/>
                <v-btn id="btnSettings" icon dark 
                    class="scv-icon-btn" :style="cssProps"
                    aria-label="Cloze"
                    @click="dismiss()"
                    @blur="onblur()"
                    >
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</div>
</template>

<script>
/* eslint no-console: 0*/
import Vue from "vue";

export default {
    name: 'scv-downloader',
    props: {
        filename: String,
        url: String,
        alertType: {
            default: 'success',
        },
        focusElement: null,
    },
    data: function( ){
        return {
            alert: false,
            message: "",
        };
    },
    methods: {
        setFocus(elt) {
            if (elt instanceof Vue) {
                elt = elt.$el;
            }
            if (elt) {
                this.$nextTick(() => {
                    elt.focus();
                })
            }
        },
        update(status) {
            this.alert = true;
            this.message = `${status} ${this.filename}`;
            var elt = this.$refs.refAlert;
            this.setFocus(elt);
        },
        onblur() {
            var elt = this.$refs.refAlert;
            this.alert && this.setFocus(elt);
        },
        dismiss() {
            this.alert = false;
            this.setFocus(this.focusElement);
        },
        onKeypress(evt) {
            (evt.key === 'Enter' || evt.key === ' ') && this.dismiss();
        },
    },
    computed: {
        cssProps() {
            return {
                '--accent-color': this.$vuetify.theme.accent,
                '--success-color': this.$vuetify.theme.success,
            }
        },
    },
}
</script>
<style scoped>
.scv-alert-dialog {
    border-top: 2pt solid;
    border-bottom: 2pt solid;
}
</style>
