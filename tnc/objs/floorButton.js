window.spawnFloorButton = function(data)
{
	var button = {};
	button.z = 1.5;
	button.x = data.x;
	button.y = data.y;
	button.width = 10;
	button.height = 10;
	button.checkType = function(str)
	{
		if (str == 'button')
			return true;
		return false;
	}
	button.activate = function(thing)
	{
		this.beingRemoved = true;
		
		// if (window.inGame && window.isClient)
		// {
		// 	window.endGame({result:'win'});
		// }else if (window.localGame)
		// {
		// 	window.endLocalGame({winner:'chaser'});
		// }
	}
	button.draw = function(ctx)
	{
		ctx.fillStyle = "#77aaff";
		ctx.fillRect(this.x, this.y, 10, 10);
	}
	button.go = function()
	{
		if (this.beingRemoved)
			return true;
	}
	window.objects.push(button);
	return button;
}