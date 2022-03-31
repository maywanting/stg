<!-- test for stg-->
<template>
    <STG/>
    <!--   <div id="app">
        <md-app>
            <md-app-toolbar class="md-primary">
                <md-button class="md-icon-button" @click="toggleMenu" v-if="!menuVisible">
                    <md-icon>menu</md-icon>
                </md-button>
                <span class="md-title">My Title</span>
            </md-app-toolbar>
            <md-app-drawer :md-active.sync="menuVisible" md-persistent="full">
                <md-toolbar class="md-transparent" md-elevation="0">
                    <span>class list</span>
                    <div class="md-toolbar-section-end">
                        <md-button class="md-icon-button md-dense" @click="toggleMenu">
                            <md-icon>keyboard_arrow_left</md-icon>
                        </md-button>
                    </div>
                </md-toolbar>

                <Setting/>
            </md-app-drawer>

            <md-app-content>
                <div class="md-layout">
                    <div class="md-layout-item"><Attractor/></div>
                    <div class="md-layout-item"><STG/></div>
                </div>
                <div class="md-layout">
                    <div class="md-layout-item">
                        <TimeBar/>
                        <OriginalData/>
                    </div>
                    <div class="md-layout-item md-size-40">
                        <Scattor/>
                    </div>
                </div>
            </md-app-content>
        </md-app>
        </div>-->
    </template>

    <script>
import STG from './components/STG.vue'
// import Attractor from './components/Attractor.vue'
// import TimeBar from './components/TimeBar.vue'
import OriginalData from './components/OriginalData.vue'
// import Setting from './components/Setting.vue'
import {dataHub} from './scripts/dataHub'
import DataProcesser from './scripts/dataProcesser'
// import Scattor from './components/Scattor.vue'

export default {
    name: 'app',
    data: () => ({
        // projectName: 'mesocosm',
        // projectName: 'demo1',
        // projectName: 'demo2',
        // projectName: 'demo3',
        // projectName: 'demo4',
        // projectName: 'demo5',
        // projectName: 'demo6',
        // projectName: 'demo9',
        projectName: 'food_chain',
        // projectName: 'food_chain_edge',
        // projectName: 'twitter',
        // projectName: 'maizuru',
        // projectName: 'corpus_ja',
        originData: '',
        clusterInfo: '',
        dataProcesser: new DataProcesser(),
        menuVisible: false,
        timeseries: '',
    }),
    components: {
        // Attractor,
        STG,
        // TimeBar,
        OriginalData,
        // Setting,
        // Scattor,
    },
    async mounted() {
        //print stg
        await this.loadData('cluster')
            .then(dataset => {
                this.clusterInfo = dataset;
            });
        //print attractor
        // await this.loadData('position')
        await this.loadData('tsne')
        // await this.loadData('pca')
            .then(dataset => {
                // console.log(dataset);
                this.originData = dataset;
            })

        dataHub.labels = this.clusterInfo.labels
        dataHub.clusterIds = this.clusterInfo.ids
        dataHub.clusterIds = [0, 1, 2, 3, 4]
        dataHub.clusterNames = dataHub.clusterIds
        // dataHub.clusterNames = ['A', 'B', 'C', 'D', 'E']
        let dataName = ['P1', 'P2', 'C1', 'C2', 'R']
        // let dataName = ['Rot', 'Cal', 'Pico', 'Nano']
        dataHub.position = this.originData
        this.dataProcesser.init()
        // this.eventHub.$emit('initClusterSetting', dataHub.clusterIds, dataHub.clusterNames)
        this.eventHub.$emit('initSTG', this.clusterInfo)

        // this.eventHub.$emit('initAttractor', this.originData);
        // this.eventHub.$emit('startSelectionInAttractor')

        // console.log(dataHub)
        await this.loadData('data')
            .then(dataset => {
                this.timeseries = dataset
            })
        dataHub.originData = this.timeseries
        this.eventHub.$emit('initOriginal', dataHub.originData, dataName)
        this.eventHub.$emit('initScattor', dataHub.originData)
    },
    methods: {
        async loadData(name) {
            const path = 'data/' + this.projectName + '/' + name + '.json';
            const res = await fetch(path);
            const data = await res.json();
            return data;
        },
        toggleMenu () {
        this.menuVisible = !this.menuVisible
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
