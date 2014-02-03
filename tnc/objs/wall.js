window.makeWall = function(data)
{
	var wall = {};
	wall.x = data.x;
	wall.y = data.y;
	wall.width = 10;
	wall.height = 10;
	wall.checkType = function(str)
	{
		if (str == 'wall')
			return true;
		return false;
	}
	wall.draw = function(ctx)
	{
		ctx.fillStyle = '#000000';
		ctx.fillRect(this.x, this.y, 10, 10);
	}
	wall.go = function()
	{
		return checkCollisions({type:"enemy", obj:this});
	}
	window.objects.push(wall);
}