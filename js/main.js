const sizeX = 400;
const sizeY = 379;

// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");



const createLegende = function(){
    var svg = d3.select("#legende")
        .append("svg")
    
    svg.attr("width", 100)
        .attr("height", 50)
        .classed("centered", true);
    
        
    var group = svg.append("g");
    group.append("rect")
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", 20)
        .attr("height", 10)
        .style("fill", "Lightblue");
    group.append("text")
        .attr("x", 35)
        .attr("y", 20)
        .text("Risk2")

    group.append("rect")
        .attr("x", 10)
        .attr("y", 30)
        .attr("width", 20)
        .attr("height", 10)
        .style("fill", "Blue");
    group.append("text")
        .attr("x", 35)
        .attr("y", 40)
        .text("Risk3")
}
createLegende();

function setFocus(map_id)
{
    if (button[map_id-1]) {
        document.getElementById('focus').innerHTML = '<h2> Focus on map ' + map_id + '</h2>';
        
    }
}

setFocus(1);

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var waterBodies;
var pollutants;
var waterBodyIdentifier;
var chart;
d3.csv("../data/Waterbase_v2021_1_T_WISE6_AggregatedDataByWaterBody.csv").then(function(data){
    waterBodies = data//.filter(function(d,i){ return i<10 });
    pollutants = d3.group(waterBodies, function(d){return(d.observedPropertyDeterminandLabel)});
    waterBodyIdentifier = d3.group(waterBodies, function(d){return(d.waterBodyIdentifier)});
    //console.log(waterBodies);
    //console.log(pollutants);
    //console.log(waterBodyIdentifier);
    chart = StackedBarChart(waterBodies, {
        x: d => d.observedPropertyDeterminandLabel,
        y: d => d.resultMeanValue,
        z: d => d.waterBodyIdentifier,
        
        yLabel: "↑ Population (millions)",
        //zDomain: waterBodyIdentifier,
        colors: d3.schemeSpectral[pollutants.length],
        
        height: 500
    })
    //console.log(chart)
    document.getElementById("test").append(chart)
});





// d3.select("#test").append(chart);
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/stacked-bar-chart
function StackedBarChart(data, {
    x = (d, i) => i, // given d in data, returns the (ordinal) x-value
    y = d => d, // given d in data, returns the (quantitative) y-value
    z = () => 1, // given d in data, returns the (categorical) z-value
    title, // given d in data, returns the title text
    marginTop = 30, // top margin, in pixels
    marginRight = 0, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    xDomain, // array of x-values
    xRange = [marginLeft, width - marginRight], // [left, right]
    xPadding = 0.1, // amount of x-range to reserve to separate bars
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    zDomain, // array of z-values
    offset = d3.stackOffsetDiverging, // stack offset method
    order = d3.stackOrderNone, // stack order method
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    colors = d3.schemeTableau10, // array of colors
  } = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const Z = d3.map(data, z);
    
    // Compute default x- and z-domains, and unique them.
    if (xDomain === undefined) xDomain = X;
    if (zDomain === undefined) zDomain = Z;
    xDomain = new d3.InternSet(xDomain);
    zDomain = new d3.InternSet(zDomain);
  
    // Omit any data not present in the x- and z-domains.
    const I = d3.range(X.length).filter(i => xDomain.has(X[i]) && zDomain.has(Z[i]));
    // Compute a nested array of series where each series is [[y1, y2], [y1, y2],
    // [y1, y2], …] representing the y-extent of each stacked rect. In addition,
    // each tuple has an i (index) property so that we can refer back to the
    // original data point (data[i]). This code assumes that there is only one
    // data point for a given unique x- and z-value.
    const series = d3.stack()
        .keys(zDomain)
        .value(([x, I], z) => Y[I.get(z)])
        .order(order)
        .offset(offset)
      (d3.rollup(I, ([i]) => i, i => X[i], i => Z[i]))
      .map(s => s.map(d => Object.assign(d, {i: d.data[1].get(s.key)})));
  
    // Compute the default y-domain. Note: diverging stacks can be negative.
    if (yDomain === undefined) yDomain = d3.extent(series.flat(2));
    //console.log(yDomain);
  
    // Construct scales, axes, and formats.
    const xScale = d3.scaleBand(xDomain, xRange).paddingInner(xPadding);
    const yScale = yType(yDomain, yRange);
    const color = d3.scaleOrdinal(zDomain, colors);
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(height / 60, yFormat);
  
    // Compute titles.
    if (title === undefined) {
      const formatValue = yScale.tickFormat(100, yFormat);
      title = i => `${X[i]}\n${Z[i]}\n${formatValue(Y[i])}`;
    } else {
      const O = d3.map(data, d => d);
      const T = title;
      title = i => T(O[i], i, data);
    }
  
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
  
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel));
  
    const bar = svg.append("g")
    .selectAll("g")
    .data(series)
    .join("g")
        .attr("fill", ([{i}]) => color(Z[i]))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
        .attr("x", ({i}) => xScale(X[i]))
        .attr("y", ([y1, y2]) => Math.min(yScale(y1), yScale(y2)))
        .attr("height", ([y1, y2]) => Math.abs(yScale(y1) - yScale(y2)))
        .attr("width", xScale.bandwidth());
  
    if (title) bar.append("title")
        .text(({i}) => title(i));
  
     svg.append("g")
         .attr("transform", `translate(0,${yScale(0)})`)
         .call(xAxis);
    //console.log(Object.assign(svg.node(), {scales: {color}}));
    return Object.assign(svg.node(), {scales: {color}});
  }


const widthMap = 550, heightMap = 550;
const path = d3.geoPath();
const projection = d3.geoConicConformal()
  .center([2.454071, 46.279229])
  .scale(2600)
  .translate([widthMap / 2, heightMap / 2]);

path.projection(projection);

const svgMap = d3.select('#map').append("svg")
  .attr("id", "svg")
  .attr("width", widthMap)
  .attr("height", heightMap);

const deps = svgMap.append("g");

d3.json('data/departments.json').then(function(geojson) {
  deps.selectAll("path")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "#e0e0e0")
    .style("stroke", "white");
});



d3.csv("data/PosArea.csv", d => {
  return {
    idSite: d.monitoringSiteIdentifier,
    idBW: d.waterBodyIdentifier,
    lon: d.lon,
    lat: d.lat,
    area: d.cArea
  }
}).then(data => {
  // sort the data by body of water and longitude so we don't get empty lon/lat
  data = data.sort((a, b) => d3.ascending(a.idBW, b.idBW) || d3.ascending(a.lon, b.lon));
  // remove duplicate water body
  const uniqueBW = [...new Map(data.map((m) => [m.idBW, m])).values()];
  var dataBW = uniqueBW.filter(function(d) { return d.lon != "" && d.lat != "" && d.area != "" && d.area != " "});

  //data = uniqueBW.map(getArea);
  //console.log(dataBW);

  var chart = BubbleMap(uniqueBW);

})


function BubbleMap(data){

  var size = d3.scaleLinear()
      .domain([0,1500])  // What's in the data
      .range([ 1, 5]);
   

  svgMap
      .selectAll("myCircles")
      .data(data)
      .enter()
      .append("circle")
        .attr("cx", function(d){ return projection([d.lon, d.lat])[0] })
        .attr("cy", function(d){ return projection([d.lon, d.lat])[1] })
        .attr("r", function(d){ return size(d.area) })
        .attr("stroke-width", 3)
        .attr("fill-opacity", .4)

  var height = 460
  var width = 460
  var svgLeg = d3.select("#map")
    .append("svgLeg")
      .attr("width", width)
      .attr("height", height)

  // The scale you use for bubble size
  var size = d3.scaleSqrt()
    .domain([1, 100])  // What's in the data, let's say it is percentage
    .range([1, 100])  // Size in pixel

  // Add legend: circles
  var valuesToShow = [10, 50, 100]
  var xCircle = 130
  var xLabel = 130
  var yCircle = 130
  svgLeg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
      .attr("cx", xCircle)
      .attr("cy", d => yCircle - size(d))
      .attr("r", d => size(d))
      .style("fill", "red")
      .attr("stroke", "red")

  // Add legend: segments
  svgLeg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("line")
      .attr('x1', d => xCircle + size(d) )
      .attr('x2', xLabel)
      .attr('y1', d => yCircle - size(d) )
      .attr('y2', d => yCircle - size(d) )
      .attr('stroke', 'black')
      .style('stroke-dasharray', ('2,2'))

  // Add legend: labels
  svgLeg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
      .attr('x', xLabel)
      .attr('y', d => yCircle - size(d) )
      .text( d => d )
      .style("font-size", 10)
      .attr('alignment-baseline', 'middle')

  console.log(svgLeg);
}
