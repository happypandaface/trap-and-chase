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
		//var material = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'sphereImage.png' ), color: 0xff0000, morphTargets: true, morphNormals: true} );
		materials[0].morphTargets = true;
		materials[1].morphTargets = true;
		//materials.morphTargets = true;
		//materials.morphNormals = true;
		//materials.map = THREE.ImageUtils.loadTexture( 'sphereImage.png' );
		var material = new THREE.MeshFaceMaterial( materials );
		//console.log(materials);
		//var meshAnim = new THREE.MorphAnimMesh( geometry, material );
		//geometry.geometryGroupsList.splice(0,1);
		//var meshAnim = new THREE.MorphAnimMesh( geometry, material );
		/*
		var meshAnim = new THREE.MorphAnimMesh( geometry, material );
		//var meshAnim = new THREE.Mesh( geometry, material );
		meshAnim.duration = 1000;
		meshAnim.scale.set( 1, 1, 1 );
		meshAnim.rotation.x = Math.PI/2;
		meshAnim.position.set(-2,-3,-5);
		//camera.lookAt(mesh.position);
		morphs.push( meshAnim );
		scene.add( meshAnim );*/
		window.pirates = [];
		window.getSortedPlayers();
		for (var i in window.players)
		{
			var meshAnim2 = new THREE.MorphAnimMesh( geometry, material );
			//var meshAnim = new THREE.Mesh( geometry, material );
			//meshAnim.duration = 5000;
			meshAnim2.scale.set( 1, 1, 1 );
			meshAnim2.rotation.x = Math.PI/2;
			meshAnim2.position.set(2+parseInt(i),-3,-5);
			//camera.lookAt(mesh.position);
			morphs.push( meshAnim2 );
			scene.add( meshAnim2 );
			console.log(window.players[i].playerId);
			window.pirates.push({playerId:window.players[i].playerId, mesh:meshAnim2});
		}
		window.myPirate = window.getPirateByPlayerId(window.playerId);
    } );
	$(window).keydown(function(event)
	{
		if (!chatBox.find("input#text").is(":focus"))
		{
			if (!window.myPirate.inAction)
			{
				if (event.which == 87)//w
				{
					window.doAction({type:'movePirate', playerId:window.playerId, direction:3}, true);
				}else
				if (event.which == 65)//a
				{
					window.doAction({type:'movePirate', playerId:window.playerId, direction:2}, true);
				}else
				if (event.which == 83)//s
				{
					window.doAction({type:'movePirate', playerId:window.playerId, direction:1}, true);
				}else
				if (event.which == 68)//d
				{
					window.doAction({type:'movePirate', playerId:window.playerId, direction:0}, true);
				}
			}
		}
	});
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
		pirate.inAction = true;
		//window.myGuy.mesh.position.x += 1;
		window.addAnimation({
			type:'pirateAnimation',
			pirate:pirate,
			time:0,
			direction:action.direction,
			update:function(delta)
			{
				this.time += delta;
				if (this.time > .2)
				{
					window.removeAnimation(this);
					pirate.inAction = false;
				}else
				{
					pirate.mesh.position.x += 5*delta*Math.cos(this.direction*Math.PI/2);
					pirate.mesh.position.z += 5*delta*Math.sin(this.direction*Math.PI/2);
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