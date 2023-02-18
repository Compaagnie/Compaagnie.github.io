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
      .domain([0,50])  // What's in the data
      .range([ 1, 15]);
   

  svgMap
      .selectAll("myCircles")
      .data(data)
      .enter()
      .append("circle")
        .attr("cx", function(d){ return projection([d.lon, d.lat])[0] })
        .attr("cy", function(d){ return projection([d.lon, d.lat])[1] })
        .attr("r", function(d){ return size(Math.sqrt(d.area/Math.PI))})
        .attr("stroke-width", 1)
        .attr("stroke", "#219ebc" )
        .attr("fill-opacity", .4)
        .attr("fill", "#a8dadc" )


  // The scale you use for bubble size
  var size = d3.scaleSqrt()
    .domain([0, 50])  // What's in the data, let's say it is percentage
    .range([1, 15])  // Size in pixel

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