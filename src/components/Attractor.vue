<template>
    <svg id="attractor"></svg>
</template>

<script>
import Attractor from '../scripts/attractor'

export default {
    name: 'Attractor',
    data() {
        return {
            at: new Attractor(),
        }
    },
    mounted() {
        this.eventHub.$on('initAttractor', data => this.at.initAttractor(data))
        this.eventHub.$on('timeInAttractor', timeId => this.at.timeInAttractor(timeId))
        this.eventHub.$on('startSelectionInAttractor', () => this.at.drawSelection())
        this.eventHub.$on('highStateInAttractor', stateId => this.at.highState(stateId))
    }
}
</script>

<style scoped>
#attractor {
    height: 75vh;
    width: 100%;
}
</style>
