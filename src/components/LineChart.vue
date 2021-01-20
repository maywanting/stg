<template>
    <div>
    <svg id="original"></svg>
</div>
</template>

<script>
import original from '../scripts/original'
import {publicSetting} from '../scripts/public'

export default {
    name: 'LineChart',
    data() {
        return {
            original: new original(),
            dataNames: ['a'],
            values: [],
            colors: publicSetting.colormap,
        }
    },
    mounted() {
        this.eventHub.$on('initOriginal', (data, dataNames) => {
            this.dataNames= dataNames
            this.values = [0, 2, 4, 2, 5]
            this.original.init(data)
        })
        // this.eventHub.$on('timeInOriginal', time => this.original.displayTime(time))
        // this.eventHub.$on('initOriginal', data => this.original.init(data))
        // this.eventHub.$on('stateInOriginal', stateId => this.original.displayState(stateId))
    }
}
</script>

<style scoped>
#original {
    height: 25vh;
    width: 100%;

    background-color: #FFF;
    border-style: solid;
    border-width: 1px 1px 1px 1px;
    border-color: #DDD;
}
</style>
