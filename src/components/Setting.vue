<template>
    <div id="setting">
        <md-card md-theme="black-card">
            <md-card-content>
                <md-button v-for="i in num" class="md-raised teal lighten-2" v-on:click="highState(i-1)">S{{i}}</md-button>
            </md-card-content>
        </md-card>
    </div>
</template>

<script>
import {publicSetting} from '../scripts/public'

export default {
    name: 'Setting',
    data: () => ({
        num: 5,
        color: publicSetting.colormap,
    }),
    methods: {
        highState: function(stateId) {
            this.eventHub.$emit('highStateInAttractor', stateId)
        }
    }
}
</script>

<style>
</style>
