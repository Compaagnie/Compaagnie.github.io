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

// Parse the Data
// d3.csv("data/Pollutants.csv", function(data) {


// // X axis
// var x = d3.scaleBand()
//   .range([ 0, width ])
//   .domain(data.map(function(d) { return d.gwPollutantCode; }))
//   .padding(0.2);
// svg.append("g")
//   .attr("transform", "translate(0," + height + ")")
//   .call(d3.axisBottom(x))
//   .selectAll("text")
//     .attr("transform", "translate(-10,0)rotate(-45)")
//     .style("text-anchor", "end");

// // Add Y axis
// var y = d3.scaleLinear()
//   .domain([0, 13000])
//   .range([ height, 0]);
// svg.append("g")
//   .call(d3.axisLeft(y));

// // Bars
// svg.selectAll("mybar")
//   .data(data)
//   .enter()
//   .append("rect")
//     .attr("x", function(d) { return x(d.gwPollutantCode); })
//     .attr("y", function(d) { return y(d.Value); })
//     .attr("width", x.bandwidth())
//     .attr("height", function(d) { return height - y(d.Value); })
//     .attr("fill", "#69b3a2")

// })

// const createMap = function (){
//     var svg = d3.select("#map")
//         .append("svg")
    
//     svg.attr("width", sizeX)
//         .attr("height", sizeY)
//         .classed("centered", true);
    
        
//     var group = svg.append("g");
//     group.append("image")
//         .attr("id", "risk1")
//         .attr("x", 0)
//         .attr("y", 0)
//         .attr("width", sizeX)
//         .attr("height", sizeY)
//         .attr("href", "workplace.png")
//         .on("click", function(){setFocus(1)});

//     // group.append("rect")
//     //     .attr("x", 0)
//     //     .attr("y", 0)
//     //     .attr("width", sizeX)
//     //     .attr("height", sizeY)
//     //     .attr("fill", "none")
    
//     group.append("circle")
//         .attr("id", "risk2")
//         .attr("cx", 290)
//         .attr("cy", 172)
//         .attr("r", 30)
//         .style("fill", "Lightblue")
//         .on("click", function(){setFocus(2)});
    
//     group.append("circle")
//         .attr("id", "risk3")
//         .attr("cx", 337)
//         .attr("cy", 300)
//         .attr("r", 44)
//         .style("fill", "Blue")
//         .on("click", function(){setFocus(3)});
// }

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
//createMap();
createLegende();

function setFocus(map_id)
{
    if (button[map_id-1]) {
        document.getElementById('focus').innerHTML = '<h2> Focus on map ' + map_id + '</h2>';
        
    }
}

setFocus(1);

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

  


  //data.features = data.features.filter( function(d){return d.properties.name=="France"} )
  // remove duplicate water body
  const uniqueBW = [...new Map(data.map((m) => [m.idBW, m])).values()];
  var dataBW = uniqueBW.filter(function(d) { return d.lon != "" && d.lat != "" && d.area != "" && d.area != " "});

  //data = uniqueBW.map(getArea);
  console.log(dataBW);

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
}
