window.openChat = function()
{
	window.chatBox = $("<div class=chat id=chat></div>");
	chatBox.css('white-space', 'nowrap');
	chatBox.css('position', 'absolute');
	chatBox.css('left', '125');
	chatBox.css('top', '400');
	chatBox.css('padding', '1');
	chatBox.css('height', '130');
	chatBox.css('width', '350');
	chatBox.css('background-color', '#C40020');
	chatBox.html('<textarea></textarea><br/><form action="#"><input autocomplete="off" id=text type=text></input><button class=nav>say</button></form>');
	chatBox.find("textarea").css('resize', 'none');
	chatBox.find("textarea").css('width', '350');
	chatBox.find("textarea").css('height', '100');
	chatBox.find("textarea").attr('readonly','readonly');
	chatBox.find("form").submit(function(e)
	{
		doAction({type:"say", text:'['+window.playerId+"]:"+chatBox.find("input#text").val()}, true);
		chatBox.find("input#text").val("");
		e.preventDefault();
	});
	window.gameElement.append(chatBox);
}
window.addToChat = function(text)
{
	$("div#chat").find("textarea").append(text+"\n");
	$("div#chat").find("textarea").scrollTop($("div#chat").find("textarea")[0].scrollHeight - $("div#chat").find("textarea").height());
}
actions.push({
	type:"say",
	funct:function(action){
		addToChat(action.text);
	}
});