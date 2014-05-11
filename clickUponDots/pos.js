function calcDist2(obj1, obj2)
{
	var distX = obj2.x - obj1.x;
	var distY = obj2.y - obj1.y;
	var len2 = distX*distX+distY*distY;
	return len2;
}
function calcDist(obj1, obj2)
{
	return Math.sqrt(calcDist2(obj1, obj2));
}