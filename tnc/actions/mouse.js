$('#container').mousemove(function(e)
{
	if (window.highlighted)
		window.highlighted.highlighted = false;
	window.highlighted = getHere({x:e.offsetX, y: e.offsetY, type:'space'});
	window.highlighted.highlighted = true;
});
$('#container').mouseup(function(e)
{
	if (window.inGame && !window.isClient)
	{
		if (e.which == 1)
		{
			if (window.selectedWeapon == 'robot')
			{
				var distX = window.guy.x+5 - e.offsetX;
				var distY = window.guy.y+5 - e.offsetY;
				if (Math.abs(distX) > 50 ||
					Math.abs(distY) > 50)
				{
					var obj = getHere({x:e.offsetX, y: e.offsetY, type:'space'});
					if (obj)
						if (window.trapper.tryFire())
							window.spawnEnemy({x:obj.x, y:obj.y});
				}
			}else
			{
				var distX = window.guy.x+5 - e.offsetX;
				var distY = window.guy.y+5 - e.offsetY;
				if (Math.abs(distX) > 50 ||
					Math.abs(distY) > 50)
				{
					var obj = getHere({x:e.offsetX, y: e.offsetY, type:'space'});
					if (obj)
						if (window.trapper.tryGoo())
							window.spawnGoo({x:obj.x, y:obj.y});
				}
			}
		}else if (e.which == 3)
		{
			if (window.selectedWeapon == 'robot')
				selectWeapon({weapon:'goo'});
			else
				selectWeapon({weapon:'robot'});
		}
		//obj.beingRemoved = true;
	}
});
$('#container').bind('contextmenu', function(e) {
	return false;
});