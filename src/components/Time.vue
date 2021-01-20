<template>
    <div>
        <input type="range" v-model.number="amount" max=1999 class="timebar"> {{ amount }}
    </div>
</template>

<script>
export default {
    name: 'Time',
    data: () => ({
        amount: 0
    }),
    watch: {
        amount: function(val, oldVal) {
            // this.eventHub.$emit('timeInAttractor', val);
            // this.eventHub.$emit('timeInSTG', val);
            // this.eventHub.$emit('timeInOriginal', val)
        }
    }
}
</script>

<style scoped>
.timebar {
    width: 95%
}
div {
    background-color: #FFF;

    border-style: solid;
    border-width: 1px;
    border-color: #DDD;
    margin-bottom: 8px;
}
</style>
