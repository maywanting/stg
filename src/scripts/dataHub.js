export let dataHub = {
    'labels': [], //labeled as cluster id in time step
    'clusterIds': [], //cluster id lists in labels
    'clusterNames': [], //cluster name lists
    'transitionList': [], //nonrepeated label in labelw
    'nodeTransition': [], //external transition information
    'blockTransition': [], //inter transition information
    'selectionId': -1, //selection state id
    'position': [], //all the position info
    'centers': [], //center position of clusters
    'numCluster': [], //number of clusters
    'originData': [], //original time series data
    'datasets': [],
    'chords': [],
}
