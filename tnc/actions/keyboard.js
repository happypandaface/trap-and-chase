$(window).on("keydown", function(e)
{
	if (e.which == 73)
	{
		window.keysDown.up2 = true;
	}else
	if (e.which == 74)
	{
		window.keysDown.left2 = true;
	}else
	if (e.which == 75)
	{
		window.keysDown.down2 = true;
	}else
	if (e.which == 76)
	{
		window.keysDown.right2 = true;
	}else
	if (e.which == 69)
	{
		window.keysDown.action = true;
	}else
	if (e.which == 32)
	{
		window.keysDown.fire = true;
	}else
	if (e.which == 87)
	{
		window.dir = -90;
		window.keysDown.up = true;
	}else
	if (e.which == 65)
	{
		window.dir = 180;
		window.keysDown.left = true;
	}else
	if (e.which == 83)
	{
		window.dir = 90;
		window.keysDown.down = true;
	}else
	if (e.which == 68)
	{
		window.dir = 0;
		window.keysDown.right = true;
	}
});
$(window).on("keyup", function(e)
{
	if (e.which == 73)
		window.keysDown.up2 = false;
	else if (e.which == 74)
		window.keysDown.left2 = false;
	else if (e.which == 75)
		window.keysDown.down2 = false;
	else if (e.which == 76)
		window.keysDown.right2 = false;
	else if (e.which == 69)
		window.keysDown.action = false;
	else if (e.which == 32)
		window.keysDown.fire = false;
	else if (e.which == 87)
		window.keysDown.up = false;
	else if (e.which == 65)
		window.keysDown.left = false;
	else if (e.which == 83)
		window.keysDown.down = false;
	else if (e.which == 68)
		window.keysDown.right = false;
});