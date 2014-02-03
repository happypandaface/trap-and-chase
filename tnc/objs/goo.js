window.spawnGoo = function(data)
{
	var gooSpawn = {};
	gooSpawn.x = data.x;
	gooSpawn.y = data.y;
	if (data.gooNumber)
		gooSpawn.gooNumber = data.gooNumber;
	gooSpawn.checkType = function(str)
	{
		if (str == 'gooSpawn')
			return true;
		return false;
	}
	gooSpawn.spawnTimer = 20;
	gooSpawn.go = function()
	{
		gooSpawn.spawnTimer -= 1;
		if (gooSpawn.spawnTimer <= 0)
		{
			makeGoo({x:this.x, y:this.y, gooNumber:this.gooNumber});
			return true;
		}
	}
	gooSpawn.draw = function(ctx)
	{
		ctx.strokeStyle = '#00ff00';
		ctx.strokeRect(this.x-this.spawnTimer, this.y-this.spawnTimer, this.spawnTimer*2+10, this.spawnTimer*2+10);
	}
	window.objects.push(gooSpawn);
	if (window.socket && !gooSpawn.gooNumber)
	{
		window.gooNumber++;
		gooSpawn.gooNumber = window.gooNumber;
		window.socket.emit
		(
			'update', 
			{
				name:'goo', 
				gooNumber:gooSpawn.gooNumber,
				x:gooSpawn.x,
				y:gooSpawn.y
			}
		);
	}
	return gooSpawn;
}