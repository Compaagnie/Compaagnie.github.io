const widthMap = 550, heightMap = 550;
const path = d3.geoPath();
const projection = d3.geoConicConformal()
  .center([2.454071, 46.279229])
  .scale(2800)
  .translate([widthMap / 2, heightMap / 2]);

path.projection(projection);

const svgMap = d3.select('#map').append("svg")
  .attr("id", "svg")
  .attr("width", widthMap)
  .attr("height", heightMap)
  ;


	
let zoom = d3.zoom()
   .scaleExtent([1, 3])
   .on('zoom', event => {
       svgMap.attr('transform', event.transform)
   });
 
const container = d3.select("#map")	;
container.call(zoom);

const deps = svgMap.append("g").classed("departments", true);

d3.json('data/departments.json').then(function(geojson) {
  deps.selectAll("path")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "#e0e0e0")
    .style("stroke", "white");
});

var Tooltip;
var circles;

var usableDataForMap_notunique = undefined;
var usableDataForMap = undefined;

d3.csv("data/PosArea.csv", d => {
  return {
    idSite: d.monitoringSiteIdentifier,
    idBW: d.waterBodyIdentifier,
    type: d.waterBodyIdentifierScheme,
    name: d.waterBodyName,
    lon: d.lon,
    lat: d.lat,
    area: d.cArea
  }
}).then(data => {
  // sort the data by body of water and longitude so we don't get empty lon/lat
  data = data.sort((a, b) => d3.ascending(a.idBW, b.idBW) || d3.ascending(a.lon, b.lon));
	
	// save loaded data for later usage
	usableDataForMap_notunique = data;

  // remove duplicate water body
  const dataBW = [...new Map(data.map((m) => [m.idBW, m])).values()];
  //var dataBW = uniqueBW.filter(function(d) { return d.type == "euGroundWaterBodyCode" || d.type == "eionetGroundWaterBodyCode"});

  //data = uniqueBW.map(getArea);
  // console.log(dataBW);

	usableDataForMap = dataBW;
  var chart = BubbleMap(dataBW);
})

// current sources selected on the map
var map_selection = [];

// a function used to select a source (or multiple sources) 
// and filter the bar chart by those sources
function map_mouseclick(event, d)
{	
	// add to array or change array depending on click
	if(event.shiftKey) map_selection.push(d.idBW);
	else map_selection = [d.idBW];

	console.log(map_selection);

	// Get filtered idBW
	const filtered_bw = usableDataForMap_notunique.filter(
		function(d) 
		{ 
			return map_selection.find(m => m == d.idBW);
	});

	// Get sites corresponding to those
	const filtered_sites = filtered_bw.map((m) => [m.idSite]);
	
	console.log(filtered_sites);
	
	// Filter the bar_chart data to match only the identifiers
	const filtered_bars = usableDataForBars.filter(
		function(d)
		{ 
			// console.log(d.monitoringSiteIdentifier);
			return filtered_sites.find(s => s == d.monitoringSiteIdentifier);
		});
	
	console.log(filtered_bars);

	// var new_bar_chart = create_bar_chart_from_data(filtered_bars);
	// document.getElementById(placeForBarChart).append(new_bar_chart);
}


// Three function that change the tooltip
// when user hover / move / leave a cell
function map_mouseover(event, d) 
{
	Tooltip.style("opacity", 1)
}
function map_mousemove(event, d) 
{
	Tooltip
		.html(d.name + "<br>" + "area: " + d.area + "<br> long: " + d.lon + " lat:  " + d.lat)
		.style("left", (event.x)/2 + "px")
		.style("top", (event.y)/2 + "px")
}
function map_mouseleave(event, d) {
	Tooltip.style("opacity", 0)
}



function BubbleMap(data){

  // create a tooltip
  Tooltip = d3.select("#map")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
	

  var size = d3.scaleLinear()
      .domain([0,50])  // What's in the data
      .range([ 1, 15]);
   

  circles = svgMap.append("g").classed("circles", true)

	circles.selectAll("circle")
		.data(data, d => d.idSite)
		.enter()
		.append("circle")
			.attr("cx", function(d){ return projection([d.lon, d.lat])[0] })
			.attr("cy", function(d){ return projection([d.lon, d.lat])[1] })
			.attr("r", function(d){ return size(Math.sqrt(d.area/Math.PI))})
			.attr("stroke-width", 1)
			.attr("stroke", "#219ebc")
			.attr("fill-opacity", .4)
			.attr("fill", "#a8dadc" )
		.on("mouseover", map_mouseover)
		.on("mousemove", map_mousemove)
		.on("mouseleave", map_mouseleave)
		.on("click", map_mouseclick)

  // Add legend: circles
  var valuesToShow = [1000, 3000, 6000]
  var xCircle = 30
  var xLabel = 70
  var yCircle = 400
  svgMap
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
      .attr("cx", xCircle)
      .attr("cy", d => yCircle - size(Math.sqrt(d/Math.PI)))
      .attr("r", d => size(Math.sqrt(d/Math.PI)))
      .style("fill", "none")
      .attr("stroke", "black")

  // Add legend: segments
  svgMap
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("line")
      .attr('x1', d => xCircle + size(Math.sqrt(d/Math.PI)) )
      .attr('x2', xLabel)
      .attr('y1', d => yCircle - size(Math.sqrt(d/Math.PI)) )
      .attr('y2', d => yCircle - size(Math.sqrt(d/Math.PI)) )
      .attr('stroke', 'black')
      .style('stroke-dasharray', ('2,2'))

  // Add legend: labels
  svgMap
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
      .attr('x', xLabel)
      .attr('y', d => yCircle - size((Math.sqrt(d/Math.PI))) )
      .text( d => d )
      .attr('alignment-baseline', 'middle')

}