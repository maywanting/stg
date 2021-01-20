import * as d3 from 'd3'
import {publicSetting} from './public'
import {dataHub} from './dataHub'

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
    let p_b = transPosition(size* 0.85, input.endAngle);
    let p_e = transPosition(size* 0.95, (input.startAngle+input.endAngle) / 2.0);
    let p_c = transPosition(size* 0.85, input.startAngle);
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
            .padAngle(0); //调整间距大小

        let group = svg.append("g")
            .attr("transform", "translate(" + dataset.x + "," + dataset.y + ")")
            .attr("class", "state state" + dataset.index)

        let arcs = group.selectAll(".arc")
            .data(pie)
            .enter()
            .append("g")
            .attr("class", "arc");

        //display the block
        arcs.append("path")
            .attr("fill", (d, i) => publicSetting.colormap[i])
            .attr("id", (d, i) => "b" + dataset.index + "-" + i)
            .attr("d", arc);

        //add text label, the position is the center plus circle radius.
        svg.append("text")
            .attr("x", dataset.x)
            .attr("y", dataset.y - dataset.size - 15)
            .attr("font-size", '20px')
            .attr("fill", publicSetting.colormap[dataset.index])
            .attr('text-anchor', 'bottom')
            .text(dataset.label)

        let blocks = [];
        for (let i = 0; i < dataHub.clusterIds.length; i++) {
            let input = dataset.relationship[i];
            let output = [];
            for (let j = 0; j < dataHub.clusterIds.length; j++) {
                output.push(dataset.relationship[j][i]);
            }
            // let mainAngle = gainDivideAngle(dataset.weight[i], pie[i].startAngle + 0.05, pie[i].endAngle - 0.05);
            let mainAngle = gainDivideAngle(dataset.weight[i], pie[i].startAngle, pie[i].endAngle);
            let inputAngle = gainDivideAngle(input, mainAngle[0].startAngle, mainAngle[0].endAngle);
            let outputAngle = gainDivideAngle(output, mainAngle[1].startAngle, mainAngle[1].endAngle);
            blocks.push({
                'input' : inputAngle,
                'output': outputAngle
            });
        }
        this.blocks[dataset.index] = blocks
        for (let i = 0; i < dataHub.clusterIds.length; i++) {
            for (let j = 0; j < dataHub.clusterIds.length; j++) {
                if (dataset.relationship[i][j] != 0) {
                    //inter path
                    drawPath(blocks[i].input[j], blocks[j].output[i], group, publicSetting.colormap[i], dataset.size, 'it' + dataset.index + '-' + i + '-' + j);
                }
            }
        }
    }
    calculatePie(dataset) {
        let dataPie = [];
        let sumWei = 0;
        let validBlock = 0;
        for (let i = 0; i < dataHub.clusterIds.length; i++) {
            let temp = {
                "weight": dataset.weight[i][0] + dataset.weight[i][1],
                "angle": 0,
                "index" : i,
                "startAngle": 0,
                "endAngle": 0,
                "angleWidth": 0,
            };
            sumWei += temp.weight
            if (temp.weight != 0) {
                validBlock += 1
            }
            dataPie.push(temp);
        }
        //adjust angle
        //calculate the node angle
        let angle = []
        for (let i = 0; i < dataHub.clusterIds.length; i++) {
            if (i != dataset.index) {
                let temp  = (Math.atan2(dataset.centers[i][1] - dataset.y, dataset.centers[i][0] - dataset.x) + 2.5* Math.PI) % (2* Math.PI);
                angle.push(temp)
            } else {
                angle.push(0)
            }
        }
        // console.log(angle)
        //select the startAngle
        let weights = dataPie.map(x => x.weight);
        // console.log(weights)

        weights.sort((a, b) => b-a);
        let perAngle = (2*Math.PI - validBlock * 2 * publicSetting.paddingAngle) / sumWei;
        // console.log(angle)
        for (let i = 0; i < dataHub.clusterIds.length; i++) {
            dataPie[i].angle = angle[i];
            dataPie[i].startAngle = angle[i];
            dataPie[i].endAngle = angle[i];
            if (dataPie[i].weight != 0 ) {
                dataPie[i].angleWidth = perAngle * dataPie[i].weight
            }
        }

        // console.log(weights)
        // console.log(validBlock)
        //arrange angle
        //first:sort the dataPie according weight
        dataPie.sort((a, b) => b.weight - a.weight)

        //set the standard
        dataPie[0].startAngle = dataPie[0].angle - dataPie[0].angleWidth/2
        dataPie[0].endAngle = dataPie[0].angle + dataPie[0].angleWidth/2
        let standardIndex = dataPie[0].index
        // console.log(standardIndex)
        // console.log(dataPie[0])

        //sort the dataPie base on angle
        dataPie.sort((a, b) => a.angle - b.angle)
        let flag = 0
        for (let i = 0; i < dataPie.length; i++) {
            if (dataPie[i].index == standardIndex) {
                flag = i
            }
        }
        let thetaSum = 0
        let last = flag
        for (let i = 1; i < dataPie.length; i++) {
            let newI = (i + flag) % dataPie.length
            if (dataPie[newI].weight == 0) {
                dataPie[newI].startAngle = dataPie[last].endAngle + publicSetting.paddingAngle
                dataPie[newI].endAngle = dataPie[last].endAngle + publicSetting.paddingAngle
            } else {
                dataPie[newI].startAngle = dataPie[last].endAngle + publicSetting.paddingAngle * 2;
                dataPie[newI].endAngle = dataPie[newI].startAngle + dataPie[newI].angleWidth
                last = newI
            }
            // console.log(dataPie[newI])
        }
        //final:recover the dataPie
        dataPie.sort((a, b) => a.index - b.index)
        // console.log(dataPie)

        return dataPie

    }
    calculatePie_old(dataset) {
        let dataPie = [];
        for (let i = 0; i < dataHub.clusterIds.length; i++) {
            let temp = {
                "weight": dataset.weight[i][0] + dataset.weight[i][1],
                "angle": 0
            };
            dataPie.push(temp);
        }
        //adjust angle
        //calculate the node angle
        let angle = [0, 0, 0, 0, 0];
        for (let i = 0; i < dataHub.clusterIds.length; i++) {
            if (i != dataset.index) {
                angle[i] = (Math.atan2(dataset.centers[i][1] - dataset.y, dataset.centers[i][0] - dataset.x) + 2.5* Math.PI) % (2* Math.PI);
                let angleT  = Math.atan2(dataset.centers[i][1] - dataset.y, dataset.centers[i][0] - dataset.x)
            }
        }
        // console.log(angle)
        //select the startAngle
        let weights = dataPie.map(x => x.weight);
        console.log(weights)

        weights.sort((a, b) => b-a);
        let weightsT = dataPie.map(x => x.weight);
        console.log(weights)
        let startIndex = weightsT.indexOf(weights[0]);
        // console.log(startIndex)
        // console.log(angle)
        let standard = angle[startIndex];
        // let angleA = angle.map((value) => (value - standard + 2*Math.PI) % (2*Math.PI));
        let angleA = angle
        console.log(angleA)
        for (let i = 0; i < dataHub.clusterIds.length; i++) {
            dataPie[i].angle = angleA[i];
        }
        // console.log(dataPie);
        // let angle1 = angle.map(x => (x))

        // let startIndex = Math.min(...dataPie.map(x => x.weight));
        // console.log(startIndex);

        // console.log(angle);
        console.log(standard)

        //d3里面的pie函数可以根据比例自动计算角度分配
        let pieFunction = d3.pie()
            .padAngle(0.1) //最低角度设定
            .value(function(data, index) {
                return data.weight;
            })
            .sort(function(a, b) {
                return a.angle - b.angle;
                // return null;

            })
            .startAngle(standard)
            .endAngle(Math.PI * 2 + standard);
            // .colors(["green", "green", "green", "green", "green"])
        // console.log(dataPie)
        let pie = pieFunction(dataPie); //calculate the block
        // console.log(pie)
        let thetaSum = 0
        for (let i = 0; i < 5; i++) {
            if (dataPie[i].weight != 0) {
                let midAngle = (pie[i].endAngle - pie[i].startAngle) /2.0
                let theta = Math.abs(midAngle - dataPie[i].angle)
                thetaSum += theta
            }
        }
        // console.log("theta is ")
        // console.log(thetaSum)
        // set chord as a group and move to the center
        return pie;
    }
    initSTG(data) {
        d3.select("#stg g").remove()
        let svg = d3.select("#stg").call(d3.zoom().on("zoom", function() {
            svg.attr("transform", d3.event.transform)
        })).append("g")
        let defs = svg.append("svg:defs");

        let datasets = [];
        let chords = [];
        let minSize = 40;
        let clusterNum = dataHub.clusterIds.length
        for (let i = 0; i < clusterNum; i++) {
            let dataset = {
                "x" : dataHub.centers[i][0],
                "y" : dataHub.centers[i][1],
                // "weight" : [[0,0], [0,0], [0,0], [0,0], [0,0]],
                "weight": [],
                "relationship": dataHub.blockTransition[i],
                "centers" : dataHub.centers,
                "size" : minSize + 100*dataHub.numCluster[i]/dataHub.labels.length,
                "index": i,
                "label": dataHub.clusterNames[i]
            }
            for (let j = 0; j < clusterNum; j++) {
                dataset.weight.push([0, 0])
            }

            for (let j = 0; j < clusterNum; j++) {
                for (let k = 0; k < clusterNum; k++ ) {
                    dataset.weight[j][0] += dataHub.blockTransition[i][j][k];
                    dataset.weight[k][1] += dataHub.blockTransition[i][j][k];
                }
            }
            datasets.push(dataset);
            let chord = this.calculatePie(dataset);
            chords.push(chord);
            // drawChord(dataset, chord);
            // chords.push(createChord(dataset));
        }
        // console.log(chords)
        //calculate the theta
        // let thetaSum = 0
        // for (let i = 0; i < clusterNum; i++) {
            // for (let j = 0; j < clusterNum; j++) {
                // if (chords[i][j].weight != 0) {
                    // let midAngle = (chords[i][j].startAngle + chords[i][j].endAngle) / 2.0
                    // let theta = Math.abs(midAngle - chords[i][j].angle)
                    // console.log(theta)
                    // thetaSum += theta
                // }
            // }
        // }
        // console.log("the sum is :")
        // console.log(thetaSum)
        this.datasets = datasets
        this.chords = chords
        this.blocks = []
        for (let i = 0; i < clusterNum; i++) {
            this.blocks.push([])
        }

        let max = Math.max(...dataHub.nodeTransition.join(",").split(","));
        let theta = 30.0/max;
        //output i, input j
        for (let i = 0; i < clusterNum; i++) {
            for (let j = 0; j < clusterNum; j++) {
                let transWidth = dataHub.nodeTransition[i][j] * theta;
                if (transWidth != 0) {
                    let outputWidth = datasets[i]['size'] + 5;
                    let inputWidth = datasets[j]['size'] + 5;
                    let outputA = (chords[i][j].endAngle + (chords[i][j].startAngle + chords[i][j].endAngle) / 2.0) / 2.0;
                    let inputA = (chords[j][i].startAngle+ (chords[j][i].startAngle + chords[j][i].endAngle) / 2.0) / 2.0;
                    let C2 = transPosition(inputWidth + transWidth, inputA, dataHub.centers[j][0], dataHub.centers[j][1]);
                    let C1 = transPosition(outputWidth, outputA, dataHub.centers[i][0], dataHub.centers[i][1]);
                    let CC2 = transPosition((inputWidth + transWidth) *2, inputA, dataHub.centers[j][0], dataHub.centers[j][1]);
                    let CC1 = transPosition(outputWidth *2, outputA, dataHub.centers[i][0], dataHub.centers[i][1]);

                    let MS = "M" + C1.x + "," + C1.y;
                    let CSE = " C" + CC1.x + "," + CC1.y + "," + CC2.x + "," + CC2.y + "," + C2.x + "," + C2.y;
                    let path = MS + CSE;
                    svg.append("g").attr("class", "transition")
                        .append("path").attr("d", path)
                        .attr("id", "ot" + i + "-" + j)
                        .attr("fill", "none")
                        .attr("stroke", publicSetting.colormap[i])
                        .attr("stroke-opacity", 0.4)
                        .attr("stroke-width", transWidth)
                        .attr("marker-end",this.marker(defs, "#a" + i + "-" + j, publicSetting.colormap[i], transWidth, 0.4));
                }
            }
        }

        for (let i = 0; i < clusterNum; i++) {
            this.drawChord(svg, publicSetting.colormap, datasets[i], chords[i]);
        }

        // points being of noncluster
        this.drawNonCluster()
    }

    //points being of noncluster
    drawNonCluster() {
        let flag = 0
        let start = 0
        for (let i = 0; i < dataHub.labels.length; i++) {
            if ((flag == 0) && (dataHub.labels[i] == -1)) {
                start = i
                flag = 1
            }
            if ((flag == 1) && (dataHub.labels[i] != -1)) {
                this.drawSingleTrajectory(start, i-1)
                flag = 0
            }
        }
        if (flag == 1) {
            this.drawSingleTrajectory(start, dataHub.labels.length-1)
        }
    }

    drawSingleTrajectory(start, end) {
        const svg = d3.select("#stg g")
        let pos = dataHub.position.slice(start, end+1)
        let line = d3.line()
            .x(d => d[0])
            .y(d => d[1]);
        svg.append("path")
            .datum(pos)
            .attr("fill", "none")
            .attr("opacity", "0.3")
            .attr("stroke", "grey")
            .attr("stroke-width", 0.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line);
        svg.selectAll('.circle')
            .data(pos)
            .enter().append('circle')
            .attr("class", "noncluster")
            .attr('id', (d, i) => {
                return "n" +i;
            })
            .attr('cx', (d) => {
                return d[0];
            })
            .attr('cy', (d) => {
                return d[1];
            })
            .attr('r', 2)
            .style("fill", "grey")
        //start connection
        if ((start > 0) && (end < dataHub.labels.length-1)) {
            let outputState = dataHub.labels[start-1]
            let inputState = dataHub.labels[end+1]
            let e_p = transPosition(this.datasets[inputState].size + 5, this.chords[inputState][outputState].startAngle, this.datasets[inputState].centers[inputState][0], this.datasets[inputState].centers[inputState][1])
            let s_p = transPosition(this.datasets[outputState].size+5, this.chords[outputState][inputState].endAngle, this.datasets[outputState].centers[outputState][0], this.datasets[outputState].centers[outputState][1])
            // svg.append("circle")
                // .attr("cx", s_p.x)
                // .attr("cy", s_p.y)
                // .attr("r", 5)
                // .attr("fill", "red")
            svg.append("line")
                .attr("x1", s_p.x)
                .attr("y1", s_p.y)
                .attr("x2", pos[0][0])
                .attr('y2', pos[0][1])
                .attr("opacity", 0.5)
                .attr("stroke", "grey")
                .attr("stroke-width", 0.5)
        // svg.append("circle")
            // .attr("cx", e_p.x)
            // .attr("cy", e_p.y)
            // .attr("r", 5)
            // .attr("fill", "red")
            svg.append("line")
                .attr("x1", pos[pos.length-1][0])
                .attr("y1", pos[pos.length-1][1])
                .attr("x2", e_p.x)
                .attr('y2', e_p.y)
                .attr("opacity", 0.5)
                .attr("stroke", "grey")
                .attr("stroke-width", 0.5)
        }
    }

    //time information in STG
    timeInSTG(time, range = 5) {
        this.reduceOpacity()
        //delete the last hight light point
        d3.select("#stg").selectAll('.time').remove()

        this.singlePoint(time);
        //future
        for (let i = time + 1; i < 2000 && i < time+range; i++) {
            this.singlePoint(i, (0.5/range) * (range - i + time))
            //highlight the outer transition
            if (dataHub.labels[i-1] !=dataHub.labels[i]) {
                let id = "#ot" +dataHub.labels[i-1] + '-' +dataHub.labels[i];
                d3.select(id).attr("stroke-opacity", 0.4);
                id = "#a" +dataHub.labels[i-1] + '-' +dataHub.labels[i];
                d3.select(id + " path").style("opacity", 0.4)
            }
        }
        //past
        for (let i = time-1; i >= 0 && i > time-range; i--) {
            this.singlePoint(i, (0.5/range) * (range - time + i))

            if (dataHub.labels[i+1] !=dataHub.labels[i]) {
                let id = "#ot" +dataHub.labels[i] + '-' +dataHub.labels[i+1];
                d3.select(id).attr("stroke-opacity", 0.4);
                id = "#a" +dataHub.labels[i] + '-' +dataHub.labels[i+1];
                d3.select(id + " path").style("opacity", 0.4)
            }
        }
    }

    //draw point in inter transition
    singlePoint(time, opacity = 1) {
        const now =dataHub.labels[time]
        let beforeId = time-1;
        let afterId = time+1;
        for (let i = time-1; i >=0; i--) {
            beforeId = i;
            if (dataHub.labels[i] !== now) {
                break;
            }
        }
        let before =dataHub.labels[beforeId]

        for (let i = time+1; i <dataHub.labels.length; i++) {
            afterId = i;
            if (dataHub.labels[i] !== now) {
                break;
            }
        }

        let after =dataHub.labels[afterId]
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
            .attr("class", "time")
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

    //reduce the whole opacity
    reduceOpacity() {
        //outer transition
        d3.selectAll(".transition path")
            .attr("stroke-opacity", 0.1)
        //outer transition arrow
        d3.selectAll("marker path").style("opacity", 0.1)
        d3.selectAll(".arc path").attr("fill-opacity", 0.1)
        d3.selectAll(".path path").attr("fill-opacity", 0.1)
    }

    //recoveOpacity
    recoveFromHigh() {
        //outer transition
        d3.selectAll(".transition path")
            .attr("stroke-opacity", 0.4)
        //outer transition arrow
        d3.selectAll("marker path").style("opacity", 0.4)
        d3.selectAll(".arc path").attr("fill-opacity", 1)
        d3.selectAll(".path path").attr("fill-opacity", 0.6)
    }

    //highlight the state(block and inter transition
    highState(stateId) {
        this.reduceOpacity()
        //block
        for (let i = 0; i < dataHub.clusterIds.length; i++) {
            let id = "#b" + stateId + '-' + i
            d3.select(id).attr('fill-opacity', 1)
            for (let j = 0; j < dataHub.clusterIds.length; j++) {
                let id = "#it" + stateId + "-" + i + "-" + j
                d3.select(id).attr('fill-opacity', 0.6)
            }
        }
    }
}
