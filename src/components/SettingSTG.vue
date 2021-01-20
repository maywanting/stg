<template>
    <div id="setting">
        <div>
            <md-switch value="true" class="md-primary">label</md-switch>
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
