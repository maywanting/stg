<template>
    <div id="setting">
        <div>Dimension Reduction Algorithm</div>
        <div>
            <md-field>
          <md-select>
              <md-option value="PCA">PCA</md-option>
              <md-option>t-SNE</md-option>
          </md-select>
        </md-field>
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
