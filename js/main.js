const placeForBarChart = "test";

const sizeX = 400;
const sizeY = 379;

// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var waterBodies;
var filtered;
var usableDataForBars, xScaleFix;
var totalByProperty, sortByPropertyName, byWaterBodyIdentifier;
var barChart;
var createChart = function(){
  console.log(waterBodies);
  if (waterBodies == undefined){
    d3.csv("../data/T_WISE6_AggregatedData_FR.csv", d3.autotype).then(function(data){
      waterBodies = data//.filter(function(d,i){ return i<10 });
      filtered = waterBodies.filter(function(d){ return  !(d.observedPropertyDeterminandLabel == "pH" || d.observedPropertyDeterminandLabel == "Oxygen saturation" || d.observedPropertyDeterminandLabel == "Water temperature" || d.observedPropertyDeterminandLabel == "Hardness" || d.observedPropertyDeterminandLabel == "Hydrogen Carbonate (Bicarbonate) HCO3") })
      
      usableDataForBars = filtered.map(function(d){ 
        if (d.resultUom == "ug/L") {
          d.resultMeanValue = d.resultMeanValue/1000;
        }
        return d;
      });

      totalByProperty = d3.rollup(usableDataForBars, v => d3.sum(v, d => d.resultMeanValue), d => d.observedPropertyDeterminandLabel);
      console.log(totalByProperty);

      xScaleFix = usableDataForBars.filter(function(d){
        return totalByProperty.get(d.observedPropertyDeterminandLabel) > 100;
      });
      sortByPropertyName = d3.groupSort(xScaleFix, D => d3.sum(D, d => -d.resultMeanValue), d => d.observedPropertyDeterminandLabel);
      console.log(xScaleFix);
      byWaterBodyIdentifier = d3.group(waterBodies, function(d){return(d.monitoringSiteIdentifier)});
    });
  } else {
    barChart = StackedBarChart(xScaleFix, {
      x: d => d.observedPropertyDeterminandLabel,
      y: d => d.resultMeanValue,
      z: d => d.monitoringSiteIdentifier,
      xDomain: sortByPropertyName,
      yLabel: "↑ Population (millions)",
      //zDomain: waterBodyIdentifier,
      colors: d3.schemeSpectral[totalByProperty.length],
      width: 1500,
      height: 1500
    });
    document.getElementById(placeForBarChart).append(barChart);
  }
}

createChart();

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
    marginBottom = 200, // bottom margin, in pixels
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
    const margins = {top: 10, right: 30, bottom: 80, left: 20};

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
  
    const xGroup = svg.append("g")
      .attr("transform", `translate(0,${yScale(0)})`)
      .call(xAxis);

    xGroup.selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");
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

  var height = 100
  var width = 100
  var svgLeg = d3.select("#map")
    .append("svg")
      .attr("width", width)
      .attr("height", height)

  // The scale you use for bubble size
  var size = d3.scaleSqrt()
    .domain([0, 1500])  // What's in the data, let's say it is percentage
    .range([1, 100])  // Size in pixel

  // Add legend: circles
  var valuesToShow = [10, 50, 100]
  var xCircle = 30
  var xLabel = 70
  var yCircle = 70
  svgLeg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
      .attr("cx", xCircle)
      .attr("cy", d => yCircle - size(d))
      .attr("r", d => size(d))
      .style("fill", "none")
      .attr("stroke", "black")

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
