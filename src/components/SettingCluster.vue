<template>
    <div id="setting-cluster">
        <md-field md-inline>
            <label>Label</label>
            <md-input v-model="inline"></md-input>
        </md-field>
        <div>
            <slider-picker v-model="colors"></slider-picker>
        </div>
        <div>
                            <md-button class="md-icon-button" @click="clearState(index)">
                                <md-icon>blur_off</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" @click="clearState(index)">
                                <md-icon>fullscreen</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" @click="clearState(index)">
                                <md-icon>open_with</md-icon>
                            </md-button>
        </div>
        <div>
                            <md-button class="md-icon-button" @click="deleteState(index)">
                                <md-icon class="md-accent">delete_sweep</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" @click="refresh()">
                                <md-icon class="md-primary">save_alt</md-icon>
                            </md-button>
                        </div>
    </div>
</template>

<script>
import {Slider} from 'vue-color'

let defaultProps = {
  hex: '#194d33e6',
  hsl: {
    h: 150,
    s: 0.5,
    l: 0.2,
    a: 0.9
  },
  hsv: {
    h: 150,
    s: 0.66,
    v: 0.30,
    a: 0.9
  },
  rgba: {
    r: 159,
    g: 96,
    b: 43,
    a: 0.9
  },
  a: 0.9
};
export default {
    name: 'SettingCluster',
    components: {
        'slider-picker': Slider,
    },
    data: () => ({
      colors: defaultProps,
    }),
    mounted() {
    },
    methods: {
    }
}
</script>

<style>
#setting-cluster {
    height: 90vh;
    width: 100%;
    padding: 10px;

    background-color: #FFF;
    border-style: solid;
    border-width: 1px 0 1px 1px;
    border-color: #DDD;
}
</style>
