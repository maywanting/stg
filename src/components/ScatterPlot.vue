<template>
    <svg id="scatter"></svg>
</template>

<script>
import Scattor from '../scripts/scattor'

export default {
    name: 'ScatterPlot',
    data() {
        return {
            sca : new Scattor(),
        }
    },
    mounted() {
        this.eventHub.$on('initScatter', data => this.sca.initScattor(data, 'scatter'))
    }
}
</script>

<style scoped>
#scatter {
    height: 25vh;
    width: 95%;

    background-color: #FFF;
    border-style: solid;
    border-width: 1px 1px 1px 1px;
    border-color: #DDD;
}
</style>
