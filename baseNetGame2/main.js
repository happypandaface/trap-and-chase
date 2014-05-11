function switchMenu(id)
{
	document.getElementById("loginInterface").style.display = 'none';
	document.getElementById("startInterface").style.display = 'none';
	document.getElementById("inRoomInterface").style.display = 'none';
	document.getElementById("chatInterface").style.display = 'none';
	document.getElementById(id).style.display = 'inline';
	if (id == "inRoomInterface")
		document.getElementById("chatInterface").style.display = 'inline';
}
function endGame(msg)
{
	switchMenu('startInterface');
	clearPlayers();
	document.getElementById("msg").innerHTML = "Game was ended!";
}
function addChat(plr, msg)
{
	document.getElementById("chatBox").value += "["+plr.playerId+"]: "+msg+"\n";
}
function clearPlayers()
{
	while (window.gameObj.players.length > 0)
	{
		removePlayer(window.gameObj.players[0].playerId);
	}
}
function removePlayer(id)
{
	// REMOVE IT FROM THE interface first (sorry for yelling)
	var select = document.getElementById("playerList");
	for (var p in window.gameObj.players)
	{
		var plr = window.gameObj.players[p];
		if (plr.playerId == id)
		{
			window.gameObj.players.splice(p, 1);
			select.remove(p);
			break;
		}
	}
	document.getElementById("numPlayers").innerHTML = ""+window.gameObj.players.length;
}
function addPlayer(plr)
{
	alreadyHere = false;
	for (var p in window.gameObj.players)
	{
		var cur = window.gameObj.players[p];
		if (cur.playerId == plr.playerId)
			alreadyHere = true;
	}
	if (!alreadyHere)
	{
		window.gameObj.players.push(plr);
		var select = document.getElementById("playerList");
		var option = document.createElement("option");
		option.text = plr.name?plr.name:plr.playerId;
		select.add(option);
		document.getElementById("numPlayers").innerHTML = ""+window.gameObj.players.length;
	}
}
function loaded()
{
	window.gameObj = {players:[],games:[]};
	connect();
	window.gameObj.network.setListener('started', function(e)
	{
		window.gameObj.player = {playerId:e.id};
		document.getElementById("msg").innerHTML = "Connected!";
		var loadElems = document.getElementsByClassName("notLoaded");
		for(var i = 0; i < loadElems.length; i++)
		{
		   loadElems[i].style.display = 'inline';
		}
		switchMenu('loginInterface');
		//switchMenu('startInterface');
		window.gameObj.network.send('getGames', {gameName:'clickUponDots'});
	});
	window.gameObj.network.setListener('gotGames', function(e)
	{
		var select = document.getElementById("gamesList");
		var length = select.options.length;
		for (i = 0; i < length; i++) {
			select.options[i] = null;
		}
		window.gameObj.games.length = 0;
		for (i = 0; i < e.games.length; i++) {
			var option = document.createElement("option");
			window.gameObj.games.push(e.games[i]);
			option.text = e.games[i].name?e.games[i].name:e.games[i].playerId;
			select.add(option);
		}
	});
	window.gameObj.network.setListener('update', function(e)
	{
		if (e.action == 'addPlayers')
			for (var i in e.players)
				addPlayer(e.players[i]);
		if (e.action == 'setPlayers')
		{
			clearPlayers();
			for (var i in e.players)
				addPlayer(e.players[i]);
		}
		if (e.action == 'chat')
		{
			addChat(e, e.msg);
		}
	});
	window.gameObj.network.setListener('friendConnected', function(e)
	{
		addPlayer(e);
		window.gameObj.network.send('update', {action:'addPlayers', players:window.gameObj.players});
	});
	window.gameObj.network.setListener('disconnect', function(e)
	{
		if (e.socketId == window.gameObj.gameId)
		{
			endGame();
		}else
		{
			removePlayer(e.socketId);
			window.gameObj.network.send('update', {action:'setPlayers', players:window.gameObj.players});
		}
	});
	document.getElementById("loginName").addEventListener('keypress', function(e)
	{
		if (e.which == 13)
			document.getElementById("loginBut").click();
	});
	document.getElementById("loginBut").addEventListener('click', function(e)
	{
		var nme = document.getElementById("loginName").value;
		window.gameObj.player.name = nme;
		window.gameObj.network.send('setName', {name:nme});
		switchMenu("startInterface");
	});
	document.getElementById("chatText").addEventListener('keypress', function(e)
	{
		if (e.which == 13)
			document.getElementById("chatSend").click();
	});
	document.getElementById("chatSend").addEventListener('click', function(e)
	{
		var msg = document.getElementById("chatText").value;
		document.getElementById("chatText").value = "";
		addChat(window.gameObj.player, msg);
		window.gameObj.network.send('update', {action:'chat', msg:msg});
	});
	document.getElementById("makeGame").addEventListener('click', function(e)
	{
		switchMenu('inRoomInterface');
		addPlayer(window.gameObj.player);
		window.gameObj.network.send('nameGame', {gameName:'clickUponDots'});
		document.getElementById("msg").innerHTML = "Youre the host!";
	});
	document.getElementById("refreshGames").addEventListener('click', function(e)
	{
		window.gameObj.network.send('getGames', {gameName:'clickUponDots'});
	});
	document.getElementById("joinGame").addEventListener('click', function(e)
	{
		var e = document.getElementById("gamesList");
		//var strUser = e.options[e.selectedIndex].value;
		var game = window.gameObj.games[e.selectedIndex];
		window.gameObj.gameId = game.id;
		window.gameObj.network.send('gameConnect', {id:game.id});
		switchMenu('inRoomInterface');
		document.getElementById("msg").innerHTML = "Joined game!";
	});
}
window.onload = loaded;