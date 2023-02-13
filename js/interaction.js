var button = [true, true, true];
const defaultColor = ["Lightblue", "Blue"];

const toggleMapButton = function(button_id)
{
    button[button_id-1] = !button[button_id-1];
    if (button_id > 0){
        if (button[button_id-1]) {
            d3.select("#risk"+button_id).style("fill", defaultColor[button_id-2]);

        } else {
            d3.select("#risk"+button_id).style("fill", "LightGray");
        }
    }
}