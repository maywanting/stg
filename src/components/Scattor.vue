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
        this.eventHub.$on('initScattor', data => this.sca.initScattor(data, 'scattor'))
    }
}
</script>

<style>
#scattor {
    height: 25vh;
    width: 100%;

    background-color: #FFF;
    border-style: solid;
    border-width: 1px 1px 1px 1px;
    border-color: #DDD;
}
</style>
