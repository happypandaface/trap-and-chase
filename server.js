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
		for (var i in sockets)
		{
			if (sockets[i] != socket)
				if (sockets[i].gameId == socket.gameId)
					sockets[i].emit('friendConnected', data);
		}
	});
	socket.on('update',function(data) {
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