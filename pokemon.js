'use strict';

(function() {
    let data = ""; // keep data in global scope
    let svgContainer = "";
    let generation = ["(All)","1","2","3","4","5","6"];
    let legendary = ["(All)","False","True"];
    let gen = "(All)";
    let leg = "(All)";
    const colors = {
        "Bug": "#4E79A7",
        "Dark": "#A0CBE8",
        "Dragon": "#e0f035",
        "Electric": "#F28E2B",
        "Fairy": "#FFBE7D",
        "Fighting": "#59A14F",
        "Fire": "#8CD17D",
        "Ghost": "#B6992D",
        "Grass": "#499894",
        "Ground": "#86BCB6",
        "Ice": "#FABFD2",
        "Normal": "#E15759",
        "Poison": "#FF9D9A",
        "Psychic": "#79706E",
        "Rock": "#711adb",
        "Steel": "#BAB0AC",
        "Water": "#D37295"
    }
    let keys = Object.keys(colors);
    var generationDropDown = d3.select("#genfilter").append("select")
                    .attr("name", "generation-list");
    var legendaryDropDown = d3.select("#legfilter").append("select")
                    .attr("name", "legendary-list");
    legendaryDropDown.on("change", function() {
            leg = this.value;
            svgContainer.selectAll(".circles").attr("style","visibility: hidden");
            if (leg == "(All)" && gen=="(All)") {
                svgContainer.selectAll(".circles")
                    .attr("style","visibility: visible");
            } else if(leg == "(All)") {
                svgContainer.selectAll(".g"+gen)
                    .attr("style","visibility: visible");
            } else if (gen == "(All)") {
                svgContainer.selectAll("."+leg)
                    .attr("style","visibility: visible");
            } else {
                svgContainer.selectAll("." + leg)
                    .filter(".g" + gen)
                    .attr("style","visibility: visible");
            }
    });
    generationDropDown.on("change", function() {
        gen = this.value;
        svgContainer.selectAll(".circles").attr("style","visibility: hidden");
        if (leg == "(All)" && gen=="(All)") {
            svgContainer.selectAll(".circles")
                .attr("style","visibility: visible");
        } else if(leg == "(All)") {
            svgContainer.selectAll(".g"+gen)
                .attr("style","visibility: visible");
        } else if (gen == "(All)") {
            svgContainer.selectAll("."+leg)
                .attr("style","visibility: visible");
        } else {
            svgContainer.selectAll("." + leg)
                .filter(".g" + gen)
                .attr("style","visibility: visible");
        }
    });
    window.onload = function() {
        svgContainer = d3.select('body')
          .append('svg')
          .attr('width', 1100)
          .attr('height', 500);
        d3.csv("pokemon.csv")
          .then((csvData) => makeScatterPlot(csvData));
        var genOptions = generationDropDown.selectAll("option")
            .data(generation)
            .enter()
            .append("option");
        genOptions.text(function (d) { return d; })
            .attr("value", function (d) { return d; });
        var legOptions = legendaryDropDown.selectAll("option")
            .data(legendary)
            .enter()
            .append("option");
        legOptions.text(function (d) { return d; })
            .attr("value", function (d) { return d; });
        svgContainer.append("text")
            .attr("transform","translate(" + (800) + " ," + (90) + ")")
            .attr("fill", "black")
            .attr("font-size", "13px")
            .attr("font-family", "Arial")
            .text("Type 1")
        // Add one dot in the legend for each name.
        var size = 15
        svgContainer.selectAll("mydots")
            .data(keys)
            .enter()
            .append("rect")
                .attr("x", 800)
                .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("width", size)
                .attr("height", size)
                .style("fill", function(d){ return colors[d]})

        // Add one dot in the legend for each name.
        svgContainer.selectAll("mylabels")
            .data(keys)
            .enter()
            .append("text")
                .attr("x", 800 + size*1.2)
                .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
                .style("fill", function(d){ return colors[d]})
                .text(function(d){ return d})
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
        
    }

    function makeScatterPlot(csvData) {
        data = csvData;
        let def = data.map((row) => parseInt(row["Sp. Def"]));
        let total = data.map((row) => parseInt(row["Total"]));
        let axesLimits = findMinMax(def, total);
        let mapFunctions = drawTicks(axesLimits);
        plotData(mapFunctions);
    }

    function plotData(map) {
        let xMap = map.x;
        let yMap = map.y;
        // make tooltip
        let div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        svgContainer.selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
                .attr("class", function(d){return "circles " + d["Legendary"] + " g" +d["Generation"];})
                .attr('cx', xMap)
                .attr('cy', yMap)
                .attr('r', 4)
                .attr('fill', function(d) {return colors[ d["Type 1"]]})
                .on("mouseover", (d) => {
                    div.transition()
                      .duration(200)
                      .style("opacity", .9);
                    div.html(d["Name"] + "<br/>" + d["Type 1"] + "<br/>" + d["Type 2"])
                      .style("left", (d3.event.pageX) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
                  })
                  .on("mouseout", (d) => {
                    div.transition()
                      .duration(500)
                      .style("opacity", 0);
                  });
    }

    // draw the axes and ticks
    function drawTicks(limits) {
        //text label for the x axis
        svgContainer.append("text")
            .attr("transform","translate(" + ((800)/2) + " ," + (500) + ")")
            .attr("fill", "black")
            .attr("font-size", "13px")
            .attr("font-family", "Arial")
            .text("SP. Def")
        //text label for the y axis
        svgContainer.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 10)
            .attr("x", -300)
            .attr("fill", "black")
            .attr("font-size", "13px")
            .attr("font-family", "Arial")
            .text("Total")

        let xValue = function(d) { return +d["Sp. Def"]; }

        let xScale = d3.scaleLinear()
        .domain([limits.defMin - 5, limits.defMax]) // give domain buffer room
        .range([50, 750]);

        // xMap returns a scaled x value from a row of data
        let xMap = function(d) { return xScale(xValue(d)); };

        // plot x-axis at bottom of SVG
        let xAxis = d3.axisBottom().scale(xScale);
        svgContainer.append("g")
        .attr('transform', 'translate(0, 450)')
        .call(xAxis);

        // return total from a row of data
        let yValue = function(d) { return +d.Total}

        // function to scale total
        let yScale = d3.scaleLinear()
        .domain([limits.totalMax, limits.totalMin - 0.05]) // give domain buffer
        .range([50, 450]);

        // yMap returns a scaled y value from a row of data
        let yMap = function (d) { return yScale(yValue(d)); };

        // plot y-axis at the left of SVG
        let yAxis = d3.axisLeft().scale(yScale);
        svgContainer.append('g')
        .attr('transform', 'translate(50, 0)')
        .call(yAxis);

        // return mapping and scaling functions
        return {
        x: xMap,
        y: yMap,
        xScale: xScale,
        yScale: yScale
        };
    }

    // find min and max 
    function findMinMax(def, total) {
        // get min/max def scores
        let defMin = d3.min(def);
        let defMax = d3.max(def);
        // round x-axis limits
        defMax = Math.round(defMax*10)/10;
        defMin = Math.round(defMin*10)/10;
        let totalMin = d3.min(total);
        let totalMax = d3.max(total);
        // round y-axis limits to nearest 0.05
        totalMax = Number((Math.ceil(totalMax*20)/20).toFixed(2));
        totalMin = Number((Math.ceil(totalMin*20)/20).toFixed(2));
        // return formatted min/max data as an object
        return {
        defMin : defMin,
        defMax : defMax,
        totalMin : totalMin,
        totalMax : totalMax
        }
    }
})();