<template>
    <div id="app">
        <ClusterPlan/>
        <div class="md-layout md-gutter">
            <div class="md-layout-item md-size-10"><Cluster/></div>
            <div class="md-layout-item">
                <Time/>
                <div class="md-layout md-gutter">
                    <div class="md-layout-item"><Trajectory/></div>
                    <div class="md-layout-item"><STG/></div>
                </div>
                <div class="md-layout md-gutter">
                    <div class="md-layout-item">
                        <LineChart/>
                    </div>
                    <div class="md-layout-item md-layout">
                        <div class="md-layout-item">
                            <ScatterPlot/>
                        </div>
                        <div class="md-layout-item">
                            <Scattor/>
                        </div>
                    </div>
                </div>
            </div>
            <div class="md-layout-item md-size-15">
                <Setting/>
            </div>
        </div>
    </div>
</template>

<script>
import ClusterPlan from './components/ClusterPlan.vue'
import Cluster from './components/Cluster.vue'
import Time from './components/Time.vue'
import Trajectory from './components/Trajectory.vue'
import STG from './components/STG.vue'
import LineChart from './components/LineChart.vue'
import ScatterPlot from './components/ScatterPlot.vue'
import Setting from './components/Setting.vue'

import {dataHub} from './scripts/dataHub'
import DataProcesser from './scripts/dataProcesser'
// import Attractor from './components/Attractor.vue'
// import TimeBar from './components/TimeBar.vue'
// import OriginalData from './components/OriginalData.vue'
import Scattor from './components/Scattor.vue'

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
        originData: '',
        clusterInfo: '',
        dataProcesser: new DataProcesser(),
        timeseries: '',
    }),
    components: {
        ClusterPlan,
        Cluster,
        Time,
        Trajectory,
        STG,
        LineChart,
        ScatterPlot,
        Scattor,
        Setting,
    },
    async mounted() {
        await this.loadData('cluster')
            .then(dataset => {
                this.clusterInfo = dataset;
                dataHub.labels = dataset.labels;
                // dataHub.clusterIds = dataset.ids;
                dataHub.clusterIds = [0, 1, 2, 3, 4]
                dataHub.clusterNames = dataHub.clusterIds
            });
        // await this.loadData('position')
        await this.loadData('tsne')
        // await this.loadData('pca')
            .then(dataset => {
                dataHub.position = dataset
            })

        let dataName = ['P1', 'P2', 'C1', 'C2', 'R']
        // let dataName = ['Rot', 'Cal', 'Pico', 'Nano']

        this.dataProcesser.init()
        // this.eventHub.$emit('initClusterSetting', dataHub.clusterIds, dataHub.clusterNames)
        this.eventHub.$emit('initSTG', this.clusterInfo)

        console.log(dataHub.position)
        this.eventHub.$emit('initAttractor', dataHub.position);
        // this.eventHub.$emit('startSelectionInAttractor')

        await this.loadData('data')
            .then(dataset => {
                dataHub.originData = dataset
            })

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
    }
}
</script>

<style>
    #app {
        background-color: #F7F7F7;
    }
    .md-layout {
        margin-bottom: 8px
    }
</style>
