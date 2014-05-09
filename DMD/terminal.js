define([], function()
{
	var terminal = {};
	terminal.init = function(data)
	{
		terminal.cmdStr = "";
		this.elem = $("<div></div>");
		this.elem.css(
		{
			fontFamily: "Lucida Console",
			backgroundColor: data.color,
			height: data.height,
			width: data.width
		});
		$(window).keydown(function(terminal)
		{return function(e)
		{
			if (e.which == 8)
			{
				terminal.cmdStr = terminal.cmdStr.substring(0, terminal.cmdStr.length - 1);
				terminal.update();
				e.preventDefault();
				return false;
			}else if (e.which == 13)
			{
				eval(terminal.cmdStr);
				terminal.cmdStr = "";
				terminal.update();
				e.preventDefault();
				return false;
			}
		}}(this));
		$(window).keypress(function(terminal)
		{return function(e)
		{
			terminal.cmdStr += String.fromCharCode(e.which);
			terminal.update();
		}}(this));
	}
	terminal.update = function()
	{
		this.elem.html(this.cmdStr);
	}
	terminal.setTerminal = function(element)
	{
		element.append(this.elem);
	}
	return terminal;
});