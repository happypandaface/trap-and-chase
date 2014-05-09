function connect()
{
	window.gameObj.socket = io.connect('ws://'+window.location.host);
	window.gameObj.network = 
	{
		setListener:function(id, funct)
		{
			window.gameObj.socket.on(id, funct);
		},
		send:function(id, data)
		{
			window.gameObj.socket.emit(id, data);
		}
	}
}