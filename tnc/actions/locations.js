window.getRoom = function(data)
{
	var blocks = [];
	for (var x = data.x; x < data.width+data.x; x += 10)
	{
		for (var y = data.y; y < data.height+data.y; y += 10)
		{
			blocks.push({x:x, y:y});
		}
	}
	return blocks;
}
window.getHere = function(data)
{
	for (var i in window.objects)
	{
		if (window.objects[i].checkType(data.type))
		{
			if (data.x >= window.objects[i].x &&
				data.x <= window.objects[i].x + window.objects[i].width &&
				data.y >= window.objects[i].y && 
				data.y <= window.objects[i].y + window.objects[i].height)
				return window.objects[i];
		}
	}
	return false;
}
window.getRightHere = function(data)
{
	for (var i in window.objects)
	{
		if (window.objects[i].checkType(data.type))
		{
			if (data.x == window.objects[i].x &&
				data.y == window.objects[i].y)
				return window.objects[i];
		}
	}
	return false;
}
window.checkHere = function(data)
{
	for (var i in window.objects)
	{
		if (window.objects[i].checkType(data.type))
		{
			if (data.x >= window.objects[i].x &&
				data.x <= window.objects[i].x + window.objects[i].width &&
				data.y >= window.objects[i].y && 
				data.y <= window.objects[i].y + window.objects[i].height)
				return true;
		}
	}
	return false;
}
window.collides = function(data)
{
	for (var i in window.objects)
	{
		if (window.objects[i].checkType(data.type))
		{
			if (data.x == window.objects[i].x &&
				data.y == window.objects[i].y)
				return true;
		}
	}
	return false;
}