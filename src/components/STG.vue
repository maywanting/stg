<template>
    <svg id="stg"></svg>
</template>

<script>
import STG from '../scripts/stg'

export default {
    name: 'STG',
    data() {
        return {
            stg: new STG()
        }
    },
    mounted() {
        this.eventHub.$on('initSTG', data => this.stg.initSTG(data))
        this.eventHub.$on('timeInSTG', data => this.stg.timeInSTG(data))
        // this.eventHub.$on('highStateInSTG', stateId => this.stg.highState(stateId))
        // this.eventHub.$on('recoveFromHighInSTG', () => this.stg.recoveFromHigh())
    }
}
</script>

<style scoped>
#stg {
    height: 80vh;
    width: 100%;

    background-color: #FFF;
    /* border-style: solid;
    // border-width: 1px;
    // border-color: #DDD;*/
}
</style>
