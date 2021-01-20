<template>
    <div id="setting">
        <div>highlight</div>
        <div>
            <md-button class="md-raised md-primary">
                trajectory
            </md-button>
            <md-button class="md-raised md-primary">
                state transition graph
            </md-button>
            <md-button class="md-raised md-primary">
                line graph
            </md-button>
            <md-button class="md-raised">
                scatter plot 1
            </md-button>
            <md-button class="md-raised md-primary">
                scatter plot 2
            </md-button>
        </div>
        <div>
            <label> previous timestep : </label>
            0
            <md-icon>arrow_drop_up</md-icon>
            <md-icon>arrow_drop_down</md-icon>
        </div>
        <div>
            <label> later timestep : </label>
            0
            <md-icon>arrow_drop_up</md-icon>
            <md-icon>arrow_drop_down</md-icon>
        </div>
    </div>
</template>

<script>

export default {
    name: 'Setting',
    components: {
    },
    data: () => ({
    }),
    mounted() {
    },
    methods: {
    }
}
</script>

<style>
#setting {
    height: 90vh;
    width: 100%;
    padding: 10px;

    background-color: #FFF;
    border-style: solid;
    border-width: 1px 0 1px 1px;
    border-color: #DDD;
}
</style>
