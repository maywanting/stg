<template>
    <svg id="original"></svg>
</template>

<script>
import original from '../scripts/original'

export default {
    name: 'OriginalData',
    data() {
        return {
            original: new original()
        }
    },
    mounted() {
        this.eventHub.$on('initOriginal', data => this.original.init(data))
    }
}
</script>

<style scoped>
#original {
    height: 20vh;
    width: 100%;
}
</style>
