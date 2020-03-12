<template>
    <svg id="scattor"></svg>
</template>

<script>
import Scattor from '../scripts/scattor'

export default {
    name: 'Scattor',
    data() {
        return {
            sca : new Scattor(),
        }
    },
    mounted() {
        this.eventHub.$on('initScattor', data => this.sca.initScattor(data))
    }
}
</script>

<style>
#scattor {
    height: 25vh;
    width: 100%;
}
</style>
