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
        .attr("cx", 290)
        .attr("cy", 172)
        .attr("r", 30)
        .attr("fill", "Lightblue")
        .on("click", function(){setFocus(2)});
    
    group.append("circle")
        .attr("cx", 337)
        .attr("cy", 300)
        .attr("r", 44)
        .attr("fill", "Blue")
        .on("click", function(){setFocus(3)});
}

createMap();

function setFocus(map_id)
{
    document.getElementById('focus').innerHTML = '<h2> Focus on map ' + map_id + '</h2>';
}

setFocus(1);

function toggleAllMapButtons()
{
    for(var btn of document.getElementsByClassName('map-btn'))
    {
        var is_disabled = btn.classList.contains('disabled');
        if(is_disabled) btn.classList.remove('disabled');
        else btn.classList.add('disabled');
    }
}