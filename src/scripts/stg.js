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

function marker(defs, id, color, width, opacity) {
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

export default class STG {
    constructor(){
        this.datasets = [] //每个state的迁移和基础信息
        this.chords = [] //state中block的角度分配
        // this.blocks = [] //每个block中迁移的角度分配
        this.svg;
    }
    
    drawChord(svg, colormap, dataset, pie) {
        //block分配
        let arc = d3.arc()
            .innerRadius(dataset.size - 0)
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
            .attr("opacity", 0.7)
            .attr("id", (d, i) => "b" + dataset.index + "-" + i)
            .attr("d", arc);
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

        //arrange angle
        //first:sort the dataPie according weight
        dataPie.sort((a, b) => b.weight - a.weight)

        //set the standard
        dataPie[0].startAngle = dataPie[0].angle - dataPie[0].angleWidth/2
        dataPie[0].endAngle = dataPie[0].angle + dataPie[0].angleWidth/2
        let standardIndex = dataPie[0].index

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

    initSTG(data) {
        d3.select("#stg g").remove()
        let svg = d3.select("#stg").call(d3.zoom().on("zoom", function() {
            svg.attr("transform", d3.event.transform)
        })).append("g")
        this.svg = svg;


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
            // drawPoint(dataset.x, dataset.y, svg);
            datasets.push(dataset);
            let chord = this.calculatePie(dataset);
            chords.push(chord);
            let blocks = []
            for (let i = 0; i < clusterNum; i++) {
                let input = dataset.relationship[i];
                let output = [];
                for (let j = 0; j < dataHub.clusterIds.length; j++) {
                    output.push(dataset.relationship[j][i]);
                }
                // let mainAngle = gainDivideAngle(dataset.weight[i], pie[i].startAngle + 0.05, pie[i].endAngle - 0.05);
                let mainAngle = gainDivideAngle(dataset.weight[i], chord[i].startAngle, chord[i].endAngle);
                let inputAngle = gainDivideAngle(input, mainAngle[0].startAngle, mainAngle[0].endAngle);
                let outputAngle = gainDivideAngle(output, mainAngle[1].startAngle, mainAngle[1].endAngle);
                blocks.push({
                    'input' : inputAngle,
                    'output': outputAngle
                });
            }
            dataHub.blockTransition[dataset.index] = blocks
            // chords.push(createChord(dataset));
        }
        console.log(dataHub.blockTransition);
        this.datasets = datasets;
        dataHub.datasets = datasets;
        this.chords = chords;
        dataHub.chords = chords;
        
        let max = Math.max(...dataHub.nodeTransition.join(",").split(","));
        let theta = 30.0/max;
        //outer-trajectory: output i, input j
        for (let i = 0; i < clusterNum; i++) {
            for (let j = i+1; j < clusterNum; j++) {
                let transWidth = dataHub.nodeTransition[i][j] * theta;
                if (transWidth != 0) {
                    let MS = "M" + datasets[i].x + ',' + datasets[i].y;
                    let LE = " L" + datasets[j].x + ',' + datasets[j].y;
                    let path = MS + LE;
                    // let opacity = dataHub.nodeTransition[i][j]/(max*1.0);
                    let weight = (dataHub.nodeTransition[i][j] + dataHub.nodeTransition[j][i]) / (max*2.0)
                    svg.append("g").attr("class", "transition")
                        .append("path").attr("d", path)
                        .attr("fill", "none")
                        .attr("stroke", '#999')
                        .attr("stroke-opacity", 0.3)
                        .attr("stroke-width", 20 * weight)
                        .attr("class", "out-transition");
                        //.attr("marker-end",this.marker(defs, "#a" + i + "-" + j, publicSetting.colormap[i], 10,  weight));
                }
            }
        }

        //node
        for (let i = 0; i < clusterNum; i++) {
            this.drawChord(svg, publicSetting.colormap, datasets[i], chords[i]);
            let circle = svg.append("circle");
            circle.attr("cx", datasets[i].x)
                .attr("cy", datasets[i].y)
                .attr("r", datasets[i].size - 7)
                .attr("opacity", 1)
                .attr("class", "node")
                .attr("id", "node" + i)
                .attr("fill", publicSetting.colormap[i])
            //add text label, the position is the center plus circle radius.
            svg.append("text")
                .attr("x", datasets[i].x - 3)
                .attr("y", datasets[i].y + 5)
                .attr("font-size", '20px')
                // .attr("fill", publicSetting.colormap[datasets[i].index])
                .attr("fill", "#fff")
                .attr('text-anchor', 'top')
                .text(datasets[i].label);
        }

        // TODO: points belonging to noncluster
        console.log(dataHub.datasets);
        //show detail
        let nodes = svg.selectAll(".node")
            .on("click", function(d, i, group){
                let node = d3.select(this);
                let g = d3.select(".state" + i);
                let defs = svg.append("svg:defs");
                let chords = dataHub.chords;
                // console.log(dataHub.blockTransition[i]);
                // console.log(node);

                //node detail
                let dataset = dataHub.datasets[i];
                
                let blocks = dataHub.blockTransition[i];
                for (let k = 0; k < dataHub.clusterIds.length; k++) {
                    for (let j = 0; j < dataHub.clusterIds.length; j++) {
                        if (dataset.relationship[k][j] != 0) {
                            //inter path
                            // drawPath(blocks[k].input[j], blocks[j].output[k], g, publicSetting.colormap[k], dataset.size, 'it' + dataset.index + '-' + k + '-' + j);
                        }
                    }
                }
                node.remove();
                let lines = d3.selectAll(".out-transition");
                lines.remove();
                for (let j = 0; j < dataHub.clusterIds.length; j++) {
                    if (j !== i) {
                        let arcs = d3.selectAll(".state" + j + " .arc");
                        console.log(arcs);
                        arcs.remove();
                        
                    }
                }
                
                //output
                let j = 0;
                let transWidth = dataHub.nodeTransition[i][j] * theta;
                if (transWidth != 0) {
                    let outputWidth = dataHub.datasets[i]['size']+5;
                    let inputWidth = dataHub.datasets[j]['size']-5;
                    let outputA = (chords[i][j].endAngle + (chords[i][j].startAngle + chords[i][j].endAngle) / 2.0) / 2.0;
                    // let inputA = (chords[j][i].startAngle+ (chords[j][i].startAngle + chords[j][i].endAngle) / 2.0) / 2.0;
                    let inputA = Math.atan2(dataHub.centers[j][1] - dataHub.centers[i][1] , dataHub.centers[j][0] - dataHub.centers[i][0]) - (Math.PI/2.0)
                    // console.log(inputA)
                    let C2 = transPosition(inputWidth+transWidth, inputA, dataHub.centers[j][0], dataHub.centers[j][1]);
                    let C1 = transPosition(outputWidth, outputA, dataHub.centers[i][0], dataHub.centers[i][1]);
                    // let CC2 = transPosition((inputWidth + transWidth) *2, inputA, dataHub.centers[j][0], dataHub.centers[j][1]);
                    let CC1 = transPosition(outputWidth *2, outputA, dataHub.centers[i][0], dataHub.centers[i][1]);
                    let CC2_x = (dataHub.centers[i][0] + dataHub.centers[j][0])/2.0 + (CC1.x - dataHub.centers[i][0]);
                    let CC2_y = (dataHub.centers[i][1] + dataHub.centers[j][1])/2.0 + (CC1.y - dataHub.centers[i][1]);

                    drawPoint(CC1.x, CC1.y, svg);
                    drawPoint(CC2_x, CC2_y, svg);
                    let MS = "M" + C1.x + "," + C1.y;
                    let CSE = " C" + CC1.x + "," + CC1.y + "," + CC2_x + "," + CC2_y + "," + C2.x + "," + C2.y;
                    let path = MS + CSE;
                    svg.append("g").attr("class", "transition")
                        .append("path").attr("d", path)
                        .attr("id", "ot" + i + "-" + j)
                        .attr("fill", "none")
                        .attr("stroke", publicSetting.colormap[j])
                        .attr("stroke-opacity", 0.4)
                        .attr("stroke-width", transWidth)
                        .attr("marker-end", marker(defs, "#a" + i + "-" + j, publicSetting.colormap[j], transWidth, 0.4));
                }

                //input
                
                /*
                // outer transition
                for (let j = 0; j < dataHub.clusterIds.length; j++) {
                    //output
                    let transWidth = dataHub.nodeTransition[i][j] * theta;
                    if (transWidth != 0) {
                        let outputWidth = dataHub.datasets[i]['size']+5;
                        let inputWidth = dataHub.datasets[j]['size']-5;
                        let outputA = (chords[i][j].endAngle + (chords[i][j].startAngle + chords[i][j].endAngle) / 2.0) / 2.0;
                        // let inputA = (chords[j][i].startAngle+ (chords[j][i].startAngle + chords[j][i].endAngle) / 2.0) / 2.0;
                        let inputA = Math.atan2(dataHub.centers[j][1] - dataHub.centers[i][1] , dataHub.centers[j][0] - dataHub.centers[i][0]) - (Math.PI/2.0)

                        let C2 = transPosition(inputWidth + transWidth, inputA, dataHub.centers[j][0], dataHub.centers[j][1]);
                        let C1 = transPosition(outputWidth, outputA, dataHub.centers[i][0], dataHub.centers[i][1]);
                        // let CC2 = transPosition((inputWidth + transWidth) *2, inputA, dataHub.centers[j][0], dataHub.centers[j][1]);
                        let CC1 = transPosition(outputWidth *2, outputA, dataHub.centers[i][0], dataHub.centers[i][1]);
    
                        let CC2_x = (dataHub.centers[i][0] + dataHub.centers[j][0])/2.0 + (CC1.x - dataHub.centers[i][0]);
                        let CC2_y = (dataHub.centers[i][1] + dataHub.centers[j][1])/2.0 + (CC1.y - dataHub.centers[i][1]);

                        let MS = "M" + C1.x + "," + C1.y;
                        // let CSE = " C" + CC1.x + "," + CC1.y + "," + CC2.x + "," + CC2.y + "," + C2.x + "," + C2.y;
                        let CSE = " C" + CC1.x + "," + CC1.y + "," + CC2_x + "," + CC2_y + "," + C2.x + "," + C2.y;
                        let path = MS + CSE;
                        svg.append("g").attr("class", "transition")
                            .append("path").attr("d", path)
                            .attr("id", "ot" + i + "-" + j)
                            .attr("fill", "none")
                            .attr("stroke", publicSetting.colormap[j])
                            .attr("stroke-opacity", 0.4)
                            .attr("stroke-width", transWidth)
                            .attr("marker-end", marker(defs, "#a" + i + "-" + j, publicSetting.colormap[j], transWidth, 0.4));
                    }

                    //input
                    transWidth = dataHub.nodeTransition[j][i] * theta;
                    if (transWidth != 0) {
                        let outputWidth = dataHub.datasets[j]['size']-5;
                        let inputWidth = dataHub.datasets[i]['size']+5;
                        let outputA = (chords[j][i].endAngle + (chords[j][i].startAngle + chords[j][i].endAngle) / 2.0) / 2.0;
                        let inputA = (chords[i][j].startAngle+ (chords[i][j].startAngle + chords[i][j].endAngle) / 2.0) / 2.0;
                        let C2 = transPosition(inputWidth + transWidth, inputA, dataHub.centers[i][0], dataHub.centers[i][1]);
                        let C1 = transPosition(outputWidth, outputA, dataHub.centers[j][0], dataHub.centers[j][1]);
                        let CC2 = transPosition((inputWidth + transWidth) *2, inputA, dataHub.centers[i][0], dataHub.centers[i][1]);
                        let CC1 = transPosition(outputWidth *2, outputA, dataHub.centers[j][0], dataHub.centers[j][1]);
    
                        let MS = "M" + C1.x + "," + C1.y;
                        let CSE = " C" + CC1.x + "," + CC1.y + "," + CC2.x + "," + CC2.y + "," + C2.x + "," + C2.y;
                        let path = MS + CSE;
                        svg.append("g").attr("class", "transition")
                            .append("path").attr("d", path)
                            .attr("id", "ot" + j + "-" + i)
                            .attr("fill", "none")
                            .attr("stroke", publicSetting.colormap[j])
                            .attr("stroke-opacity", 0.4)
                            .attr("stroke-width", transWidth)
                            .attr("marker-end", marker(defs, "#a" + j + "-" + i, publicSetting.colormap[j], transWidth, 0.4));
                    }
                }
                */
            });
            
        // console.log(nodes);
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
}

function drawPath(output, input, group, color, size) {
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
        // .attr("id", id)
        .attr("d", pathDetail)
        .attr("fill", color)
        .attr("fill-opacity", 0.6);
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