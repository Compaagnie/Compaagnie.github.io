function setFocus(map_id)
{
	document.getElementById('focus').innerHTML = '<h2> Focus on map ' + map_id + '</h2>';
}

function toggleAllMapButtons()
{
	for(var btn of document.getElementsByClassName('map-btn'))
	{
		var is_disabled = btn.classList.contains('disabled');
		if(is_disabled) btn.classList.remove('disabled');
		else btn.classList.add('disabled');
	}
}