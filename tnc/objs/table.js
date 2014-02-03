window.spawnTable = function(data)
{
	var table = {};
	table.z = 2;
	table.x = data.x;
	table.y = data.y;
	table.width = 10;
	table.height = 10;
	table.checkType = function(str)
	{
		if (str == 'table')
			return true;
		else if (str == 'wall')
			return true;
		return false;
	}
	table.activate = function(direction)
	{
		if (direction == 'right')
		{
			this.x += 10;
		}else
		if (direction == 'left')
		{
			this.x -= 10;
		}else
		if (direction == 'up')
		{
			this.y -= 10;
		}else
		if (direction == 'down')
		{
			this.y += 10;
		}
		var butt = getRightHere({x:this.x, y:this.y, type:'button'});
		if (butt)
			butt.activate(this);
		if (window.isClient)
			window.socket.emit('update', {name:'box', x:this.x, y:this.y});
	}
	table.draw = function(ctx)
	{
		ctx.fillStyle = "#aa0000";
		ctx.fillRect(this.x, this.y, 10, 10);
	}
	table.go = function()
	{
		if (this.beingRemoved)
			return true;
	}
	window.objects.push(table);
	return table;
}