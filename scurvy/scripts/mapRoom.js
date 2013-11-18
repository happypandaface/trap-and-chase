window.gotoMapRoom = function()
{
	//$(window.renderer.domElement).css('cursor', 'none');
	var morphs = [];
	var pointLight = new THREE.PointLight(0xFFFFFF);
	pointLight.position.set(0,7,7);
	scene.add(pointLight);
	loader.load( "mapRoom.js", function( geometry, materials ) {
		var material = new THREE.MeshFaceMaterial( materials );
		var mesh = new THREE.Mesh( geometry, material );
		window.mapRoom = mesh;
		scene.add( mesh );
	});
	window.sendMouseTimeout = -1;
	$("canvas").mousemove(function(e)
	{
		var elem = window.renderer.domElement, 
			boundingRect = elem.getBoundingClientRect(),
			x = (event.clientX - boundingRect.left) * (elem.width / boundingRect.width),
			y = (event.clientY - boundingRect.top) * (elem.height / boundingRect.height);
		var vector = new THREE.Vector3( 
			( x / WIDTH ) * 2 - 1, 
			- ( y / HEIGHT ) * 2 + 1, 
			0.5 
		);
		projector.unprojectVector( vector, camera );
		var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
		var intersects = ray.intersectObject( window.mapRoom );
		var point = intersects[0].point.add(new THREE.Vector3(.2, .1, .6)).add(new THREE.Vector3(.2, 0, .6));
		var hand = null;
		for (var i in window.hands)
		{
			if (window.hands[i].playerId == window.playerId)
				hand = window.hands[i];
		}
		hand.mesh.position = point;
		if (window.sendMouseTimeout == -1)
		{
			window.sendMouseTimeout = setTimeout(window.sendMouseUpdate(point), 500);
		}else
		{
			window.nextPoint = point;
		}
		/*
		if (!window.sendMouseTimeout)
		{
			window.sendMouseTimeout = setTimeout(function()
			{
				
			});
		}*/
	});
}
window.sendMouseUpdate = function(point)
{return function(){
	doAction({type:"updateMouse", playerId:window.playerId, x:point.x, y:point.y, z:point.z}, true, true);
	if (window.nextPoint)
	{
		window.sendMouseTimeout = setTimeout(window.sendMouseUpdate(window.nextPoint), 500);
		window.nextPoint = null;
	}else
		window.sendMouseTimeout = -1;
}}
window.hands = [];
window.addHand = function(id)
{
	loader.load( "hand.js", function( geometry, materials ) {
		var material = new THREE.MeshFaceMaterial( materials );
		var mesh = new THREE.Mesh( geometry, material );
		window.hands.push({mesh:mesh, playerId:id});
		mesh.position.set(0,0,3.7);
		mesh.scale.set(.1,.1,.1);
		mesh.rotation.set(0,-Math.PI/2,0);
		scene.add( mesh );
	});
}
actions.push({
	type:"gotoMapRoom",
	funct:function(action){
		gotoMapRoom();
	}
});
actions.push({
	type:"makeHand",
	funct:function(action){
		addHand(action.playerId);
	}
});
actions.push({
	type:"updateMouse",
	funct:function(action){
		var hand = null;
		for (var i in window.hands)
		{
			if (window.hands[i].playerId == action.playerId)
				hand = window.hands[i];
		}
		window.animations.push(
		{
			type:'handAnimation',
			point:new THREE.Vector3(action.x,action.y,action.z),
			time:0,
			hand:hand,
			playerId:action.playerId,
			update:function(delta)
			{
				var dist = this.point.clone().sub(this.hand.mesh.position);
				//console.log(dist.length());
				this.time += delta;
				if (dist.length() < .001 || this.time > .2 || !this.hand)
				{
					window.sendMouseTimeout = -1;
					this.hand.mesh.position = this.point;
					window.animations.splice(window.animations.indexOf(this), 1);
				}else
					this.hand.mesh.position.add(dist.divideScalar(3));
			}
		});
	}
});