<template>
    <div id="cluster">
        <md-list>
            <md-list-item @click="">0</md-list-item>
            <md-list-item @click="">1</md-list-item>
            <md-list-item @click="">2</md-list-item>
            <md-list-item @click="">3</md-list-item>
            <md-list-item @click="">4</md-list-item>
            <md-list-item>
                <md-icon>add</md-icon>
            </md-list-item>
        </md-list>
    </div>
</template>

<script>
// import STG from '../scripts/stg' 

export default {
    name: 'Cluster',
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
#cluster {
    background-color: #FFF;
    height: 95vh;
    border-style: solid;
    border-width: 1px 1px 1px 0;
    border-color: #DDD;
}

</style>
