<template>
    <div id="setting">
        <md-content>
                <md-list class="md-dense">
                    <md-list-item v-for="value, index in clusterIds" @click="highState(value)">
                        <span v-if="editFlag == index">
                        <md-field md-inline>
                            <label>{{clusterNames[index]}}</label>
                            <md-input v-model="clusterNames[index]"></md-input>
                        </md-field>
                    </span>
                        <span v-else>{{clusterNames[index]}}</span>
                        <span v-if="editFlag == index">
                            <md-button class="md-icon-button" @click="refresh()">
                                <md-icon class="md-primary">save_alt</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" @click="clearState(index)">
                                <md-icon>blur_off</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" @click="deleteState(index)">
                                <md-icon class="md-accent">delete_sweep</md-icon>
                            </md-button>
                        </span>
                        <md-button class="md-icon-button" @click="changeStatus(index)" v-else>
                            <md-icon>edit</md-icon>
                        </md-button>
                    </md-list-item>
                    <md-list-item @click="addState"><md-icon class="md-primary">add</md-icon></md-list-item>
                </md-list>
                <!-- </div>
            <div class="md-layout-item">
                <md-button class="md-raised" @click="removeFocus()">focus remove</md-button>
            </div>
        </div>-->
    </md-content>
    </div>
</template>

<script>
import {publicSetting} from '../scripts/public'
import {dataHub} from '../scripts/dataHub'
import DataProcesser from '../scripts/dataProcesser'

export default {
    name: 'Setting',
    data: () => ({
        clusterIds: [],
        clusterNames: [],
        editFlag: -1, //index in clusterIds
        color: publicSetting.colormap,
        selection: [],
        dataProcesser: new DataProcesser(),
    }),
    mounted() {
        this.eventHub.$on('initClusterSetting', (ids, names) => {
            this.clusterNames = names
            this.clusterIds = ids
        })
    },
    methods: {
        highState: function(stateId) {
            if (stateId != this.editFlag) {
                this.eventHub.$emit('highStateInAttractor', stateId)
                this.eventHub.$emit('highStateInSTG', stateId)
                this.eventHub.$emit('stateInOriginal', stateId)
            }
        },
        changeStatus: function(index) {
            this.editFlag = index
            dataHub.selectionId = index
            this.eventHub.$emit('removeHighStateInAttractor')
            this.eventHub.$emit('zoomUnableInAttractor')
        },
        clearState: function(index) {
            this.eventHub.$emit('clearStateInAttractor', this.clusterIds[index])
        },
        refresh: function() {
            this.editFlag = -1
            this.dataProcesser.init()
            this.eventHub.$emit('initSTG', this.clusterInfo)
            console.log("label")
            console.log(dataHub.labels)
            // this.eventHub.$emit('zoomableInAttractor')
        },
        deleteState: function(index) {
            this.eventHub.$emit('clearStateInAttractor', this.clusterIds[index])

            this.clusterIds.pop()
            dataHub.clusterIds = this.clusterIds
            this.clusterNames = this.clusterNames.slice(0, index).concat(this.clusterNames.slice(index+1))
            dataHub.clusterNames = this.clusterNames
            this.dataProcesser.cleanCluster(index)

            this.editFlag = -1
            this.dataProcesser.init()
            this.eventHub.$emit('initSTG', this.clusterInfo)
            this.eventHub.$emit('initAttractor', this.clusterInfo)
            this.eventHub.$emit('zoomableInAttractor')
            console.log("label")
            console.log(dataHub.labels)
        },
        addState: function() {
            let id = this.clusterIds.length
            this.clusterIds.push(id)
            dataHub.clusterIds = this.clusterIds
            this.clusterNames.push(id)
            dataHub.clusterNames = this.clusterNames
        },
        removeFocus: function() {
            this.eventHub.$emit('removeHighStateInAttractor')
            // this.eventHub.$emit('zoomableInAttractor')
            this.eventHub.$emit('recoveFromHighInSTG')
        }
    }
}
</script>

<style>
</style>
