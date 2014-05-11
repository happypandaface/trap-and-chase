function initGame()
{
	window.gameObj.width = 640;
	window.gameObj.height = 480;
	window.gameObj.gObjs = [];
	window.gameObj.dotRadius = 15;
	var canvas = document.getElementById("container");
	canvas.width = window.gameObj.width;
	canvas.height = window.gameObj.height;
	canvas.addEventListener("mouseup", function(e)
	{
		var canvas = document.getElementById("container");
		var rect = canvas.getBoundingClientRect();
		var mousePos = {x:e.clientX-rect.left, y:e.clientY-rect.top};
		console.log(mousePos);
		for (var i in window.gameObj.gObjs)
		{
			var obj = window.gameObj.gObjs[i];
			var dist = calcDist(mousePos, obj);
			if (dist < window.gameObj.dotRadius)
			{
				removeDot(i, window.gameObj.player.playerId);
				window.gameObj.network.send('update', {action:'removeDot', num:i});
			}
		}
	});
	window.gameObj.network.setListener('update', function(e)
	{
		if (e.action == 'removeDot')
			removeDot(e.num, e.playerId);
	});
}
function getPlayer(id)
{
	for (var p in window.gameObj.players)
	{
		if (window.gameObj.players[p].playerId == id)
			return window.gameObj.players[p];
	}
}
function addPoints(plr, num)
{
	if (!plr.points)
		plr.points = 0;
	plr.points++;
}
function setPoints(plr, num)
{
	plr.points = num;
}
function getPoints(plr)
{
	return plr.points;
}
function removeDot(num, playerId)
{
	window.gameObj.gObjs[num].active = false;
	addPoints(getPlayer(playerId), 1);
	var stillGoing = false;
	for (var i in window.gameObj.gObjs)
	{
		if (window.gameObj.gObjs[i].active)
		{
			console.log("hey");
			stillGoing = true;
			break;
		}
	}
	if (!stillGoing)
	{
		var ptsStr = "";
		for (var p in window.gameObj.players)
		{
			var plr = window.gameObj.players[p];
			ptsStr += "("+getName(plr)+": "+getPoints(plr)+"pts) ";
		}
		addChat({playerId:'game'}, "game ended, results: "+ptsStr, true);
		switchMenu("inRoomInterface");
	}
}
function gameLogic(delta)
{
	window.gameObj.totalTime += delta;
	//if (window.gameObj.totalTime > 1000 && window.gameObj.gObjs.length == 0)
	//	window.gameObj.gObjs.push({x:100, y:100});
}
function draw()
{
	requestAnimationFrame(draw);
	var now = new Date().getTime();
	if (!window.gameObj.lastTime)
		window.gameObj.lastTime = new Date().getTime();
	var delta = now - window.gameObj.lastTime;
	if (delta > 100)
		delta = 100;
	window.gameObj.lastTime = now;
	gameLogic(delta);
	var ctx = document.getElementById("container").getContext("2d");
	ctx.clearRect(0, 0, window.gameObj.width, window.gameObj.height);
	ctx.strokeStyle = "000000";
	ctx.strokeRect(0, 0, window.gameObj.width, window.gameObj.height);
	
	ctx.fillStyle = "ff0000";
	for (var i in window.gameObj.gObjs)
	{
		var obj = window.gameObj.gObjs[i];
		if (obj.active)
		{
			ctx.beginPath();
			ctx.arc(obj.x, obj.y, window.gameObj.dotRadius, 0, 2 * Math.PI, false);
			ctx.fill();
		}
	}
}
function startGame(seed)
{
	window.gameObj.lastTime = new Date().getTime();
	window.gameObj.totalTime = 0;
	window.gameObj.gObjs = [];
	for (var p in window.gameObj.players)
	{
		setPoints(getPlayer(window.gameObj.players[p].playerId), 0);
	}
	
	//lvl gen
	Math.seedrandom(seed);
	var numDots = 10+Math.random()*10;
	while(numDots > 0)
	{
		numDots--;
		window.gameObj.gObjs.push({
			active:true, 
			x:Math.random()*window.gameObj.width,
			y:Math.random()*window.gameObj.height
		});
	}
	
	draw();
}