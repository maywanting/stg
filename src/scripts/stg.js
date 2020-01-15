import * as d3 from 'd3'
import {publicSetting} from './public'

function drawPoint(x, y, group) {
    let point = group.append("circle").attr("cx", x).attr("cy", y).attr("r", 5).attr("fill", "red");
}

function transPosition(r, angle, x = 0, y = 0) {
    let rx = Math.sin(angle) * r + x;
    let ry = 0 - Math.cos(angle) * r + y;
    return {"x" : rx, "y" : ry};
}
function gainDivideAngle(weight, startAngle, endAngle) {
    //reset pie function: setting startAngle and endAngle.
    let pieFunction = d3.pie().sort(null)
        .startAngle(startAngle)
        .endAngle(endAngle)
        .padAngle(0.01)
        .value(function(d) {return d;});

    return pieFunction(weight);
}

function drawPath(output, input, group, color, size, id) {
    let p_a = transPosition(size, output.startAngle);
    let p_s = transPosition(size, (output.startAngle + output.endAngle) / 2.0);
    let p_b = transPosition(size* 0.94, input.endAngle);
    let p_e = transPosition(size* 0.96, (input.startAngle+input.endAngle) / 2.0);
    let p_c = transPosition(size* 0.94, input.startAngle);
    let p_d = transPosition(size, output.endAngle);

    let MA = "M" + p_a.x + "," + p_a.y;
    let QAB = " Q0,0," + p_b.x + "," + p_b.y;
    let LBE = " L" + p_e.x + "," + p_e.y;
    let LEC = " L" + p_c.x + "," + p_c.y;
    // let ABC = " A94,94,0,0,0," + p_c.x + "," + p_c.y;
    let QCD = " Q0,0," + p_d.x + "," + p_d.y;
    let ADA = " A" + size + "," + size + ",0,0,0," + p_a.x + "," + p_a.y;

    let pathDetail = MA + QAB + LBE + LEC + QCD + ADA;

    group.append("g").attr("class", "path")
        .append("path")
        .attr("id", id)
        .attr("d", pathDetail)
        .attr("fill", color)
        .attr("fill-opacity", 0.6);

    // let point = group.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 3).attr("fill", color);
    // let pointPath = 'M' + p_s.x + "," + p_s.y + ' Q0,0,' + p_e.x + "," + p_e.y;
    // point.append("animateMotion")
        // .attr("path", pointPath)
        // .attr("begin", "0s")
        // .attr("dur", "2s")
        // .attr("repeatCount", "indefinite");
}

export default class STG {
    constructor(){
        this.labels = [] //原时间序列
        this.datasets = [] //每个state的迁移和基础信息
        this.chords = [] //state中block的角度分配
        this.blocks = [] //每个block中迁移的角度分配
    }
    marker(defs, id, color, width, opacity) {
        let path = "M0,-" + width + " L" + width + ",0 L0," + width;
        defs.append("svg:marker")
            .attr("id",id.replace("#", ""))
            .attr("viewBox", "0 -" + width + " " + width + " " + width*2)
            .attr("refX", 1) // This sets how far back it sits, kinda
            .attr("refY", 0)
            .attr("markerWidth", width)
            .attr("markerHeight", width*2)
            .attr("orient", "auto")
            .attr("markerUnits", "userSpaceOnUse")
            .append("svg:path")
            .attr("d", path)
            .style("fill", color)
            .style("opacity", opacity)
        return "url(" + id + ")";
    }
    drawChord(svg, colormap, dataset, pie) {
        //block分配
        let arc = d3.arc()
            .innerRadius(dataset.size)
            .outerRadius(dataset.size + 5)
        // .cornerRadius(3)
            .padAngle(0.1); //调整间距大小

        let group = svg.append("g")
            .attr("transform", "translate(" + (dataset.x + 100) + "," + (dataset.y + 100) + ")")
            .attr("class", "state state" + dataset.index)

        let arcs = group.selectAll(".arc")
            .data(pie)
            .enter()
            .append("g")
            .attr("class", "arc");

        //display the block
        arcs.append("path")
            .attr("fill", (d, i) => colormap[i])
            .attr("id", (d, i) => "b" + dataset.index + "-" + i)
            .attr("d", arc);

        let blocks = [];
        for (let i = 0; i < 5; i++) {
            let input = dataset.relationship[i];
            let output = [];
            for (let j = 0; j < 5; j++) {
                output.push(dataset.relationship[j][i]);
            }
            let mainAngle = gainDivideAngle(dataset.weight[i], pie[i].startAngle + 0.05, pie[i].endAngle - 0.05);
            let inputAngle = gainDivideAngle(input, mainAngle[0].startAngle, mainAngle[0].endAngle);
            let outputAngle = gainDivideAngle(output, mainAngle[1].startAngle, mainAngle[1].endAngle);
            blocks.push({
                'input' : inputAngle,
                'output': outputAngle
            });
        }
        this.blocks[dataset.index] = blocks
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (dataset.relationship[i][j] != 0) {
                    drawPath(blocks[i].input[j], blocks[j].output[i], group,colormap[i], dataset.size, 'it' + dataset.index + '-' + i + '-' + j);
                }
            }
        }
    }
    calculatePie(dataset) {
        let dataPie = [];
        for (let i = 0; i < 5; i++) {
            let temp = {
                "weight": dataset.weight[i][0] + dataset.weight[i][1],
                "angle": 0
            };
            dataPie.push(temp);
        }
        //adjust angle
        //calculate the node angle
        let angle = [0, 0, 0, 0, 0];
        for (let i = 0; i < 5; i++) {
            if (i != dataset.index) {
                angle[i] = (Math.atan2(dataset.centers[i][1] - dataset.y, dataset.centers[i][0] - dataset.x) + 2* Math.PI) % 2* Math.PI;
            }
        }
        //select the startAngle
        let weights = dataPie.map(x => x.weight);
        weights.sort((a, b) => a-b);
        let weightsT = dataPie.map(x => x.weight);
        let startIndex = weightsT.indexOf(weights[1]);
        let standard = angle[startIndex];
        //console.log(startIndex);
        // console.log(angle);
        let angleA = angle.map((value) => (value - standard + 2*Math.PI) % (2*Math.PI));
        // console.log(angle);
        for (let i = 0; i < 5; i++) {
            dataPie[i].angle = angleA[i];
        }
        // console.log(dataPie);
        // let angle1 = angle.map(x => (x))

        // let startIndex = Math.min(...dataPie.map(x => x.weight));
        // console.log(startIndex);

        // console.log(angle);

        //d3里面的pie函数可以根据比例自动计算角度分配
        let pieFunction = d3.pie()
            .padAngle(0.1) //最低角度设定
            .value(function(data, index) {
                return data.weight;
            })
            .sort(function(a, b) {
                // return a.angle - b.angle;
                return null;
            })
            .startAngle(startIndex)
            .endAngle(Math.PI * 2 + startIndex);
            // .colors(["green", "green", "green", "green", "green"])
        let pie = pieFunction(dataPie); //calculate the block
        // console.log(pie);
        //console.log("=======");
        // set chord as a group and move to the center
        return pie;
    }
    initSTG(data) {
        this.labels = data.labels;
        let svg = d3.select("#stg").call(d3.zoom().on("zoom", function() {
            svg.attr("transform", d3.event.transform)
        })).append("g")
        let defs = svg.append("svg:defs");
        let colormap = [
            "#67B7DC",
            "#A367DC",
            "#DC6788",
            "#6771DC",
            "#DC8C67",
            "#DC67CE"
        ]
        let originData = data
        let nodeTransitionList = [originData.labels[0]];
        for (let i = 1; i < originData.labels.length; i++) {
            if (originData.labels[i] != originData.labels[i-1]) {
                nodeTransitionList += [originData.labels[i]];
            }
        }

        let nodeTransition = [
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ];

        let blockTransition = [
            [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
            [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
            [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
            [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
            [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
        ];
        //nodeTransition calculation
        for (let i = 1; i < nodeTransitionList.length; i++) {
            nodeTransition[nodeTransitionList[i-1]][nodeTransitionList[i]] += 1;
        }

        //blockTransition calculation
        for (let i = 1; i < nodeTransitionList.length - 1; i++) {
            blockTransition[nodeTransitionList[i]][nodeTransitionList[i-1]][nodeTransitionList[i+1]] += 1;
        }

        let datasets = [];
        let chords = [];
        let minSize = 40;
        let ad = 0.8;
        for (let i = 0; i < 5; i++) {
            let dataset = {
                "x" : originData.centers[i][0] * ad,
                "y" : originData.centers[i][1] * ad,
                "weight" : [[0,0], [0,0], [0,0], [0,0], [0,0]],
                "relationship": blockTransition[i],
                "centers" : originData.centers,
                "size" : minSize + originData.percentage[i] / 1,
                "index": i,
            }

            for (let j = 0; j < 5; j++) {
                for (let k = 0; k < 5; k++ ) {
                    dataset.weight[j][0] += blockTransition[i][j][k];
                    dataset.weight[k][1] += blockTransition[i][j][k];
                }
            }
            datasets.push(dataset);
            let chord = this.calculatePie(dataset);
            chords.push(chord);
            // drawChord(dataset, chord);
            // chords.push(createChord(dataset));
        }
        this.datasets = datasets
        this.chords = chords
        this.blocks = [[],[],[],[],[]]

        let max = Math.max(...nodeTransition.join(",").split(","));
        let theta = 30.0/max;
        //output i, input j
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                let transWidth = nodeTransition[i][j] * theta;
                if (transWidth != 0) {
                    let outputWidth = minSize + originData.percentage[i]/1 + 5;
                    let inputWidth = minSize + originData.percentage[j]/1 + 5;
                    let outputA = (chords[i][j].endAngle + (chords[i][j].startAngle + chords[i][j].endAngle) / 2.0) / 2.0;
                    let inputA = (chords[j][i].startAngle+ (chords[j][i].startAngle + chords[j][i].endAngle) / 2.0) / 2.0;
                    let C2 = transPosition(inputWidth + transWidth, inputA, originData.centers[j][0] * ad + 100, originData.centers[j][1] * ad + 100);
                    let C1 = transPosition(outputWidth, outputA, originData.centers[i][0] * ad + 100, originData.centers[i][1] *ad + 100);
                    let CC2 = transPosition((inputWidth + transWidth) *2, inputA, originData.centers[j][0] * ad + 100, originData.centers[j][1] *ad + 100);
                    let CC1 = transPosition(outputWidth *2, outputA, originData.centers[i][0] * ad + 100, originData.centers[i][1] * ad + 100);

                    let MS = "M" + C1.x + "," + C1.y;
                    let CSE = " C" + CC1.x + "," + CC1.y + "," + CC2.x + "," + CC2.y + "," + C2.x + "," + C2.y;
                    let path = MS + CSE;
                    svg.append("g").attr("class", "transition")
                        .append("path").attr("d", path)
                        .attr("id", "ot" + i + "-" + j)
                        .attr("fill", "none")
                        .attr("stroke", colormap[i])
                        .attr("stroke-opacity", 0.4)
                        .attr("stroke-width", transWidth)
                        .attr("marker-end",this.marker(defs, "#a" + i + "-" + j, colormap[i], transWidth, 0.4));
                }
            }
        }

        for (let i = 0; i < 5; i++) {
            this.drawChord(svg, colormap, datasets[i], chords[i]);
        }
    }

    timeInSTG(time, range = 5) {
        //outer transition
        d3.selectAll(".transition path")
            .attr("stroke-opacity", 0.1)
        //outer transition arrow
        d3.selectAll("marker path").style("opacity", 0.1)
        d3.selectAll(".arc path").attr("fill-opacity", 0.1)
        d3.selectAll(".path path").attr("fill-opacity", 0.1)

        //delete the last hight light point
        d3.select("#stg").selectAll('.high').remove()

        this.singlePoint(time);
        //future
        for (let i = time + 1; i < 2000 && i < time+range; i++) {
            this.singlePoint(i, (0.5/range) * (range - i + time))
            //highlight the outer transition
            if (this.labels[i-1] != this.labels[i]) {
                let id = "#ot" + this.labels[i-1] + '-' + this.labels[i];
                d3.select(id).attr("stroke-opacity", 0.4);
                id = "#a" + this.labels[i-1] + '-' + this.labels[i];
                d3.select(id + " path").style("opacity", 0.4)
            }
        }
        //past
        for (let i = time-1; i >= 0 && i > time-range; i--) {
            this.singlePoint(i, (0.5/range) * (range - time + i))

            if (this.labels[i+1] != this.labels[i]) {
                let id = "#ot" + this.labels[i] + '-' + this.labels[i+1];
                d3.select(id).attr("stroke-opacity", 0.4);
                id = "#a" + this.labels[i] + '-' + this.labels[i+1];
                d3.select(id + " path").style("opacity", 0.4)
            }
        }
    }
    singlePoint(time, opacity = 1) {
        const now = this.labels[time]
        let beforeId = time-1;
        let afterId = time+1;
        for (let i = time-1; i >=0; i--) {
            beforeId = i;
            if (this.labels[i] !== now) {
                break;
            }
        }

        let before = this.labels[beforeId]
        for (let i = time+1; i < this.labels.length; i++) {
            afterId = i;
            if (this.labels[i] !== now) {
                break;
            }
        }

        let after = this.labels[afterId]
        let l = (time - beforeId - 1) * 1.0 / (afterId - beforeId - 2)
        if (afterId - beforeId - 2 <= 0) { //when the length is 1, point will display in the middle
            l = 0.5
        }

        const group = d3.select(".state" + now)

        let from = this.blocks[now][before]['input'][after]
        let to = this.blocks[now][after]['output'][before]
        let p_s = transPosition(this.datasets[now].size, (from.startAngle + from.endAngle) / 2.0)
        let p_e = transPosition(this.datasets[now].size * 0.96, (to.startAngle + to.endAngle) / 2.0)

        let x = (1-l)*(1-l) * p_s.x + l*l*p_e.x;
        let y = (1-l)*(1-l) * p_s.y + l*l*p_e.y;


        group.append("circle")
            .attr("class", "high")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 5)
            .attr("fill", "red")
            .attr("fill-opacity", opacity)

        //highlight the inter-transition
        let id = '#it' + now + '-' + before + '-' + after
        d3.select(id).attr("fill-opacity", 0.6)

        //highlight the blocks
        id = '#b' + now + '-' + after
        d3.select(id).attr("fill-opacity", 1)
        id = '#b' + now + '-' + before
        d3.select(id).attr('fill-opacity', 1)
    }
}
