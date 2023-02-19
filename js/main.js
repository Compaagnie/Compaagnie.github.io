const placeForDetailBarChart = "focus";
const placeForOverallBarChart = "overallChart";

// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 550,
    height = 550;

// all the data
var usableDataForBars; 
// total value for each property that exists
var totalByProperty;
// grouped by waterBodyIdentifier
var byWaterBodyIdentifier;
var xScaleFix, sortByPropertyName;
var overallBarChart;
var detailBarChart;

d3.csv("../data/waterBodiesData.csv", d3.autotype).then(function(data){
  usableDataForBars = data;

  totalByProperty = d3.rollup(usableDataForBars, v => d3.sum(v, d => d.resultMeanValue), d => d.observedPropertyDeterminandLabel);
  byWaterBodyIdentifier = d3.group(usableDataForBars, function(d){return(d.monitoringSiteIdentifier)});
  console.log(byWaterBodyIdentifier);

  xScaleFix = usableDataForBars.filter(function(d){
    return (d.resultUom.match(/mg/i) && totalByProperty.get(d.observedPropertyDeterminandLabel) > 100 /*&& totalByProperty.get(d.observedPropertyDeterminandLabel) < 8000*/ );
  });
  sortByPropertyName = d3.groupSort(xScaleFix, D => d3.sum(D, d => -d.resultMeanValue), d => d.observedPropertyDeterminandLabel);
  
  detailBarChart = StackedBarChart([], {
    x: d => d.observedPropertyDeterminandLabel,
    y: d => d.resultMeanValue,
    z: d => d.monitoringSiteIdentifier,
    xDomain: sortByPropertyName,
    yLabel: "↑ Quantity (mg/L)",
    yRange: 1000,
    //zDomain: waterBodyIdentifier,
    colors: d3.schemeSpectral[totalByProperty.length],
    width: width,
    height: height
  });
  document.getElementById(placeForDetailBarChart).append(detailBarChart);
})


var createChart = function(){
  overallBarChart = StackedBarChart(xScaleFix, {
    x: d => d.observedPropertyDeterminandLabel,
    y: d => d.resultMeanValue,
    z: d => d.monitoringSiteIdentifier,
    xDomain: sortByPropertyName,
    yLabel: "↑ Quantity (mg/L)",
    //zDomain: waterBodyIdentifier,
    colors: d3.schemeSpectral[totalByProperty.length],
    width: 1500,
    height: 1000
  });
  document.getElementById(placeForOverallBarChart).append(overallBarChart);
}

// function used to filter on polluant for the map
function bar_mouseclick(event, d)
{
	// console.log(event, d);
	var site_ids = []
	for(var m of d.data[1]){ site_ids.push(m[0]); }

	console.log("Site ids:",site_ids);
	const map_filtered = usableDataForMap.filter(
	// const map_filtered = usableDataForMap_notunique.filter(
		function(d)
		{
			return site_ids.find(m => m == d.idSite);
		}
	);

	console.log("Map filtered:", map_filtered);
	// console.log(all_ids);

	var size = d3.scaleLinear()
      .domain([0,50])  // What's in the data
      .range([1, 15]);

	circles.selectAll("circle")
		.data(map_filtered, d => d.idSite)
		.join(
			enter =>
			{
				enter
					.append("circle")
					.attr("cx", function(d){ return projection([d.lon, d.lat])[0] })
					.attr("cy", function(d){ return projection([d.lon, d.lat])[1] })
					.attr("r", function(d){ return size(Math.sqrt(d.area/Math.PI)) })
					.attr("stroke-width", 1)
					.attr("stroke", "#219ebc" )
					.attr("fill-opacity", .4)
					.attr("fill", "#a8dadc" )
					// .attr("fill", "#ff0000" )
					.on("mouseover", map_mouseover)
					.on("mousemove", map_mousemove)
					.on("mouseleave", map_mouseleave)
					.on("click", map_mouseclick);
				// console.log(enter);
			}
			,
			update => 
			{
				// console.log(update)
				// update.attr("fill", "#00ff00")
			}
			,
			exit =>
			{
				// console.log(exit);
				exit.remove();
			}
		)
	

	// BubbleMap(map_filtered);
}

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
    marginBottom = 300, // bottom margin, in pixels
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
        .attr("style", "height: auto; height: intrinsic; overflow-x:scroll;");
  
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
		.classed("series", true)
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
        .attr("width", xScale.bandwidth())
				
  
    if (title) bar.append("title")
        .text(({i}) => title(i));

		bar.on("click", bar_mouseclick);
  
    const xGroup = svg.append("g")
      .style("font-size", "1em")
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



