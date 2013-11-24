window.tutorialLink = $('<button id=tutorial class="tutorial pirate">see tutorials</button>');
window.setTutorialLink = function()
{
	window.tutorialLink.mouseup(function(e)
	{
		if (window.gameElement.children('#tutorialBox').length == 0)
		{
			$(this).html('close tutorials');
			window.tutorialBox = $('<div id=tutorialBox class=basicPopup>Have your friends follow this link to join your game:<font style="color:#ffee99"><br/>'+window.location.href.replace('#','')+'#'+window.gameId+'</font><br/><br/>After your friends have joined, click "Everyone Fight!" in the bottom left of the game window<br/><br/>Use W,A,S, and D to move your pirate around the ship<br/><br/>Left-click to attack and right-click to block!<br/><br/>You only have 3 health so watch out!</div>');
			window.gameElement.append(window.tutorialBox);
			$('video#vid')[0].play();
		}else
		{
			window.gameElement.children('#tutorialBox').remove();
			$(this).html('see tutorials');
		}
	});
	window.gameElement.append(window.tutorialLink);
}