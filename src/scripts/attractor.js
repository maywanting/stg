import * as d3 from 'd3'
import {dataHub} from './dataHub'
import {publicSetting} from './public'

export default class Attractor {
    constructor() {
        this.position = []
        this.theto = 1
        this.selection = {
            'clickTime' : "",
            'startLoc' : [],
            'endLoc' : [],
            'flag' : "",
        }
    }
    initAttractor(data) {
        d3.select("#attractor g").remove()
        this.position = dataHub.position
        let element = document.getElementById("attractor")

        const width = element.offsetWidth,
            height = element.offsetHeight;
        const x = d3.scaleLinear().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        // const svg = d3.select('#attractor').attr('width', width).attr('height', height)
        const svg = d3.select('#attractor')
            .call(d3.zoom().on("zoom", function() {
                svg.attr("transform", d3.event.transform)
            }))
            .append("g")

        let line = d3.line()
            .x(d => d[0])
            .y(d => d[1]);
        svg.append("path")
            .datum(dataHub.position)
            .attr("fill", "none")
            .attr("opacity", "0.3")
            .attr("stroke", "grey")
            .attr("stroke-width", 0.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line);
        svg.selectAll('.circle')
            .data(dataHub.position)
            .enter().append('circle')
            .attr("class", (d, i) => {
                return 'cp' + dataHub.labels[i]
            })
            .attr('id', (d, i) => {
                return i;
            })
            .attr('cx', (d) => {
                return d[0];
            })
            .attr('cy', (d) => {
                return d[1];
            })
            .attr('r', 2)
            .style('fill', (d, i) => {
                if (dataHub.labels[i] == -1) {
                    return "grey"
                } else {
                    return publicSetting.colormap[dataHub.labels[i]]
                }
            });

        // this.timeInAttractor(20);
    }

    highState(stateId) {
        this.removeHighState()
        const svg = d3.select("#attractor g");
        for (let i = 0; i < this.position.length; i++) {
            if (dataHub.labels[i] == stateId){
                svg.append('circle')
                    .attr('cx', this.position[i][0])
                    .attr('cy', this.position[i][1])
                    .attr('class', 'high')
                    .attr('r', 3)
                    .attr('fill', publicSetting.colormap[stateId])
            }
        }
    }

    removeHighState() {
        const svg = d3.select("#attractor g");
        svg.selectAll('.high').remove();
    }

    //selection part
    drawSelection() {
        const svg = d3.select("#attractor");
        let rect = svg.append("rect")
            .attr("width", 0)
            .attr("height", 0)
            .attr("fill", "rgba(33, 20, 50, 0.2)")
            .attr("stroke", "#ccc")
            .attr("stroke-width", "0px")
            .attr("transform", "translate(0, 0)")
            .attr("id", "squareSelect")

        svg.on("mousedown", () => {
            console.log("selection start");
            // this.selection.clickTime = (new Date()).getTime(); //mark start time
            this.selection.flag = true; //selection start
            rect.attr("transform", "translate(" + d3.event.layerX + "," + d3.event.layerY + ")")
            this.selection.startLoc = [d3.event.layerX, d3.event.layerY]
        })

        svg.on("mousemove", () => {
            if ( this.selection.flag == true) {
                console.log("selection move")
                let width = d3.event.layerX - this.selection.startLoc[0]
                let height = d3.event.layerY - this.selection.startLoc[1]
                if (width < 0) {
                    rect.attr("transform", "translate(" + d3.event.layerX + "," + this.selection.startLoc[1] + ")")
                }
                if (height < 0) {
                    rect.attr("transform", "translate(" + this.selection.startLoc[0] + "," + d3.event.layerY + ")")
                }
                if (height < 0 && width < 0) {
                    rect.attr("transform", "translate(" + d3.event.layerX + "," + d3.event.layerY + ")")
                }
                rect.attr("width", Math.abs(width))
                    .attr("height", Math.abs(height))
            }
        })

        svg.on("mouseup", () => {
            console.log("selection over")
            if (this.selection.flag == true) {
                this.selection.flag = false;
                this.selection.endLoc = [d3.event.layerX, d3.event.layerY];
                let leftTop = []
                let rightBottom = []
                if (this.selection.endLoc[0] >= this.selection.startLoc[0]) {
                    leftTop[0] = this.selection.startLoc[0]
                    rightBottom[0] = this.selection.endLoc[0]
                } else {
                    leftTop[0] = this.selection.endLoc[0]
                    rightBottom[0] = this.selection.startLoc[0]
                }
                if (this.selection.endLoc[1] >= this.selection.startLoc[1]) {
                    leftTop[1] = this.selection.startLoc[1]
                    rightBottom[1] = this.selection.endLoc[1]
                } else {
                    leftTop[1] = this.selection.endLoc[1]
                    rightBottom[1] = this.selection.startLoc[1]
                }



                rect.attr("width", 0).attr("height", 0)
                let nodes = d3.selectAll("#attractor circle")
                    .style('fill', (d, i) => {
                        if (dataHub.labels[i] == -1) {//other labeled point will not be clustered
                            // console.log(d3.transform(d3.select(this).attr('transform')).translate())
                            if (d[0] > leftTop[0] && d[0] < rightBottom[0] && d[1] > leftTop[1] && d[1] < rightBottom[1]) {

                                dataHub.labels[i] = dataHub.selectionId
                                return publicSetting.colormap[dataHub.selectionId]
                            }
                        }
                        if (dataHub.labels[i] == -1) {
                            return 'grey'
                        } else {
                            return publicSetting.colormap[dataHub.labels[i]]
                        }
                    })
                    .attr("class", (d, i) => {
                        return 'cp' + dataHub.labels[i]
                    })
            }
        })
    }
    timeInAttractor(time) {
        const svg = d3.select("#attractor g");
        svg.selectAll('.time').remove();
        const length = 5
        svg.append('circle')
            .attr('cx', this.position[time][0])
            .attr('cy', this.position[time][1])
            .attr('class', 'time')
            .attr('r', 4)
            .attr('fill', "red")
        for (let i = time + 1; i < 2000 && i < time+length; i++) {
            svg.append('circle')
                .attr('cx', this.position[i][0])
                .attr('cy', this.position[i][1])
                .attr('class', 'time')
                .attr('r', 4)
                .attr('fill', "blue")
                .attr('opacity', (0.5/length)*(length - i + time))

            svg.append("line")
                .attr("x1", this.position[i-1][0])
                .attr("y1", this.position[i-1][1])
                .attr("x2", this.position[i][0])
                .attr("y2", this.position[i][1])
                .attr('class', 'time')
                .attr('stroke', 'blue')
                .attr('stroke-width', 1)
                .attr('opacity', (0.5/length)*(length - i + time))
        }
        for (let i = time - 1; i >= 0 && i > time-length; i--) {
            svg.append('circle')
                .attr('cx', this.position[i][0])
                .attr('cy', this.position[i][1])
                .attr('class', 'time')
                .attr('r', 4)
                .attr('fill', "red")
                .attr('opacity', (0.5/length)*(length - time + i))

            svg.append("line")
                .attr("x2", this.position[i+1][0])
                .attr("y2", this.position[i+1][1])
                .attr("x1", this.position[i][0])
                .attr("y1", this.position[i][1])
                .attr('stroke', 'red')
                .attr('stroke-width', 1)
                .attr('class', 'time')
                .attr('opacity', (0.5/length)*(length - time + i))
        }
    }
    clearState (stateId) {
        this.removeHighState()
        const svg = d3.select("#attractor g")
        svg.selectAll('.cp' + stateId)
            .attr('class', '.cp-1')
            .style('fill', 'grey')
        for (let i = 0; i < dataHub.labels.length; i++) {
            if (dataHub.labels[i] == stateId) {
                dataHub.labels[i] = -1
            }
        }
        console.log(dataHub.labels)
    }
    zoomable() {
        let svg = d3.select('#attractor')
            .call(d3.zoom().on("zoom", function() {
                svg.attr("transform", d3.event.transform)
            }))
    }
    zoomunable() {
        d3.select("#attractor").on('.zoom', null)
    }
}
