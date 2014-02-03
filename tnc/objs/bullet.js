window.makeBullet = function(data)
{
	var bullet = {};
	bullet.checkType = function(str)
	{
		if (str == 'bullet')
			return true;
		return false;
	}
	bullet.x = data.x;
	bullet.y = data.y;
	bullet.width = 5;
	bullet.height = 5;
	bullet.dir = data.dir*Math.PI/180;
	bullet.draw = function(ctx)
	{
		ctx.fillStyle = '#0000ff';
		ctx.fillRect(this.x, this.y, bullet.width, bullet.height);
	}
	bullet.go = function()
	{
		if (window.inGame)
		{
			var newX = this.x + window.objectspeed*Math.cos(this.dir);
			var newY = this.y + window.objectspeed*Math.sin(this.dir);
			if (!checkHere({x:newX, y:newY, type:'space'}))
				return true;
			this.x = newX;
			this.y = newY;
			
			for (var i in window.objects)
			{
				if (window.objects[i].checkType('wall'))
					if (distanceBetween(window.objects[i], this) < 10)
						return true;
			}
		}
	}
	window.objects.push(bullet);
	if (window.socket && window.isClient)
	{
		window.socket.emit
		(
			'update', 
			{
				name:'bullet', 
				x:bullet.x,
				y:bullet.y,
				dir:data.dir
			}
		);
	}
}