<template>
    <div>
        <svg id="original"></svg>
        <!--       <div id="detail">
            <span v-for="v, i in dataNames">
                <span v-bind:style="{'background-color': colors[i], 'color':'white'}">
                    {{v}}
                </span>
                <span>
                    : {{values[i]}}
                </span>
            </span>
        </div>-->
    </div>
</template>

    <script>
import original from '../scripts/original'
import {publicSetting} from '../scripts/public'

export default {
    name: 'OriginalData',
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
        this.eventHub.$on('timeInOriginal', time => this.original.displayTime(time))
        // this.eventHub.$on('initOriginal', data => this.original.init(data))
        this.eventHub.$on('stateInOriginal', stateId => this.original.displayState(stateId))
    }
}
</script>

<style scoped>
#original {
    height: 20vh;
    width: 100%;
}
</style>
