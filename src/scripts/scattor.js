import * as d3 from 'd3'
import {dataHub} from './dataHub'
import {publicSetting} from './public'

export default class Scattor {
    constructor() {
    }
    initScattor () {

        let element = document.getElementById("scattor")

        console.log(dataHub.originData)
        // const width = element.offsetWidth,
            // height = element.offsetHeight;
        // const x = d3.scaleLinear().range([0, width]);
        // const y = d3.scaleLinear().range([height, 0]);

        const svg = d3.select('#scattor')
            .call(d3.zoom().on("zoom", function() {
                svg.attr("transform", d3.event.transform)
            }))
            .append("g")

        let line = d3.line()
            .x(d => d[0] * 80)
            .y(d => d[1] * 80)

        svg.append("path")
            .datum(dataHub.originData)
            .attr('fill', 'none')
            .attr('opacity', '0.3')
            .attr('stroke', 'grey')
            .attr("stroke-width", 0.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line);
        svg.selectAll('.circle')
            .data(dataHub.originData)
            .enter().append('circle')
            .attr("class", (d, i) => {
                return 'cp' + dataHub.labels[i]
            })
            .attr('id', (d, i) => {
                return i;
            })
            .attr('cx', (d) => {
                return d[0] * 80;
            })
            .attr('cy', (d) => {
                return d[1] * 80;
            })
            .attr('r', 2)
            .style('fill', (d, i) => {
                if (dataHub.labels[i] == -1) {
                    return "grey"
                } else {
                    return publicSetting.colormap[dataHub.labels[i]]
                }
            });
    }
}
