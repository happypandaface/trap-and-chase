window.directionalLight = new THREE.DirectionalLight(0xffffff);
actions.push({type:'fight',funct:function(action)
{
	if (window.playerId == action.from ||
		window.playerId == action.to)
		window.gotoFight();
}});
window.getSortedPlayers = function()
{
	var sortedPlayers = window.players;
	sortedPlayers.sort(function(a,b){return a.playerId.valueOf()>b.playerId.valueOf()});
	return sortedPlayers;
}
window.translateGamePosToRealPos = function(x, y, mesh)
{
	if (!mesh)
		return {x:x, y:-3, z:y};
	else
		mesh.position.set(x,-3,y);
}
window.gotoFight = function()
{
	window.gameElement.children('#ui').empty();
	window.directionalLight.position.set(1, 1, 1).normalize();
	window.scene.add(directionalLight);
	var light = new THREE.AmbientLight( 0x404040 ); // soft white light
	window.scene.add( light );
	window.camera.position.set(0,20, 7);
    camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
	loader.load( "pirate.js", function( geometry, materials ) {
		geometry.computeMorphNormals();
		materials[0].morphTargets = true;
		materials[1].morphTargets = true;
		var material = new THREE.MeshFaceMaterial( materials );
		window.pirates = [];
		window.getSortedPlayers();
		for (var i in window.players)
		{
			var meshAnim2 = new THREE.MorphAnimMesh( geometry, material );
			meshAnim2.scale.set( 1, 1, 1 );
			meshAnim2.rotation.x = Math.PI/2;
			meshAnim2.position.set(2+parseInt(i),-3,-5);
			morphs.push( meshAnim2 );
			scene.add( meshAnim2 );
			console.log(window.players[i].playerId);
			window.pirates.push({playerId:window.players[i].playerId, mesh:meshAnim2, currX:meshAnim2.position.x, currY:meshAnim2.position.z});
		}
		window.myPirate = window.getPirateByPlayerId(window.playerId);
    } );
	window.moveSpeed = 5;
	window.moveAnimation = {keyDown:[],time:0,update:function(dt)
	{
		if (!this.lastX)
			this.lastX = window.myPirate.currX;
		if (!this.lastY)
			this.lastY = window.myPirate.currY;
		if (this.keyDown['w'])
			window.myPirate.currY -= window.moveSpeed*dt;
		if (this.keyDown['a'])
			window.myPirate.currX -= window.moveSpeed*dt;
		if (this.keyDown['s'])
			window.myPirate.currY += window.moveSpeed*dt;
		if (this.keyDown['d'])
			window.myPirate.currX += window.moveSpeed*dt;
		window.translateGamePosToRealPos(window.myPirate.currX, window.myPirate.currY, window.myPirate.mesh);
		this.time += dt;
		if (this.time > .4)
		{
			this.time = 0;
			if (window.myPirate.currY != this.lastY || window.myPirate.currX != this.lastX)
			{
				this.lastY = window.myPirate.currX;
				this.lastY = window.myPirate.currY;
				window.doAction({type:'movePirate', playerId:window.playerId, x:window.myPirate.currX, y:window.myPirate.currY}, true, true);
			}
		}
	}};
	window.addAnimation(window.moveAnimation);
	$(window).keydown(function(event)
	{
		if (!chatBox.find("input#text").is(":focus"))
		{
			if (event.which == 87)//w
			{
				window.moveAnimation.keyDown['w'] = true;
			}else
			if (event.which == 65)//a
			{
				window.moveAnimation.keyDown['a'] = true;
			}else
			if (event.which == 83)//s
			{
				window.moveAnimation.keyDown['s'] = true;
			}else
			if (event.which == 68)//d
			{
				window.moveAnimation.keyDown['d'] = true;
			}
		}
	});
	$(window).keyup(function(event)
	{
		if (!chatBox.find("input#text").is(":focus"))
		{
			if (event.which == 87)//w
			{
				window.moveAnimation.keyDown['w'] = false;
			}else
			if (event.which == 65)//a
			{
				window.moveAnimation.keyDown['a'] = false;
			}else
			if (event.which == 83)//s
			{
				window.moveAnimation.keyDown['s'] = false;
			}else
			if (event.which == 68)//d
			{
				window.moveAnimation.keyDown['d'] = false;
			}
		}
	});
	window.playPlane = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshNormalMaterial());
	window.playPlane.position.set(0,-6,0);
	window.playPlane.rotation.x = -Math.PI/2;
	window.scene.add(window.playPlane);
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
		var intersects = ray.intersectObject( window.playPlane );
		var point = intersects[0].point;
		var diff = window.myPirate.mesh.position.clone().sub(point);
		window.myPirate.mesh.rotation.z = Math.atan2(diff.z, diff.x)+Math.PI/2;
	});
	window.rotateAnimation = {keyDown:[],time:0,update:function(dt)
	{
		if (this.time > .5)
		{
			this.time = 0;
			if (!this.lastRotation)
				this.lastRotation = window.myPirate.mesh.rotation.z;
			if (this.lastRotation != window.myPirate.mesh.rotation.z)
			{
				this.lastRotation = window.myPirate.mesh.rotation.z;
				window.doAction({type:'rotatePirate', playerId:window.playerId, direction:this.lastRotation}, true, true);
			}
		}else
			this.time += dt;
	}};
	window.addAnimation(rotateAnimation);
}
window.getPirateByPlayerId = function(id)
{
	for (var i in window.pirates)
		if (id == window.pirates[i].playerId)
			return window.pirates[i];
}
actions.push({
	type:'movePirate',
	funct:function(action){
		var pirate = window.getPirateByPlayerId(action.playerId);
		window.addAnimation({
			type:'pirateMoveAnimation',
			pirate:pirate,
			time:0,
			destX:action.x,
			destY:action.y,
			distX:action.x-pirate.currX,
			distY:action.y-pirate.currY,
			update:function(delta)
			{
				this.time += delta;
				this.pirate.currX += this.distX*(delta/.2);
				this.pirate.currY += this.distY*(delta/.2);
				window.translateGamePosToRealPos(this.pirate.currX, this.pirate.currY, this.pirate.mesh);
				if (this.time > .2)
				{
					this.pirate.currX = this.destX;
					this.pirate.currY = this.destY;
					window.removeAnimation(this);
				}
			}
		});
	}
});
actions.push({
	type:'rotatePirate',
	funct:function(action){
		var pirate = window.getPirateByPlayerId(action.playerId);
		var dist = (action.direction-pirate.mesh.rotation.z);
		while (dist > Math.PI/2)
			dist -= Math.PI;
		while (dist < -Math.PI/2)
			dist += Math.PI;
		window.addAnimation({
			type:'pirateRotationAnimation',
			pirate:pirate,
			time:0,
			direction:action.direction,
			dist:dist,
			update:function(delta)
			{
				this.time += delta;
				this.pirate.mesh.rotation.z += this.dist*(delta/.2);
				if (this.time > .2)
				{
					this.pirate.mesh.rotation.z = this.direction;
					window.removeAnimation(this);
				}
			}
		});
	}
});
/*
		//geometry.computeMorphNormals();
		//var material = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'sphereImage.png' ), color: 0xff0000, morphTargets: true, morphNormals: true} );
		materials[0].morphTargets = true;
		materials[1].morphTargets = true;
		//materials.morphTargets = true;
		//materials.morphNormals = true;
		//materials.map = THREE.ImageUtils.loadTexture( 'sphereImage.png' );
		var material = new THREE.MeshFaceMaterial( materials );
		//console.log(materials);
		var meshAnim = new THREE.MorphAnimMesh( geometry, material );
		//var meshAnim = new THREE.Mesh( geometry, material );
		meshAnim.duration = 5000;
		meshAnim.scale.set( 1, 1, 1 );
		meshAnim.position.y = 0;
		meshAnim.position.x = 0;
		//camera.lookAt(mesh.position);
		morphs.push( meshAnim );
		scene.add( meshAnim );
*/