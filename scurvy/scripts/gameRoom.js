window.players = [];
window.gameRoom = $("<div class=dialogue id=gameRoom><div id=link></div></div>");
var linkBox = $('<div>Game Link:<input></input><div>');
window.gameRoom.children('#link').append(linkBox);
window.gotoGameRoom = function()
{
	window.gameElement.children('#ui').empty();
	window.gameRoom.css('position', 'absolute');
	window.gameRoom.css('left', window.WIDTH*.2);
	window.gameRoom.css('top', window.HEIGHT*.2);
	window.gameRoom.css('width', window.WIDTH*.6);
	window.gameRoom.css('height', window.HEIGHT*.6);
	window.gameRoom.css('background-color', '#C40020');
	linkBox.children('input').focus(function() {
		$(this).select();
	});
	window.gameRoom.find('.fightButton').mouseup(function(e)
	{
		window.doAction({type:'fight', from:window.playerId, to:$(this).parent().attr('id')}, true);
	});
	linkBox.children('input').attr('readonly','readonly');
	linkBox.children('input').mouseup(function(e) {
		e.preventDefault();
	});
	linkBox.children('input').attr('value',window.location.href.replace('#','')+'#'+window.gameId);
	window.gameElement.children('#ui').append(window.gameRoom);
}
window.getPlayerById = function(id)
{
	for (var i in window.players)
		if (id == window.players[i].playerId)
			return window.players[i];
}
actions.push({
	type:"gotoGameRoom",
	funct:function(action){
		window.gotoGameRoom();
	}
});
actions.push({
	type:"disconnect",
	funct:function(action){
		for (var i in window.players)
		{
			if (window.players[i].playerId == action.playerId)
			{
				window.players.splice(i, 1);
				break;
			}
		}
		window.gameRoom.children('#'+action.playerId).remove();
	}
});
actions.push({
	type:"joinedGameRoom",
	funct:function(action){
		var alreadyExists = false;
		for (var i in window.players)
		{
			if (window.players[i].playerId == action.playerId)
			{
				alreadyExists = true;
			}
		}
		if (!alreadyExists)
		{
			window.players.push({playerId:action.playerId});
			var div = $('<div id="'+action.playerId+'">player:'+action.playerId+'</div>');
			if (action.playerId != window.playerId)
			{
				var fightButton = $('<button class="pirate fightButton">fight</button>');
				fightButton.mouseup(function()
				{
					window.doAction({type:'fight', from:window.playerId, to:$(this).parent().attr('id')}, true);
				});
				div.append(fightButton);
			}
			window.gameRoom.append(div);
		}
	}
});