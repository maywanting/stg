<template>
    <div id="setting">
        <div>Scatter Plot 1</div>
        <div>
            <md-field>
                <label>X-axis:</label>
            <md-select>
                <md-option value="C1">C1</md-option>
              <md-option>t-SNE</md-option>
          </md-select>
        </md-field>
        </div>
        <div>
            <md-field>
                <label>Y-axis:</label>
            <md-select>
              <md-option value="R">R</md-option>
              <md-option>t-SNE</md-option>
          </md-select>
        </md-field>
    </div>
    <md-switch v-model="boolean" class="md-primary">line</md-switch>
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
