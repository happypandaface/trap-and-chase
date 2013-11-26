window.players = [];
window.gameRoom = $("<div class=dialogue id=gameRoom><div id=link></div></div>");
var linkBox = $('<div>Game Link:<input></input><div>');
window.gameRoom.children('#link').append(linkBox);
var fightButton = $('<button id=mutiny class="pirate fightButton">Everyone fight!</button>');
var fightButtonBeach = $('<button id=beachFight class="pirate fightButton">Raid a village!</button>');
window.gameRoom.append(fightButton);
window.gameRoom.append(fightButtonBeach);
window.gotoGameRoom = function()
{
	if (window.currentRoom != "gameRoom")
	{
		window.getNPF("gotoCurrentRoom").roomFunctionName = "gotoGameRoom";
		window.currentRoom = "gameRoom";
		window.gameElement.children('#ui').empty();
		window.gameRoom.css('position', 'absolute');
		window.gameRoom.css('left', window.WIDTH*.2);
		window.gameRoom.css('top', window.HEIGHT*.2);
		window.gameRoom.css('width', window.WIDTH*.6);
		window.gameRoom.css('height', window.HEIGHT*.6);
		window.gameRoom.css('background-color', '#C40020');
		linkBox.children('input').mouseup(function() {
			$(this).select();
		});
		linkBox.children('input').attr('readonly','readonly');
		linkBox.children('input').css('width',250);
		linkBox.children('input').mouseup(function(e) {
			e.preventDefault();
		});
		var fightButton = window.gameRoom.children('#mutiny');
		fightButton.css('position', 'absolute');
		fightButton.css('bottom', '0px');
		fightButton.css('left', '0px');
		fightButton.mouseup(function()
		{
			window.doAction({type:'fight', place:"ship", from:window.playerId}, true);
		});
		var fightButtonBeach = window.gameRoom.children('#beachFight');
		fightButtonBeach.css('position', 'absolute');
		fightButtonBeach.css('bottom', '0px');
		fightButtonBeach.css('right', '0px');
		fightButtonBeach.mouseup(function()
		{
			window.doAction({type:'fight', place:"beach", from:window.playerId}, true);
		});
		linkBox.children('input').attr('value',window.location.href.replace('#','')+'#'+window.gameId);
		window.gameElement.children('#ui').append(window.gameRoom);
	}
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
			window.gameRoom.append(div);
		}
	}
});