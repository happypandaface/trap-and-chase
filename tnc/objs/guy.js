window.spawnGuy = function(data)
{
	var guy = {};
	guy.z = 5;
	guy.x = data.x;
	guy.y = data.y;
	guy.nextX = data.x;
	guy.nextY = data.y;
	guy.dir = 0;
	guy.width = 10;
	guy.height = 10;
	guy.jumpTimerMax = 10;
	guy.jumpTimer = 0;
	guy.jumpCooldownMax = 40;
	guy.jumpCooldown = 0;
	guy.movingDir = 0;
	guy.checkType = function(type)
	{
		if (type == 'guy')
			return true;
		return false;
	}
	guy.sendsData = data.sendsData;
	guy.go = function()
	{
		if (window.inGame)
		{
			this.rightObj = false;
			this.leftObj = false;
			this.upObj = false;
			this.downObj = false;
			this.sendData = false;
			if (this.movingDir == 0 ||
				this.movingDir == 1 && this.x >= this.nextX ||
				this.movingDir == 3 && this.x <= this.nextX ||
				this.movingDir == 4 && this.y >= this.nextY ||
				this.movingDir == 2 && this.y <= this.nextY)
			{
				this.goo = false;
				this.x = tilize(this.x);
				this.y = tilize(this.y);
				this.movingDir = 0;
				var tryDown = true;
				var tryUp = true;
				var tryRight = true;
				var tryLeft = true;
				if (!window.isHost)// this is where the guy is controlled
				{
					if (window.keysDown.right)
					{
						if (!this.jumping)
						{
							this.rightObj = getRightHere({x:this.nextX+10, y:this.nextY, type:'table'});
							this.goo = getRightHere({x:this.nextX+10, y:this.nextY, type:'goo'});
						}
						if (!this.rightObj && getRightHere({x:this.nextX+10, y:this.nextY, type:'space'}))
						{
							this.movingDir = 1;
							this.nextX += 10;
							this.sendData = true;
						}
					}else if (window.keysDown.left)
					{
						if (!this.jumping)
						{
							this.leftObj = getRightHere({x:this.nextX-10, y:this.nextY, type:'table'});
							this.goo = getRightHere({x:this.nextX-10, y:this.nextY, type:'goo'});
						}
						if (!this.leftObj && getRightHere({x:this.nextX-10, y:this.nextY, type:'space'}))
						{
							this.movingDir = 3;
							this.nextX -= 10;
							this.sendData = true;
						}
					}else if (window.keysDown.down)
					{
						if (!this.jumping)
						{
							this.downObj = getRightHere({x:this.nextX, y:this.nextY+10, type:'table'});
							this.goo = getRightHere({x:this.nextX, y:this.nextY+10, type:'goo'});
						}
						if (!this.downObj && getRightHere({x:this.nextX, y:this.nextY+10, type:'space'}))
						{
							this.movingDir = 4;
							this.nextY += 10;
							this.sendData = true;
						}
					}else if (window.keysDown.up)
					{
						if (!this.jumping)
						{
							this.upObj = getRightHere({x:this.nextX, y:this.nextY-10, type:'table'});
							this.goo = getRightHere({x:this.nextX, y:this.nextY-10, type:'goo'});
						}
						if (!this.upObj && getRightHere({x:this.nextX, y:this.nextY-10, type:'space'}))
						{
							this.movingDir = 2;
							this.nextY -= 10;
							this.sendData = true;
						}
					}
				}
			}
			if (this.movingDir == 1)
			{
				this.x += this.goo?window.stats.gooSpeed:window.stats.guySpeed;
			}else
			if (this.movingDir == 3)
			{
				this.x -= this.goo?window.stats.gooSpeed:window.stats.guySpeed;
			}else
			if (this.movingDir == 2)
			{
				this.y -= this.goo?window.stats.gooSpeed:window.stats.guySpeed;
			}else
			if (this.movingDir == 4)
			{
				this.y += this.goo?window.stats.gooSpeed:window.stats.guySpeed;
			}
			if (window.keysDown.action && !window.stickyAction)
			{
				window.stickyAction = true;
				if (window.keysDown.down && this.downObj)
				{
					this.downObj.activate('down');
				}else
				if (window.keysDown.left && this.leftObj)
				{
					this.leftObj.activate('left');
				}else
				if (window.keysDown.right && this.rightObj)
				{
					this.rightObj.activate('right');
				}else
				if (window.keysDown.up && this.upObj)
				{
					this.upObj.activate('up');
				}
			}
			if (!window.keysDown.action)
				window.stickyAction = false;
			if (this.jumpTimer == 0)
			{
				this.jumping = false;
				if (window.keysDown.fire && this.jumpCooldown <= 0)
				{
					this.jumped();
				}else
				if (window.gunCooldown == 0)
				{
					if (window.keysDown.up2)
					{
						window.gunCooldown = window.gunCooldownMax;
						makeBullet({x:this.x+2.5, y:this.y+2.5, dir:-90});
					}else 
					if (window.keysDown.down2)
					{
						window.gunCooldown = window.gunCooldownMax;
						makeBullet({x:this.x+2.5, y:this.y+2.5, dir:90});
					}else 
					if (window.keysDown.right2)
					{
						window.gunCooldown = window.gunCooldownMax;
						makeBullet({x:this.x+2.5, y:this.y+2.5, dir:0});
					}else 
					if (window.keysDown.left2)
					{
						window.gunCooldown = window.gunCooldownMax;
						makeBullet({x:this.x+2.5, y:this.y+2.5, dir:180});
					}
				}
			}
			if (window.isClient && (this.sendData || !this.sentJump))
			{
				if (this.jumping && !this.sentJump)
					window.socket.emit('update', {name:'guy', x:this.x, y:this.y, nextX:this.nextX, nextY:this.nextY, movingDir:this.movingDir, jumped:true});
				else
					window.socket.emit('update', {name:'guy', x:this.x, y:this.y, nextX:this.nextX, nextY:this.nextY, movingDir:this.movingDir});
				this.sendData = false;
				this.sentJump = true;
			}
		}
		if (this.jumpTimer > 0)
		{
			this.jumpTimer--;
		}
		if (this.jumpCooldown > 0)
		{
			this.jumpCooldown--;
		}
		if (window.gunCooldown > 0)
		{
			window.gunCooldown--;
		}
		if (this.jumpTimer == 0)
		{
			this.jumping = false;
		}
		var butt = getRightHere({x:this.x, y:this.y, type:'button'});
		if (butt)
			butt.activate();
	}
	guy.jumped = function()
	{
		this.jumpCooldown = this.jumpCooldownMax;
		this.jumping = true;
		this.jumpTimer = this.jumpTimerMax;
		this.sentJump = false;
	}
	guy.draw = function(ctx)
	{
		var drawX = this.x;
		var drawY = this.y;
		if (this.jumping)
		{
			ctx.fillStyle = '#999999';
			var jumpHeight = (-2*Math.pow(this.jumpTimer/this.jumpTimerMax-.5,2)+1);
			ctx.fillRect(this.x+jumpHeight*2, this.y+jumpHeight*2, 10, 10);
			drawY -= jumpHeight*10;
		}
		if (window.gunCooldown > 0)
		{
			ctx.fillStyle = '#0000ff';
			var percent = window.gunCooldown/window.gunCooldownMax;
			ctx.fillRect(drawX+(1-percent)*5, drawY-2, window.gunCooldown/window.gunCooldownMax*10, 2);
		}
		if (this.jumpCooldown > 0)
		{
			ctx.fillStyle = '#00ff00';
			var percent = this.jumpCooldown/this.jumpCooldownMax;
			ctx.fillRect(drawX+(1-percent)*5, drawY+this.height, this.jumpCooldown/this.jumpCooldownMax*10, 2);
		}
		ctx.fillStyle = '#ffff00';
		ctx.fillRect(drawX, drawY, 10, 10);
		ctx.strokeStyle = '#0000ff';
		ctx.strokeRect(this.x-45, this.y-45, 100, 100);
	}
	window.objects.push(guy);
	return guy;
}