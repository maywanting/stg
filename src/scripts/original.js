import * as d3 from 'd3'
import {publicSetting} from './public'
import {dataHub} from './dataHub'

export default class Original{
    constructor() {
        this.scale_x = null
        this.scale_y = null
        this.x_width = 0 //half of width
        // this.dataName = ''
    }
    init(data) {
        // this.dataName = name
        let element = document.getElementById("original")
        const width = element.clientWidth,
            height = element.clientHeight;

        let svg = d3.select("#original")
            .attr('width', width).attr('height', height)
            .call(d3.zoom().on("zoom", function() {
                // svg.attr("transform", d3.event.transform.x)
                svg.attr("transform", () => {
                    let scale = "scale(" + d3.event.transform.k +", 1)"
                    let translate = "translate(" + d3.event.transform.x + ")"
                    return scale + translate
                })
            }))
            .append('g')


        let scale_x = d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([0, width])
        this.scale_x = scale_x

        this.x_width = (scale_x(1) - scale_x(0)) / 1.0

        let maxValue = Math.max(...data.join(',').split(','))
        let minValue = Math.min(...data.join(',').split(','))

        let scale_y = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range([height, 20])
        this.scale_y = scale_y


        for (let index = 0; index < 5; index++) {
            let linePath = d3.line()
                .x(function(d, i) {
                    return scale_x(i)})
                .y(function(d) {
                    return scale_y(d[index])})
            svg.append("path")
                .attr('fill', 'none')
                .attr('stroke-width', 1)
                .attr('stroke', publicSetting.colormap[index])
                .attr('d', linePath(data))
        }
    }
    displayTime(time) {
        let svg = d3.select("#original g")
        let x = this.scale_x(time)

        d3.select("#originalHighTime").remove()

        svg.append('line')
            .attr('x1', x)
            .attr('y1', 0)
            .attr('x2', x)
            .attr('y2', this.scale_y(0))
            .attr('id', 'originalHighTime')
            .style('stroke', 'red')
            .style('stroke-width', this.x_width)
    }
    displayState(stateId) {
        let svg = d3.select("#original g")
        d3.selectAll("#original .originalHighState").remove()
        for (let i = 0; i < dataHub.labels.length; i++) {
            if (dataHub.labels[i] == stateId) {
                let x = this.scale_x(i)
                svg.append('line')
                    .attr('x1', x)
                    .attr('y1', 0)
                    .attr('x2', x)
                    .attr('y2', this.scale_y(0))
                    .attr('class', 'originalHighState')
                    .attr('stroke', publicSetting.colormap[stateId])
                    .attr('stroke-width', this.x_width)
                    .attr('stroke-opacity', 0.3)
            }
        }
    }
}
