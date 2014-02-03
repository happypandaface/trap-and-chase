
window.makeSpace = function(data)
{
	var space = {};
	space.z = 1;
	space.x = data.x;
	space.y = data.y;
	space.width = 10;
	space.height = 10;
	space.checkType = function(str)
	{
		if (str == 'space')
			return true;
		return false;
	}
	space.draw = function(ctx)
	{
		if (this.highlighted)
			ctx.fillStyle = "#ff0000";
		else
			ctx.fillStyle = '#ffffff';
		ctx.fillRect(this.x, this.y, 10, 10);
	}
	space.go = function()
	{
		if (this.beingRemoved)
			return true;
		//return checkCollisions({type:"enemy", obj:this});
	}
	window.objects.push(space);
}