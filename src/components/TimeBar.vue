<template>
    <div>
        <input type="range" v-model.number="amount" max=1999 class="timebar"> {{ amount }}
    </div>
</template>

<script>
export default {
    name: 'TimeBar',
    data: () => ({
        amount: 0
    }),
    watch: {
        amount: function(val, oldVal) {
            this.eventHub.$emit('timeInAttractor', val);
            this.eventHub.$emit('timeInSTG', val);
            this.eventHub.$emit('timeInOriginal', val)
        }
    }
}
</script>

<style>
    .timebar {
        width: 95%
    }
</style>
