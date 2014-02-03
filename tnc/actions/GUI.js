window.drawLoop = function()
{
	window.currentTimeout = setTimeout(window.drawLoop, window.fps);
	for (var i = window.objects.length-1; i >= 0; i--)
	{
		if (window.objects[i].go())
			window.objects.splice(i, 1);
	}
	var canvas = document.getElementById("container");
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, window.stats.gameWidth, window.stats.gameHeight);
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, window.stats.gameWidth, window.stats.gameHeight);
	for (var i = 0; i < window.objects.length-1; i++)
	{//sorting
		if (window.objects[i].z > window.objects[i+1].z)
		{
			var temp = window.objects[i+1];
			window.objects[i+1] = window.objects[i];
			window.objects[i] = temp;
			i--;
		}
	}
	for (var i in window.objects)
	{
		window.objects[i].draw(ctx);
	}
}

window.makeKeyGUI = function()
{
	$('div.server').append('<div id=serverMake></div>');
	$('div.server div#serverMake').html('Play Multiplayer');
	$('div.server div#serverMake').on('click', function()
	{
		$('div.server div#serverMake').off('click');
		window.startServer();
	});
	$('div.server').append('<div id=addAI></div>');
	$('div.server div#addAI').html('Add AI trapper');
	$('div.server div#addAI').on('click', function()
	{
		$('div.server div#addAI').remove();
		window.doingAI = true;
		window.makeAI();
	});
	$('div.tutorial').append('<div id=chaserTut></div>');
	$('div.tutorial div#chaserTut').html('Chaser Instructions');
	$('div.tutorial div#chaserTut').on('click', function()
	{
		popup({text:'Goal: push the brown block onto the blue square.', button:'more', buttonFunction:window.continueChaserInstructions});
	});
	$('div.tutorial').append('<div id=trapperTut></div>');
	$('div.tutorial div#trapperTut').html('Trapper Instructions');
	$('div.tutorial div#trapperTut').on('click', function()
	{
		popup({text:'Goal: stop the chaser before he completes his goal', button:'more', buttonFunction:window.continueTrapperInstructions});
	});
	if (!window.isClient)
	{
		window.makeWeaponsGUI();
	}
}
window.continueChaserInstructions = function()
{
	unpopup();
	popup({text:'wasd - move<br/>e + (wasd) - push block<br/>space - jump<br/>ijkl - fire', button:'close', buttonFunction:window.unpopup});
}
window.continueTrapperInstructions = function()
{
	unpopup();
	popup({text:'click to use your trap, right click to switch traps<br/>The robot will seek the chaser and the goo will slow him down', button:'close', buttonFunction:window.unpopup});
}
window.makeWeaponsGUI = function()
{
	$('div.weapons').append('<div class=weapon id=robot><span class=select></span>ROBOT</div>');
	$('div.weapons').append('<div class=weapon id=goo><span class=select></span>GOO</div>');
	$('div.weapons div#robot').css('color', '#0044aa');
	$('div.weapons div#robot').css('border-style', 'solid');
	$('div.weapons div#robot').css('background-color', '#999999');
	$('div.weapons div#goo').css('color', '#0044aa');
	$('div.weapons div#goo').css('border-style', 'solid');
	$('div.weapons div#goo').css('background-color', '#00ff00');
	selectWeapon({weapon:'robot'});
}
window.selectWeapon = function(data)
{
	window.selectedWeapon = data.weapon;
	$('div.weapon').css('border-width', '0px');
	$('div.weapon span.select').html("&nbsp;");
	if (data.weapon == 'robot')
	{
		$('div#robot span.select').html("&#9654;");
		$('div#robot').css('border-width', '2px');
	}else
	if (data.weapon == 'goo')
	{
		$('div#goo span.select').html("&#9654;");
		$('div#goo').css('border-width', '2px');
	}
}
window.popup = function(data)
{
	var popupBackground = $('<div class=popupBackground></div>');
	$('div#gui').append(popupBackground);
	var popup = $('<div class=popup>'+data.text+'</div>');
	$('div#gui').append(popup);
	if (data.button)
	{
		$('div#gui div.popup').append('<br/>');
		var popupButton = $('<button>'+data.button+'</button>');
		$('div#gui div.popup').append(popupButton);
		popupButton.focus();
		popupButton.on('click', data.buttonFunction);
	}
	if (data.selection)
	{
		$('div#gui div.popup').append('<br/>');
		var popupSelection = $('<input></input>');
		popupSelection.val(data.selection);
		$('div#gui div.popup').append(popupSelection);
	}
	if (data.bigText)
	{
		var popupBigText = $('<div class=bigText>'+data.bigText+'</div>');
		$('div#gui div.popup').append(popupBigText);
	}
}	
window.setBigPopupText = function(data)
{
	$('div#gui div.popup div.bigText').html(data.text);
}
window.modpopup = function(data)
{
	if (data.button)
		$('div#gui div.popup button').html(data.button);
	if (data.buttonOff)
		$('div#gui div.popup button').off('click');
}
window.unpopup = function(data)
{
	$('div#gui div.popup').remove();
	$('div#gui div.popupBackground').remove();
}