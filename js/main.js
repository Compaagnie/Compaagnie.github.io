const sizeX = 400;
const sizeY = 379;

const createMap = function (){
    var svg = d3.select("#map")
        .append("svg")
    
    svg.attr("width", sizeX)
        .attr("height", sizeY)
        .classed("centered", true);
    
        
    var group = svg.append("g");
    group.append("image")
        .attr("id", "risk1")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", sizeX)
        .attr("height", sizeY)
        .attr("href", "workplace.png")
        .on("click", function(){setFocus(1)});

    // group.append("rect")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("width", sizeX)
    //     .attr("height", sizeY)
    //     .attr("fill", "none")
    
    group.append("circle")
        .attr("id", "risk2")
        .attr("cx", 290)
        .attr("cy", 172)
        .attr("r", 30)
        .style("fill", "Lightblue")
        .on("click", function(){setFocus(2)});
    
    group.append("circle")
        .attr("id", "risk3")
        .attr("cx", 337)
        .attr("cy", 300)
        .attr("r", 44)
        .style("fill", "Blue")
        .on("click", function(){setFocus(3)});
}

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
createMap();
createLegende();

function setFocus(map_id)
{
    if (button[map_id-1]) {
        document.getElementById('focus').innerHTML = '<h2> Focus on map ' + map_id + '</h2>';
        
    }
}

setFocus(1);

