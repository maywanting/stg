<template>
    <div id="app">
        <div class="md-layout">
            <div class="md-layout-item"><Attractor/></div>
            <div class="md-layout-item"><STG/></div>
        </div>
        <div class="md-layout">
            <div class="md-layout-item">
                <OriginalData/>
                <TimeBar/>
            </div>
            <div class="md-layout-item md-size-30">
                <Setting/>
            </div>
        </div>
    </div>
    </template>

    <script>
//import HelloWorld from './components/HelloWorld.vue'
import Attractor from './components/Attractor.vue'
import STG from './components/STG.vue'
import TimeBar from './components/TimeBar.vue'
import OriginalData from './components/OriginalData.vue'
import Setting from './components/Setting.vue'
import {dataHub} from './scripts/dataHub'

export default {
    name: 'app',
    data: () => ({
        projectName: 'food_chain',
        originData: '',
        clusterInfo: '',
    }),
    components: {
        Attractor,
        STG,
        TimeBar,
        OriginalData,
        Setting,
    },
    mounted() {
        //print attractor
        this.loadData('tsne')
            .then(dataset => {
                // console.log(dataset);
                this.originData = dataset;
                this.eventHub.$emit('initAttractor', dataset);
                this.eventHub.$emit('startSelectionInAttractor')
            })

        //print stg
        this.loadData('cluster')
            .then(dataset => {
                this.clusterInfo = dataset;
                dataHub.labels = dataset.labels
                this.eventHub.$emit('initSTG', dataset)
            });

        this.loadData('data')
            .then(dataset => {
                this.eventHub.$emit('initOriginal', dataset)
            })
    },
    methods: {
        async loadData(name) {
            const path = 'data/' + this.projectName + '/' + name + '.json';
            const res = await fetch(path);
            const data = await res.json();
            return data;
        }
    }
}
</script>

    <style>
        /* // #app {
            //   font-family: 'Avenir', Helvetica, Arial, sans-serif;
            //   -webkit-font-smoothing: antialiased;
            //   -moz-osx-font-smoothing: grayscale;
            //   text-align: center;
            //   color: #2c3e50;
            //   margin-top: 60px;
            // } */
            </style>
