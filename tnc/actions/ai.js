window.makeAI = function(data)
{
	var ai = {};
	ai.x = 0;
	ai.y = 0;
	ai.checkType = function(ty)
	{
		if (ty == 'AI')
			return true;
		return false;
	}
	ai.go = function(data)
	{
		if (window.inGame)
		{
			if (window.trapper.tryFire())
			{
				var x = Math.random()*window.stats.gameWidth;
				var y = Math.random()*window.stats.gameHeight;
				while (true)
				{
					var x = Math.random()*window.stats.gameWidth;
					var y = Math.random()*window.stats.gameHeight;
					var distX = window.guy.x+5 - x;
					var distY = window.guy.y+5 - y;
					if (Math.abs(distX) > 50 ||
						Math.abs(distY) > 50)
					{
						var obj = getHere({x:x, y:y, type:'space'});
						if (obj)
						{
							window.spawnEnemy({x:obj.x, y:obj.y});
							break;
						}
					}
				}
			}
			//obj.beingRemoved = true;
		}
	}
	ai.draw = function(ctx)
	{
		
	}
	window.objects.push(ai);
}