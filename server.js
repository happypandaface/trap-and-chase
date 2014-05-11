var express = require("express");
//var http = require('http');
//var app = express();
var application = express();//.createServer();

//var server = http.createServer(app).listen(app.get('port'));
application.use(express.static(__dirname + '/'));
var io;
if (process.env.app_port)
	io = require('socket.io').listen(application.listen(process.env.app_port));
else
	io = require('socket.io').listen(application.listen(1235));

//app.use("/", express.static(__dirname + '/'));
var sockets = [];

noOneHasConnected = true;

makeid = function()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(var i=0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
IDs = [];

io.sockets.on('connection', function (socket) {
	noOneHasConnected = false;
	sockets.push(socket);
	socket.gameId = makeid();
	socket.socketId = socket.gameId;
	// make a new id
	socket.emit('started', { id:socket.gameId});
	/*
	socket.on('my other event', function (data) {
		socket.emit('news', { hello: 'world' });
	});*/
	socket.on('gameConnect',function(data) {
		if (data.id)
			socket.gameId = data.id;
		data.playerId = socket.socketId;
		data.name = socket.playerName;
		for (var i in sockets)
		{
			if (sockets[i] != socket)
				if (sockets[i].socketId == socket.gameId)
					sockets[i].emit('friendConnected', data);
		}
	});
	socket.on('setName',function(data) {
		if (data.name) // && TODO: check for duplicates)
			socket.playerName = data.name;
	});
	socket.on('nameGame',function(data) {
		if (data.gameName)
			socket.gameName = data.gameName;
	});
	socket.on('getGames',function(data) {
		rtnData = {games:[]};
		if (data.gameName)
		{
			for (var i in sockets)
			{
				if (sockets[i] != socket)
					if (sockets[i].gameName == data.gameName)
						rtnData.games.push({id:sockets[i].gameId, name:sockets[i].playerName});
			}
		}else
		{
			rtnData.errmsg = "no game name specified";
		}
		socket.emit('gotGames', rtnData);
	});
	socket.on('update',function(data) {
		data.playerId = socket.socketId;
		data.name = socket.playerName;
		for (var i in sockets)
		{
			if (sockets[i] != socket)
				if (sockets[i].gameId == socket.gameId)
					sockets[i].emit('update', data);
		}
	});
	
	socket.on('disconnect',function() {
		for (var i in sockets)
		{
			if (sockets[i] != socket)
				if (sockets[i].gameId == socket.gameId)
					sockets[i].emit('disconnect', {socketId:socket.socketId});
		}
		for (var i in sockets)
		{
			if (sockets[i] == socket)
				sockets.splice(i, 1);
		}
	});
});
/*
setTimeout(function()
{
	if (noOneHasConnected)
	{
		console.log('no connection in 5 seconds, server closed');
		io.server.close();
	}
}, 10000);*/