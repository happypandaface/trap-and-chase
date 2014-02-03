window.startServer = function()
{
	window.inGame = false;
	window.socket = io.connect('ws://'+window.location.host);
	window.socket.on('started', function(e)
	{
		window.gameID = e.id;
		$('div.server').html('Server up!');
		window.popup({text:"Share this link with a friend!", selection:window.location.host+window.location.pathname+'#'+window.gameID});
	});
	window.socket.on('friendConnected', function(e)
	{
		socket.emit('gameConnect', {id:window.location.hash});
		window.unpopup();
		window.objects = [];
		window.startGame({host:true,socket:socket});
	});
	setupSocketUpdate();
	
	// set the text to 'loading'
	$('div.server').html('Starting Server...');
}
window.beClient = function()
{
	$('div.server').remove();
	window.gameID = window.location.hash.substring(1);
	window.location.hash = "";
	window.popup({text:"Connecting to game...", button:'stop',buttonFunction:window.normalStart});
	window.socket = io.connect('ws://'+window.location.host);
	window.socket.emit('gameConnect', {id:window.gameID});
	window.socket.on('friendConnected', function(e)
	{
		window.unpopup();
		window.startGame({client:true,socket:socket});
	});
	setupSocketUpdate();
}
window.setupSocketUpdate = function(data)
{
	window.socket.on('update', function(e)
	{
		if (e.name == 'guy')
		{
			window.guy.x = e.x;
			window.guy.y = e.y;
			window.guy.nextX = e.nextX;
			window.guy.nextY = e.nextY;
			window.guy.movingDir = e.movingDir;
			if (e.jumped)
				window.guy.jumped();
		}else if (e.name == 'box')
		{
			window.box.x = e.x;
			window.box.y = e.y;
			window.box.activate();
		}else if (e.name == 'win')
		{
			window.endGame({result:'win'});
		}else if (e.name == 'lose')
		{
			window.endGame({result:'lose'});
		}else if (e.name == 'ready')
		{
			window.opponentReady = true;
			if (window.youReady)
				window.startGame({client:!window.isClient,host:!window.isHost});
		}else if (e.name == 'enemy')
		{
			if (e.action == 'remove')
			{
				for (var i in window.objects)
				{
					if (window.objects[i].checkType('enemy') &&
						window.objects[i].enemyNumber == e.num)
					{
						window.objects.splice(i, 1);
						break;
					}
				}
			}else
			{
				spawnEnemy(e);
			}
		}else
		if (e.name == 'bullet')
		{
			makeBullet(e);
		}else
		if (e.name == 'goo')
		{
			spawnGoo(e);
		}
	});
}
window.continueGame = function(data)
{
	if (window.opponentReady)
	{
		window.startGame({client:!window.isClient,host:!window.isHost});
	}else
	{
		modpopup({button:'Waiting...', buttonOff:true});
		window.youReady = true;
	}
	window.socket.emit('update', {name:'ready'});
}
window.startGame = function(data)
{
	window.isClient = data.client;
	window.isHost = data.host;
	$('div.server').remove();
	$('div.weapons').empty();
	if (window.isHost)
		window.makeWeaponsGUI();
	window.localGame = false;
	window.unpopup();
	window.enemyNumber = 0;
	window.gooNumber = 0;
	window.objects = [];
	if (data.host)
		window.popup({text:'You are the trapper!', bigText:"3"});
	else if (data.client)
		window.popup({text:'You are the chaser!', bigText:"3"});
	setTimeout(function()
	{
		window.setBigPopupText({text:'2'});
		setTimeout(function()
		{
			window.setBigPopupText({text:'1'});
			setTimeout(function()
			{
				window.inGame = true;
				window.unpopup();
				window.levelIterations++;
				Math.seedrandom(window.gameID+window.levelIterations);
				window.objects = [];
				window.makeLevel({difficulty:1,host:data.host,client:data.client,socket:data.socket});
				clearTimeout(window.currentTimeout);
				window.currentTimeout = setTimeout(window.drawLoop, 100);
			}, 1000);
		}, 1000);
	}, 1000);
}
window.endGame = function(data)
{
	window.opponentReady = false;
	window.youReady = false;
	window.inGame = false;
	if (data.result == 'lose')
	{
		window.popup({text:'you lose',button:'Swap Roles',buttonFunction:window.continueGame});
		if (window.isClient)
			window.socket.emit('update', {name:'win'});
	}else
	if (data.result == 'win')
	{
		window.popup({text:'you win',button:'Swap Roles',buttonFunction:window.continueGame});
		if (window.isClient)
			window.socket.emit('update', {name:'lose'});
	}
}
window.normalStart = function()
{
	window.localGame = true;
	window.objects = [];
	window.location.hash = "";
	window.unpopup();
	window.makeLevel({difficulty:1});
	clearTimeout(window.currentTimeout);
	if (window.doingAI)
		makeAI();
	window.currentTimeout = setTimeout(window.drawLoop, 100);
	window.inGame = true;
}
window.endLocalGame = function(data)
{
	window.inGame = false;
	if (data.winner == 'chaser')
		window.popup({text:'chaser wins!', button:'play again', buttonFunction:window.normalStart});
	if (data.winner == 'trapper')
		window.popup({text:'trapper wins!', button:'play again', buttonFunction:window.normalStart});
}