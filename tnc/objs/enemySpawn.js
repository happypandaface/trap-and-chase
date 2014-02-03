window.spawnEnemy = function(data)
{
	var enemySpawn = {};
	enemySpawn.x = data.x;
	enemySpawn.y = data.y;
	if (data.enemyNumber)
		enemySpawn.enemyNumber = data.enemyNumber;
	enemySpawn.checkType = function(str)
	{
		if (str == 'enemySpawn')
			return true;
		return false;
	}
	enemySpawn.spawnTimer = 20;
	enemySpawn.go = function()
	{
		enemySpawn.spawnTimer -= 1;
		if (enemySpawn.spawnTimer <= 0)
		{
			makeEnemy({x:this.x, y:this.y, enemyNumber:this.enemyNumber});
			return true;
		}
	}
	enemySpawn.draw = function(ctx)
	{
		ctx.strokeStyle = '#ff0000';
		ctx.strokeRect(this.x-this.spawnTimer, this.y-this.spawnTimer, this.spawnTimer*2+10, this.spawnTimer*2+10);
	}
	window.objects.push(enemySpawn);
	if (window.socket && !enemySpawn.enemyNumber)
	{
		window.enemyNumber++;
		enemySpawn.enemyNumber = window.enemyNumber;
		window.socket.emit
		(
			'update', 
			{
				name:'enemy', 
				enemyNumber:enemySpawn.enemyNumber,
				x:enemySpawn.x,
				y:enemySpawn.y
			}
		);
	}
	return enemySpawn;
}