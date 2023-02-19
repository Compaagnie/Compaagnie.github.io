const placeForDetailBarChart = "focus";
const placeForOverallBarChart = "overallChart";

var descri = [
  {pollutant: "Hardness", descri: "Water hardness is a traditional measure of the capacity of water to react with soap. Hard water requires a considerable amount of soap to produce a lather. Water supplies with a hardness greater than 200 mg/L are considered poor but have been tolerated by consumers; those in excess of 500 mg/L are unacceptable for most domestic purposes."},
  {pollutant: "Hydrogen Carbonate (Bicarbonate) HCO3", descri: "Bicarbonate (HCO3) is an important component in the human body. Natural mineral or spring waters have different levels of bicarbonates, varying from ten to hundreds of mg/l. Water that has a pH of 7.5 or above is usually associated with high levels of bicarbonates."},
  {pollutant: "Calcium", descri: "There is no evidence of adverse health effects specifically attributable to calcium in drinking water. It contributes to the hardness of water."},
  {pollutant: "Sulphate", descri: "There is no health-based guideline value for sulfate in drinking water. However, there is an increasing likelihood of complaints arising from a noticeable taste as concentrations in water increase above 500 mg/litre."},
  {pollutant: "Chloride", descri: "An aesthetic objective of ≤250 mg/L has been established for chloride in drinking water. At concentrations above the aesthetic objective, chloride imparts undesirable tastes to water and may cause corrosion in the distribution system."},
  {pollutant: "Total suspended solids", descri: "Total dissolved solids comprise inorganic salts and small amounts of organic matter that are dissolved in water. An aesthetic objective of under under 500 mg/L has been established for total dissolved solids in drinking water. At higher levels, excessive hardness, unpalatability, mineral deposition and corrosion may occur."},
  {pollutant: "Sodium", descri: "There is no health-based guideline value for sodium in drinking water. However, sodium may affect the taste of drinking-water at levels above about 200 mg/litre."},
  {pollutant: "Nitrate", descri: "The maximum acceptable concentration for nitrate in drinking water is 45 mg/L. Larger quantities may lead to methemoglobinemia."},
  {pollutant: "Dissolved oxygen", descri: "Dissolved oxygen is the amount of oxygen available to living aquatic organisms. The amount of dissolved oxygen in a water body can tell a lot about its water quality."},
  {pollutant: "CODCr", descri: "Chemical Oxygen Demand. It is a way of measuring organic matter."},
  {pollutant: "Magnesium", descri: "There is no evidence of adverse health effects specifically attributable to magnesium in drinking water. A guideline for magnesium has therefore not been specified. Magnesium is a major contributor to water hardness. Magnesium is an essential element in human metabolism."},
  {pollutant: "Total nitrogen", descri: "Nitrogen are essential for plant and animal growth, however excess nitrogen can cause overstimulation of growth of aquatic plants and algae."},
  {pollutant: "Silicate", descri: "Silicate is a source of food for aquatic life, but can also cause overgrowing of algae."},
  {pollutant: "Total inorganic nitrogen", descri: "Inorganic nitrogen is nitrogen that occurs in inorganic compounds. Nitrogen are essential for plant and animal growth, however excess nitrogen can cause overstimulation of growth of aquatic plants and algae."},
  {pollutant: "Total oxidised nitrogen", descri: "Nitrogen are essential for plant and animal growth, however excess nitrogen can cause overstimulation of growth of aquatic plants and algae."},
  {pollutant: "Potassium", descri: "There is no health-based guideline value for potassium in drinking water. Large quantities can lead to hyperkalemia."},
  {pollutant: "Dissolved organic carbon (DOC)", descri: "A fraction of organic carbon that through some filters. "},
  {pollutant: "BOD5", descri: "BOD5 measures the mass of molecular oxygen consumed by micro-organism in 5 days."},
  {pollutant: "Total organic carbon (TOC)", descri: "Concentration of organic carbon. High TOC levels are not harmful to humans."},
  {pollutant: "Kjeldahl nitrogen", descri: "A certain type of analysis of nitrogen. Nitrogen are essential for plant and animal growth, however excess nitrogen can cause overstimulation of growth of aquatic plants and algae."},
  {pollutant: "Total organic nitrogen", descri: "Organic nitrogen is nitrogen that occurs in inorganic compounds. Nitrogen are essential for plant and animal growth, however excess nitrogen can cause overstimulation of growth of aquatic plants and algae."},
  {pollutant: "Ammonium", descri: "There is no health guideline for ammonium in drinking water."},
  {pollutant: "Fluorine", descri: "The maximum acceptable concentration for fluoride in drinking water is 1.5 mg/L. Large quantities may lead to skeletal fluorosis."},
  {pollutant: "Uranium", descri: "The guideline value of World Health Organization is 30 µg/L for uranium. As of 2018, the European Union has not established a drinking water value for natural uranium. There isn’t enough evidence to conclude that natural uranium in drinking water will cause cancer in humans. However, chronic exposure may affect the kidney."},
  {pollutant: "Total phosphorus", descri: "Phosphorus is essential for plant and animal growth. It is a common constituent of fertilizers. Excess Phosphorus can cause overgrowth of algae."},
  {pollutant: "Nitrite", descri: "The maximum acceptable concentration for nitrite in drinking water is 3 mg/L. Larger quantities may lead to methemoglobinemia."},
  {pollutant: "Phosphate", descri: "Excess can lead to overgrowth of algae."},
  {pollutant: "Iron and its compounds", descri: "The aesthetic objective for iron in drinking water is ≤0.3mg/L. Iron, an essential element in human nutrition. Iron is an essential element in human metabolism."}
];



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
// each site id that has the given polluants
// key : polluant, value : array of idSites
var idSite_eachPolluants;
var xScaleFix, sortByPropertyName;

var overallBarChart;
var detailBarChart;
var Legend;

d3.csv("../data/waterBodiesData.csv", d3.autotype).then(function(data){
  usableDataForBars = data;

  totalByProperty = d3.rollup(usableDataForBars, v => d3.sum(v, d => d.resultMeanValue), d => d.observedPropertyDeterminandLabel);
  idSite_eachPolluants = d3.rollup(usableDataForBars, v => d3.map(v, d => d.monitoringSiteIdentifier), d => d.observedPropertyDeterminandLabel)
	byWaterBodyIdentifier = d3.group(usableDataForBars, function(d){return(d.monitoringSiteIdentifier)});

  xScaleFix = usableDataForBars.filter(function(d){
    d.resultMeanValue = parseFloat(d.resultMeanValue);
    return (d.resultUom.match(/mg/i) && totalByProperty.get(d.observedPropertyDeterminandLabel) > 100 && totalByProperty.get(d.observedPropertyDeterminandLabel) < 80000 );
  });
  sortByPropertyName = d3.groupSort(xScaleFix, D => d3.sum(D, d => -d.resultMeanValue), d => d.observedPropertyDeterminandLabel);  
  Legend = d3.select("#focus")
  .append("div")
  .attr("id", "detailBarTooltip")
  .style("opacity", 1)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px");
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

var selected_polluants = new Set();
var current_circle_color = 0;
var site_ids = [];

// function used to filter on polluant for the map
function bar_mouseclick(event, d)
{
	// manage selection
	if(selected_polluants.has(d.data[0])) // if already selected
	{
		// remove only this elem
		if(event.shiftKey) selected_polluants.delete(d.data[0])
		// remove all elems
		else selected_polluants = new Set();
	}
	else // if not selected
	{
		// add to selection
		if(event.shiftKey) selected_polluants.add(d.data[0])
		// se as selection
		else selected_polluants = new Set([d.data[0]]);
	}

	// get all sites corresponding to all "polluants"
	const all_sites_arrays = Array.from(selected_polluants).map(v => idSite_eachPolluants.get(v));
	// concatenante all found site arrays into one big array
	const all_sites = ([]).concat(...all_sites_arrays);

	// console.log("All sites arrays:", all_sites_arrays);
	// console.log("All sites :", all_sites);

	// filter the map data to gather only the corresponding BW
	var map_filtered = usableDataForMap.filter(
		function(d)
		{
			return all_sites.find(m => m == d.idSite);
		}
	);


	// if no polluant is selected, go back to default (all BW)
	if(all_sites.length == 0) map_filtered = usableDataForMap;

	// function to have a liner size for the radius of the circles
	var size = d3.scaleLinear()
      .domain([0,50])  // What's in the data
      .range([1, 15]);

	
	// const newRandomColor = "#" + Math.floor(Math.random()*16777215).toString(16);
	const newRandomColor = d3.schemeTableau10[current_circle_color++%d3.schemeTableau10.length]
	const bothRandomColor = "#" + Math.floor(Math.random()*16777215).toString(16);
	
	var color = "#a8dadc";
	if(event.shiftKey) color = newRandomColor;

	// create circles for each BW corresponding to its area
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
					.attr("stroke", "#219ebc")
					.attr("fill-opacity", .4)
					.attr("fill", color)
					.on("mouseover", map_mouseover)
					.on("mousemove", map_mousemove)
					.on("mouseleave", map_mouseleave)
					.on("click", map_mouseclick);
				// console.log(enter);
			}
			,
			update => 
			{
				if(!event.shiftKey) update.attr("fill", color);
				else 
				{
					update
					.attr("fill-opacity", .2)
					.append("circle")
					.attr("cx", function(d){ return projection([d.lon, d.lat])[0] })
					.attr("cy", function(d){ return projection([d.lon, d.lat])[1] })
					.attr("r", function(d){ return size(Math.sqrt(d.area/Math.PI)) })
					.attr("stroke-width", 1)
					.attr("stroke", "#219ebc")
					.attr("fill-opacity", .2)
					.attr("fill", bothRandomColor)
					.on("mouseover", map_mouseover)
					.on("mousemove", map_mousemove)
					.on("mouseleave", map_mouseleave)
					.on("click", map_mouseclick);
				}
				// update.attr("fill", bothRandomColor);
			}
			,
			exit =>
			{
				// console.log(exit);
				if(!event.shiftKey) exit.remove();
				
			}
		)
	

	// BubbleMap(map_filtered);
}

// create a tooltip
var Tooltip_Bars = d3.select("#chart-contain")
.append("div")
.attr("class", "tooltip")
.style("opacity", 0)
.style("background-color", "white")
.style("border", "solid")
.style("border-width", "2px")
.style("border-radius", "5px")
.style("padding", "5px");

// Three function that change the tooltip when user hover / move / leave a cell
var bar_mouseover = function(event, d) {
  Tooltip_Bars.style("opacity", 1);
}
var bar_mousemove = function(event, d) {
  // console.log(d.data[0]);
  Tooltip_Bars
  .html(descri.find(element => element.pollutant == d.data[0]).descri)
  .style("left", (event.x)/2 + "px")
  .style("top", (event.y)/2 + "px");
}
var bar_mouseleave = function(event, d) {
  Tooltip_Bars.style("opacity", 0);
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
      console.log(series);
  
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
            .text(yLabel))
  
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
      .on("mouseover", bar_mouseover)
      .on("mousemove", bar_mousemove)
      .on("mouseleave", bar_mouseleave);
				
  
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

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/grouped-bar-chart
function GroupedBarChart(data, {
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
  xRange = [marginLeft, width - marginRight], // [xmin, xmax]
  xPadding = 0.1, // amount of x-range to reserve to separate groups
  yType = d3.scaleLinear, // type of y-scale
  yDomain, // [ymin, ymax]
  yRange = [height - marginBottom, marginTop], // [ymin, ymax]
  zDomain, // array of z-values
  zPadding = 0.05, // amount of x-range to reserve to separate bars
  yFormat, // a format specifier string for the y-axis
  yLabel, // a label for the y-axis
  colors = d3.schemeTableau10, // array of colors
} = {}) {
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const Z = d3.map(data, z);

  // Compute default domains, and unique the x- and z-domains.
  if (xDomain === undefined) xDomain = X;
  if (yDomain === undefined) yDomain = [0, d3.max(Y)];
  if (zDomain === undefined) zDomain = Z;
  xDomain = new d3.InternSet(xDomain);
  zDomain = new d3.InternSet(zDomain);
  console.log(Y);
  console.log(d3.max(Y));
  console.log(yDomain);
  // Omit any data not present in both the x- and z-domain.
  const I = d3.range(X.length).filter(i => xDomain.has(X[i]) && zDomain.has(Z[i]));

  // Construct scales, axes, and formats.
  const xScale = d3.scaleBand(xDomain, xRange).paddingInner(xPadding);
  const xzScale = d3.scaleBand(zDomain, [0, xScale.bandwidth()]).padding(zPadding);
  const yScale = yType(yDomain, yRange);
  const zScale = d3.scaleOrdinal(zDomain, colors);
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
    .selectAll("rect")
    .data(I)
    .join("rect")
      .attr("x", i => xScale(X[i]) + xzScale(Z[i]))
      .attr("y", i => yScale(Y[i]))
      .attr("width", xzScale.bandwidth())
      .attr("height", i => yScale(0) - yScale(Y[i]))
      .attr("fill", i => zScale(Z[i]));

  if (title) bar.append("title")
      .text(title);

  const xGroup = svg.append("g")
  .style("font-size", "1em")
  .attr("transform", `translate(0,${yScale(0)})`)
  .call(xAxis);

  xGroup.selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");
  return Object.assign(svg.node(), {scales: {color: zScale}});
}

