import {dataHub} from './dataHub'

export default class DataProcesser {
    constructor() {
    }
    init() {
        this.generateTransitionList()
        this.generateExternalTransition()
        this.generateInterTransition()
        this.calculateCenterPos()
    }
    generateTransitionList() {
        let nodeTransitionList = [dataHub.labels[0]];
        let last = 0
        for (let i = 1; i < dataHub.labels.length; i++) {
            if ((dataHub.labels[i] != nodeTransitionList[last]) && (dataHub.labels[i] != -1)) {
                last++
                nodeTransitionList.push(dataHub.labels[i])
            }
        }
        if (nodeTransitionList[0] == -1) {
            nodeTransitionList = nodeTransitionList.slice(1)
        }
        dataHub.transitionList = nodeTransitionList
    }
    generateExternalTransition() {
        let nodeTransition = []
        for (let i = 0; i < dataHub.clusterIds.length; i++) {
            let temp = []
            for (let j = 0; j < dataHub.clusterIds.length; j++) {
                temp.push(0)
            }
            nodeTransition.push(temp)
        }

        //nodeTransition calculation
        for (let i = 1; i < dataHub.transitionList.length; i++) {
            nodeTransition[dataHub.transitionList[i-1]][dataHub.transitionList[i]] += 1;
        }
        dataHub.nodeTransition = nodeTransition
    }
    //blockTransition
    generateInterTransition() {
        let blockTransition = []
        for (let i = 0; i < dataHub.clusterIds.length; i++) {
            let tempi = [];
            for (let j = 0; j < dataHub.clusterIds.length; j++) {
                let tempj = [];
                for (let k = 0; k < dataHub.clusterIds.length; k++) {
                    tempj.push(0)
                }
                tempi.push(tempj)
            }
            blockTransition.push(tempi)
        }

        //blockTransition calculation
        for (let i = 1; i < dataHub.transitionList.length - 1; i++) {
            blockTransition[dataHub.transitionList[i]][dataHub.transitionList[i-1]][dataHub.transitionList[i+1]] += 1;
        }
        dataHub.blockTransition = blockTransition
    }
    calculateCenterPos() {
        let centers = []
        let numCluster = []
        for (let i = 0; i < dataHub.clusterIds.length; i++) {
            centers.push([0, 0])
            numCluster.push(0)
        }

        console.log(dataHub.position)
        console.log(dataHub.labels)
        for (let i = 0; i < dataHub.labels.length; i++) {
            if (dataHub.labels[i] != -1) {
                // console.log(i)
                centers[dataHub.labels[i]][0] += dataHub.position[i][0]
                centers[dataHub.labels[i]][1] += dataHub.position[i][1]
                numCluster[dataHub.labels[i]] += 1
            }
        }

        for (let i = 0; i < dataHub.clusterIds.length; i++) {
            centers[i][0] = centers[i][0] / numCluster[i]
            centers[i][1] = centers[i][1] / numCluster[i]
        }
        dataHub.centers = centers
        dataHub.numCluster = numCluster
    }
    cleanCluster(index) {
        for (let i = 0; i < dataHub.labels.length; i++) {
            if (dataHub.labels[i] > index) {
                dataHub.labels[i]--
            }
        }
    }
}
