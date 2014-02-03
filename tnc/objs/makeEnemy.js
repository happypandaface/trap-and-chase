window.makeEnemy = function(data)
{
	var enemy = {};
	if (data.enemyNumber)
		enemy.enemyNumber = data.enemyNumber;
	enemy.x = data.x;
	enemy.y = data.y;
	enemy.nextX = data.x;
	enemy.nextY = data.y;
	enemy.movingDir = 0;
	enemy.width = 10;
	enemy.height = 10;
	enemy.checkType = function(str)
	{
		if (str == 'enemy')
			return true;
		return false;
	}
	enemy.draw = function(ctx)
	{
		ctx.fillStyle = '#ff0000';
		ctx.fillRect(this.x, this.y, 10, 10);
	}
	enemy.go = function()
	{
		if (window.inGame)
		{
			var distX = window.guy.x - this.x;
			var distY = window.guy.y - this.y;
			var h = Math.sqrt(distX*distX+distY*distY);
			for (var i in window.objects)
			{
				if (window.objects[i].checkType('bullet'))
					if (distanceBetween(window.objects[i], this) < 10)
					{
						if (window.isClient)
							window.socket.emit('update', {name:'enemy', num:this.enemyNumber, action:'remove'});
						return true;
					}
			}
			if (h < 10 && !guy.jumping)
			{
				if (window.inGame && window.isClient)
				{
					window.endGame({result:'lose'});
				}else if (window.localGame)
				{
					window.endLocalGame({winner:'trapper'});
				}
			}
			if (this.movingDir == 0 ||
				this.movingDir == 1 && this.x >= this.nextX ||
				this.movingDir == 3 && this.x <= this.nextX ||
				this.movingDir == 4 && this.y >= this.nextY ||
				this.movingDir == 2 && this.y <= this.nextY)
			{
				this.movingDir = 0;
				var tryDown = true;
				var tryUp = true;
				var tryRight = true;
				var tryLeft = true;
				var iterations = 0;
				while(this.movingDir == 0 && iterations < 5)
				{
					iterations++;
					if (distX > 0 && (Math.abs(distX) > Math.abs(distY) || (!tryUp && !tryDown)) && tryRight)
					{
						if (getRightHere({x:this.nextX+10, y:this.nextY, type:'space'}))
						{
							this.movingDir = 1;
							this.nextX += 10;
						}else
							tryRight = false;
					}else if (distX < 0 && (Math.abs(distX) > Math.abs(distY) || (!tryUp && !tryDown)) && tryLeft)
					{
						if (getRightHere({x:this.nextX-10, y:this.nextY, type:'space'}))
						{
							this.movingDir = 3;
							this.nextX -= 10;
						}else
							tryLeft = false;
					}else if (distY > 0 && tryDown)
					{
						if (getRightHere({x:this.nextX, y:this.nextY+10, type:'space'}))
						{
							this.movingDir = 4;
							this.nextY += 10;
						}else
							tryDown = false;
					}else if (distY <= 0 && tryUp)
					{
						tryDown = false;
						if (getRightHere({x:this.nextX, y:this.nextY-10, type:'space'}))
						{
							this.movingDir = 2;
							this.nextY -= 10;
						}else
							tryUp = false;
					}else
						tryUp = false;
				}
			}
			if (this.movingDir == 1)
			{
				this.x += window.stats.enemySpeed;
			}else
			if (this.movingDir == 3)
			{
				this.x -= window.stats.enemySpeed;
			}else
			if (this.movingDir == 2)
			{
				this.y -= window.stats.enemySpeed;
			}else
			if (this.movingDir == 4)
			{
				this.y += window.stats.enemySpeed;
			}
			
		}
	}
	window.objects.push(enemy);
}