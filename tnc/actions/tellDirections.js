window.tellDirections = function(obj)
{
	obj.canGoDown = true;
	obj.canGoUp = true;
	obj.canGoRight = true;
	obj.canGoLeft = true;
	obj.downObj = false;
	obj.upObj = false;
	obj.rightObj = false;
	obj.leftObj = false;
	if (!obj.jumping)
		for (var i in window.objects)
		{
			if (window.objects[i].checkType('wall'))
			{
				var distX1 = window.objects[i].x + window.objects[i].width - obj.x;
				var distX2 = window.objects[i].x - obj.x - obj.width;
				var distY1 = window.objects[i].y + window.objects[i].height - obj.y;
				var distY2 = window.objects[i].y - obj.y - obj.height;
				if (distY1 > 0 && distY2 < 0 && distX1 > 0 && distX2 < 0)
				{
					if (Math.abs(distY1) < Math.abs(distY2) &&
						Math.abs(distY1) < Math.abs(distX1) &&
						Math.abs(distY1) < Math.abs(distX2))
					{
						obj.y += distY1;
						obj.canGoDown = false;
						obj.downObj = window.objects[i];
					}else
					if (Math.abs(distY2) < Math.abs(distY1) &&
						Math.abs(distY2) < Math.abs(distX1) &&
						Math.abs(distY2) < Math.abs(distX2))
					{
						obj.y += distY2;
						obj.canGoUp = false;
						obj.upObj = window.objects[i];
					}else
					if (Math.abs(distX1) < Math.abs(distY1) &&
						Math.abs(distX1) < Math.abs(distY2) &&
						Math.abs(distX1) < Math.abs(distX2))
					{
						obj.x += distX1;
						obj.canGoRight = false;
						obj.rightObj = window.objects[i];
					}else
					if (Math.abs(distX2) < Math.abs(distY1) &&
						Math.abs(distX2) < Math.abs(distY2) &&
						Math.abs(distX2) < Math.abs(distX1))
					{
						obj.x += distX2;
						obj.canGoLeft = false;
						obj.leftObj = window.objects[i];
					}
				}
			}
		}
}