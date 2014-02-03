window.makeGoo = function(data)
{
	var goo = {};
	goo.z = 1.5;
	if (data.gooNumber)
		goo.gooNumber = data.gooNumber;
	goo.x = data.x;
	goo.y = data.y;
	goo.nextX = data.x;
	goo.nextY = data.y;
	goo.movingDir = 0;
	goo.width = 10;
	goo.height = 10;
	goo.checkType = function(str)
	{
		if (str == 'goo')
			return true;
		return false;
	}
	goo.draw = function(ctx)
	{
		ctx.fillStyle = '#00ff00';
		ctx.fillRect(this.x, this.y, 10, 10);
	}
	goo.go = function()
	{
		
	}
	window.objects.push(goo);
}