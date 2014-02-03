window.makePaths = function(rooms)
{
	for (var i in rooms)
	{
		for (var c in rooms)
		{
			if (i != c)
			{
				/* the following algorithm is very complicated,
				 * I definitely gave it my all on this one
				 * hopefull I can explain it so that you can modify it.
				 * These first 4 variables determine where the checked
				 * box is relative to the current one (current one is rooms[i]).
				 * distX1 is the distance from the checked box's origin
				 * to the current box's far edge (signed).
				 * distX2 is the distance from the check box's far edge
				 * to the current box's origin (signed).
				 * These are relative to the horizontal, and distY1 and 
				 * distY2 are relative to the vertical, but they're basically the same
				 * thing.
				 * The first if statement checks if the other box is horizontal to the
				 * current box.
				 * This check works because if the checked box is below the current, then
				 * both distY1 and distY2 will be negative.
				 * If the checked box is above the current then both distY1 and distY2 will
				 * be positive.
				 * the case where (distY1 < 0 && distY2 > 0) never occurs because the bottom of 
				 * the checked box is always bigger than the origin of that box, this means
				 * distY1 is always bigger than distY2
				 * The second checks to see if the second box is to the right of the current.
				 * if it isn't, don't do anything, because the other box will make the path.
				 * if we did something when the box wasn't to the right of the current(left)
				 * then we'd end up with duplicate paths since every room is extending
				 * right and left
				 * After that we calculate the greatest possible y value for starting the path
				 * is could either be the farthest point of the checked box, or the farthest
				 * point of the current box.
				 * Then we calculate the minimum y value for the start of the path. It could 
				 * either be the start of the checked box or the start of the current box.
				 */
				var distX1 = rooms[i].x + rooms[i].width - rooms[c].x;
				var distX2 = rooms[i].x - (rooms[c].x + rooms[c].width);
				var distY1 = rooms[i].y + rooms[i].height - rooms[c].y;
				var distY2 = rooms[i].y - (rooms[c].y + rooms[c].height);
				if (distY1 > 0 && distY2 < 0)
				{// the other box is horizonal to the current
					if (distX1 < 0 && distX2 < 0)
					{// the other box is to the right of the current
						var yMax = rooms[i].y-distY2-10;// first possible xMax
						var yMax2 = rooms[i].y+rooms[i].height-10;// second possible xMax
						if (yMax2 < yMax)// we want the smaller one
							yMax = yMax2;
						var yMin = rooms[i].y+rooms[i].height-distY1;
						var yMin2 = rooms[i].y;
						if (yMin2 > yMin)
							yMin = yMin2;
						var randY = yMin+Math.ceil(Math.random()*(yMax-yMin)/10)*10;
						var blocks = getPassage({
							x:rooms[i].x+rooms[i].width, 
							y:randY, 
							dir:'right', remove:true,
							len:Math.abs(distX1/10)});
						for (var p in blocks)
						{
							if (!collides({x:blocks[p].x, y:blocks[p].y, type:'space'}))
								makeSpace(blocks[p]);
						}
					}else
					{// the box is to the left of the current one
						// this case will be covered by the box that is to the right
					}
				}else
				if (distX1 > 0 && distX2 < 0)// this is default true because boxes never intersect
				{// this means the other box is vertical to the current one
					if (Math.abs(distY1) < Math.abs(distY2))
					{// the other box is below the current one
						var xMax = rooms[i].x-distX2-10;
						var xMax2 = rooms[i].x+rooms[i].width-10;
						if (xMax2 < xMax)
							xMax = xMax2;
						var xMin = rooms[i].x+rooms[i].width-distX1;
						var xMin2 = rooms[i].x;
						if (xMin2 > xMin)
							xMin = xMin2;
						var randX = xMin+Math.ceil(Math.random()*(xMax-xMin)/10)*10;
						var blocks = getPassage({
							x:randX, 
							y:rooms[i].y+rooms[i].height, 
							dir:'down', remove:true,
							len:Math.abs(distY1/10)});
						for (var p in blocks)
						{
							if (!collides({x:blocks[p].x, y:blocks[p].y, type:'space'}))
								makeSpace(blocks[p]);
						}
					}else
					{// the box is above the current one
						// this case will be covered by the box that is below
					}
				}
			}
		}
	}
}
window.removeBlockAt = function(data)
{
	for (var i = window.objects.length-1; i >= 0; i--)
	{
		if (window.objects[i].x == data.x &&
			window.objects[i].y == data.y)
		{
			window.objects.splice(i, 1);
		}
	}
}
window.getPassage = function(data)//({x:20, y:20, dir:'right', len:5});
{
	var blocks = [];
	var numBlks = 0;
	var x = data.x;
	var y = data.y;
	while  (numBlks < data.len)
	{
		numBlks++;
		blocks.push({x:x, y:y});
		blocks.push({x:x, y:y});
		if (data.dir == 'right')
			x += 10;
		else if (data.dir == 'left')
			x -= 10;
		else if (data.dir == 'up')
			y -= 10;
		else if (data.dir == 'down')
			y += 10;
	}
	return blocks;
}
window.makeLevel = function(data)
{
	//spawnEnemy({x:50, y:70});
	numberOfRooms = 0;
	var rooms = [];
	var iterations = 0;
	while (numberOfRooms < 5 && iterations < 100)
	{
		iterations++;
		window.minWidth = 70;
		window.minHeight = 50;
		window.maxWidth = 180;
		window.maxHeight = 120;
		var x = 10*Math.ceil(Math.random()*(window.stats.gameWidth/10-window.maxWidth/10));
		var y = 10*Math.ceil(Math.random()*(window.stats.gameHeight/10-window.maxHeight/10));
		var width = minWidth+Math.ceil(Math.random()*minWidth/10)*10;
		var height = minHeight+Math.ceil(Math.random()*minHeight/10)*10;
		var roomData = {x:x, y:y, width:width, height:height};
		var intersectsRoom = false;
		for (var i in rooms)
		{
			var distX1 = rooms[i].x + rooms[i].width - roomData.x;
			var distX2 = rooms[i].x - roomData.x - roomData.width;
			var distY1 = rooms[i].y + rooms[i].height - roomData.y;
			var distY2 = rooms[i].y - roomData.y - roomData.height;
			if (distY1 > 0 && distY2 < 0 && distX1 > 0 && distX2 < 0)
			{
				intersectsRoom = true;
				break;
			}
		}
		if (!intersectsRoom)
		{
			numberOfRooms++;
			rooms.push(roomData);
			var blocks = getRoom(roomData);
			for (var i in blocks)
			{
				if (!collides({x:blocks[i].x, y:blocks[i].y, type:'space'}))
					makeSpace(blocks[i]);
			}
		}
	}
	// spawn stuff
	var guyRoom = rooms[Math.floor(Math.random()*rooms.length)];
	var endRoom = rooms[Math.floor(Math.random()*rooms.length)];
	while (guyRoom == endRoom)
	{
		var endRoom = rooms[Math.floor(Math.random()*rooms.length)];
	}
	var guyData = window.spawnRandom(guyRoom);
	if (data.host)
		guyData.cantControl = true;
	if (data.client)
		guyData.sendsData = true;
	window.guy = window.spawnGuy(guyData);
	// var table = window.spawnTable(window.spawnRandom(endRoom));
	// window.box = table;
	for (var i=0; i<rooms.length; i++)
	{
		var floorbutton = window.spawnRandom(rooms[i]);

		// floorbutton = window.spawnRandom(endRoom);
		window.spawnFloorButton(floorbutton);			
	}
	window.trapper = window.makeTrapper();
	window.makePaths(rooms);
}
window.spawnRandom = function(room)
{
	return {x:room.x+10+Math.floor(Math.random()*(room.width/10-2))*10, y:room.y+10+Math.floor(Math.random()*(room.height/10-2))*10};
}