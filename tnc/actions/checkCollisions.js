window.checkCollisions = function(data)
{
	if (data.obj.beingRemoved)
		return true;
	if (data.obj.x < 0)
		return true;
	if (data.obj.y < 0)
		return true;
	if (data.obj.x > window.stats.gameWidth)
		return true;
	if (data.obj.y > window.stats.gameHeight)
		return true;
	if (data.obj.checkType('bullet'))
	{
		for (var i in window.objects)
		{
			if (window.objects[i].checkType('wall'))
				if (distanceBetween(window.objects[i], data.obj) < 10)
					return true;
		}
	}
	if (data.obj.checkType('enemy'))
	{
		for (var i in window.objects)
		{
			if (window.objects[i].checkType('bullet'))
				if (distanceBetween(window.objects[i], data.obj) < 10)
					return true;
		}
	}
	return false;
}
window.tilize = function(amount)
{
	return Math.round(amount/10)*10;
}
window.distanceBetween = function(obj1, obj2)
{
	var distX = obj1.x+obj1.width/2 - obj2.x-obj2.width/2;
	var distY = obj1.y+obj1.height/2 - obj2.y-obj2.height/2;
	var h = Math.sqrt(distX*distX + distY*distY);
	return h;
}