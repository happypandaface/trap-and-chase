window.doShipFight = function()
{
	window.directionalLight.position.set(1, 1, 1).normalize();
	window.scene.add(directionalLight);
	var light = new THREE.AmbientLight( 0x404040 );
	window.scene.add(light);
	window.camera.position.set(0,20, 7);
	camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
	window.shipGroup = new THREE.Object3D();
	window.parentGroup = window.shipGroup;
	for (var i in window.players)
	{
		window.makePirateFor(window.players[i].playerId);
	}
	window.barrels = [{x:2,y:0,size:1.5}, {x:5,y:3,size:1.5}, {x:-3,y:-4,size:1.5}, {x:-12,y:-2,size:1.5}, {x:8,y:-2,size:1.5}];
	loader.load( "pirateBarrel.js", function( geometry, materials ) {
		var material = new THREE.MeshFaceMaterial( materials );
		for (var i in window.barrels)
		{
			var meshAnim2 = new THREE.Mesh( geometry, material );
			meshAnim2.scale.set( 1, 1, 1 );
			meshAnim2.position.set(	window.barrels[i].x,-4,	window.barrels[i].y);
			window.shipGroup.add( meshAnim2 );
			window.hittableObjects.push(meshAnim2);
			window.barrels[i].mesh = meshAnim2;
			window.barrels[i].getHit = function()
			{
				if (!this.onFire && !this.exploded)
				{
					this.onFire = true;
					var fireTex = new THREE.ImageUtils.loadTexture("fireTex.png");
					this.boomer = new TextureAnimator( fireTex, 4, 4, 16, 55 ); // texture, #horiz, #vert, #total, duration.
					window.addAnimatedTexture(this.boomer);
					var materials = (new THREE.MeshBasicMaterial({map:fireTex, transparent: true}));
					this.fireMesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), materials);
					this.fireMesh.position = this.mesh.position.clone().add(new THREE.Vector3(0,3,0));
					this.fireMesh.rotation.x = 0;
					window.shipGroup.add(this.fireMesh);
					window.addAnimation({time:0,barrel:this,update:function(dt)
					{
						this.time += dt;
						if (this.time > 2)
						{
							window.removeAnimation(this);
							this.barrel.exploded = true;
							this.barrel.onFire = false;
							loader.load( "pirateBarrelExploded.js", function( barrel )
							{return function( geometry, materials ){
								var material = new THREE.MeshFaceMaterial( materials );
								var meshAnim2 = new THREE.Mesh( geometry, material );
								meshAnim2.position.set(	barrel.mesh.position.x, barrel.mesh.position.y, barrel.mesh.position.z);
								window.shipGroup.add( meshAnim2 );
							}}(this.barrel));
							var expTex = new THREE.ImageUtils.loadTexture("explosionTex.png");
							var expAni = new TextureAnimator( expTex, 4, 4, 16, 65 ); // texture, #horiz, #vert, #total, duration.
							window.addAnimatedTexture(expAni);
							var materials = (new THREE.MeshBasicMaterial({map:expTex, transparent: true}));
							var expMesh = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), materials);
							expMesh.position = this.barrel.mesh.position.clone().add(new THREE.Vector3(0,2,0));
							expMesh.rotation.x = 0;
							window.shipGroup.add(expMesh);
							// check to see if your pirate should be thrown by the explosion
							if (!window.myPirate.dead)
							{
								var dir = new THREE.Vector2(this.barrel.x, this.barrel.y).sub(new THREE.Vector2(window.myPirate.currX, window.myPirate.currY)).multiplyScalar(-1);
								var distToGuy = dir.length();
								console.log(distToGuy);
								if (distToGuy < 5)
								{
									dir.normalize();
									window.doAction({type:"pirateThrown", playerId:window.playerId, dir:dir, distToGuy:distToGuy}, true);
								}
							}
							window.addAnimation({time:0,expMesh:expMesh,expAni:expAni,update:function(dt)
							{
								this.time += dt;
								if (this.time > 1)
								{
									window.removeAnimation(this);
									window.shipGroup.remove(this.expMesh);
									window.removeAnimatedTexture(this.expAni);
								}
							}});
							window.shipGroup.remove(this.barrel.mesh);
							window.shipGroup.remove(this.barrel.fireMesh);
							window.removeAnimatedTexture(this.barrel.boomer);
						}
					}});
				}
			}
		}
	} );
	loader.load( "pirateSail.js", function( geometry, materials ) {
		var material = new THREE.MeshFaceMaterial( materials );
		console.log(geometry);
		var meshAnim2 = new THREE.Mesh( geometry, material );
		meshAnim2.rotation.y = Math.PI;
		meshAnim2.scale.set( 2, 2, 2 );
		window.hittableObjects.push(meshAnim2);
		var solidObj = {mesh:meshAnim2, x:-2, y:0, size:1};
		window.solidObjects.push(solidObj);
		meshAnim2.position.set(solidObj.x,-3,solidObj.y);
		window.shipGroup.add(meshAnim2);
	} );
	loader.load( "pirateShip.js", function( geometry, materials ) {
		var material = new THREE.MeshFaceMaterial( materials );
		console.log(geometry);
		var meshAnim2 = new THREE.Mesh( geometry, material );
		meshAnim2.position.set(0,-12,0);
		meshAnim2.scale.set( 2, 2, 2 );
		window.shipGroup.add(meshAnim2);
	} );
	loader.load( "pirateShipHit.js", function( geometry, materials ) {
		var material = new THREE.MeshFaceMaterial( materials );
		console.log(geometry);
		var meshAnim2 = new THREE.Mesh( geometry, material );
		meshAnim2.position.set(0,-12,0);
		meshAnim2.scale.set( 2, 2, 2 );
		meshAnim2.visible = false;
		window.walkableMeshes = [meshAnim2];
		window.shipGroup.add(meshAnim2);
	} );
	window.shipGroup.rotation.z = Math.PI/80;
	window.shipRock = {time:0,update:function(dt)
	{
		this.time += dt;
		window.shipGroup.rotation.z = Math.sin(this.time/2)*Math.PI/80;
		window.shipGroup.rotation.x = Math.sin(this.time/3)*Math.PI/80;
		window.waterTexture.offset.x += .08*dt;
		window.mousePlane.position.y = -8+Math.sin(this.time/3)*.5;
	}}
	window.addAnimation(window.shipRock);
	window.animationsToRemove.push(window.shipRock);
	window.scene.add(shipGroup);
	window.waterTexture = new THREE.ImageUtils.loadTexture("waterTex.png");
	window.waterTexture.wrapS = window.waterTexture.wrapT = THREE.RepeatWrapping;
	window.waterTexture.repeat.x = 4;
	window.waterTexture.repeat.y = 4;
	var materials = [];
	materials= (new THREE.MeshBasicMaterial({map:window.waterTexture}));
	window.mousePlane = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), materials);
	window.mousePlane.position.set(0,-10,0);
	window.mousePlane.rotation.x = -Math.PI/2;
	//window.mousePlane.visible = false;
	window.scene.add(window.mousePlane);
}