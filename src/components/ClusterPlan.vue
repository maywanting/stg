<template>
    <div id="cluster-plan" class="md-layout">
        <div class="md-layout-item">
            <md-chip class="md-primary" md-deletable md-clickable>Plan 1</md-chip>
            <md-chip class="md-primary" md-deletable md-clickable>Plan 2</md-chip>
            <md-chip class="md-primary" md-deletable md-clickable>Plan 3</md-chip>
            <md-chip class="md-primary" md-deletable md-clickable>Plan 4</md-chip>
        </div>
        <div class="md-layout-item md-size-5">
            <md-icon>settings</md-icon>
        </div>
    </div>
</template>

<script>
// import STG from '../scripts/stg'

export default {
    name: 'ClusterPlan',
    data() {
        return {
            // stg: new STG()
        }
    },
    mounted() {
        // this.eventHub.$on('initSTG', data => this.stg.initSTG(data))
        // this.eventHub.$on('timeInSTG', data => this.stg.timeInSTG(data))
        // this.eventHub.$on('highStateInSTG', stateId => this.stg.highState(stateId))
        // this.eventHub.$on('recoveFromHighInSTG', () => this.stg.recoveFromHigh())
    }
}
</script>

<style scoped>
#cluster-plan {
    background-color: #FFF;
    padding: 5px 16px;
    border-style: solid;
    border-width: 0 0 1px 0;
    border-color: #DDD;
    margin-bottom: 8px;
}

</style>
