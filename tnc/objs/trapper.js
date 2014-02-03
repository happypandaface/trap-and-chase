window.makeTrapper = function(data)
{
	var trapper = {};
	trapper.z = 0;
	trapper.x = 0;
	trapper.y = 0;
	trapper.placeCooldownMax = 20;
	trapper.placeCooldown = trapper.placeCooldownMax;
	trapper.placeGooCooldownMax = 20;
	trapper.placeGooCooldown = trapper.placeGooCooldownMax;
	trapper.checkType = function(type)
	{
		if (type == 'trapper')
			return true;
		return false;
	}
	trapper.go = function(data)
	{
		if (this.placeCooldown > 0)
		{
			this.placeCooldown--;
			$('div#robot').css('opacity', (1-trapper.placeCooldown/trapper.placeCooldownMax));
		}
		if (this.placeGooCooldown > 0)
		{
			this.placeGooCooldown--;
			$('div#goo').css('opacity', (1-trapper.placeGooCooldown/trapper.placeGooCooldownMax));
		}
	}
	trapper.draw = function(data)
	{
		
	}
	trapper.tryFire = function()
	{
		if (this.placeCooldown == 0)
		{
			this.placeCooldown = this.placeCooldownMax;
			return true;
		}else
			return false;
	}
	trapper.tryGoo = function()
	{
		if (this.placeGooCooldown == 0)
		{
			this.placeGooCooldown = this.placeGooCooldownMax;
			return true;
		}else
			return false;
	}
	window.objects.push(trapper);
	return trapper;
}