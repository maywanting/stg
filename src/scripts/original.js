import * as d3 from 'd3'

export default class Original{
    constructor() {
    }
    init(data) {
        let element = document.getElementById("original")
        const width = element.clientWidth,
            height = element.clientHeight;

        let svg = d3.select("#original")
            // .attr('width', width).attr('height', height)
            .append('g')

        let scale_x = d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([0, width])

        let maxValue = Math.max(...data.join(',').split(','))

        let scale_y = d3.scaleLinear()
            .domain([0, maxValue])
            .range([height, 0])

        let colormap = [
            "#67B7DC",
            "#A367DC",
            "#DC6788",
            "#6771DC",
            "#DC8C67",
            "#DC67CE"
        ]

        for (let index = 0; index < 5; index++) {
            let linePath = d3.line()
                .x(function(d, i) {
                    return i})
                .y(function(d) { return scale_y(d[index])})
            svg.append("path")
                .attr('fill', 'none')
                .attr('stroke-width', 1)
                .attr('stroke', colormap[index])
                .attr('d', linePath(data))
        }
    }
}
