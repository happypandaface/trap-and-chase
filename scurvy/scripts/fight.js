window.directionalLight = new THREE.DirectionalLight(0xffffff);
actions.push({type:'fight',funct:function(action)
{// starts the fight screen, only one player needs to send this, no confirmation, that's how it works on the high seas
	window.gotoFight();
}});
window.getSortedPlayers = function()
{// sort the players alphabetically so that everyone has the same list, this is used to position players
	var sortedPlayers = window.players;
	sortedPlayers.sort(function(a,b){return a.playerId.valueOf()>b.playerId.valueOf()});
	return sortedPlayers;
}
window.translateGamePosToRealPos = function(x, y, mesh)
{// because the rocking of the ship, the logical location of the player is different than the graphical position.
	if (!mesh)
		return {x:x, y:-3, z:y};
	else
		mesh.position.set(x,-3,y);
}
window.checkPossibleLocation = function(x, y)
{// check if a player can go to this location and if not try and return the closest spot they can go to.
	var vector = new THREE.Vector3(0, -3, 0).normalize();
	vector.applyQuaternion(window.shipGroup.quaternion);
	var ray = new THREE.Raycaster( new THREE.Vector3(x, -3, y), vector );
	window.shipGroup
	var intersects = ray.intersectObjects( window.walkableMeshes );
	if (intersects.length == 0)
		return null;// if it doesn't intersect a walkable mesh, tell them they can't go there
	for (var i in window.barrels)
	{
		var pos = new THREE.Vector2(x, y);
		var bar = new THREE.Vector2(window.barrels[i].x, window.barrels[i].y);
		if (pos.distanceTo(bar) < window.barrels[i].size)
		{
			// this means the point is in the barrel, return the nearest point on the barrel's perimeter
			bar.add(pos.sub(bar).normalize().multiplyScalar(window.barrels[i].size));
			return {x:bar.x, y:bar.y};
		}
	}
	for (var i in window.solidObjects)
	{
		var pos = new THREE.Vector2(x, y);
		var bar = new THREE.Vector2(window.solidObjects[i].x, window.solidObjects[i].y);
		if (pos.distanceTo(bar) < window.solidObjects[i].size)
		{
			// this means the point is in the barrel, return the nearest point on the barrel's perimeter
			bar.add(pos.sub(bar).normalize().multiplyScalar(window.solidObjects[i].size));
			return {x:bar.x, y:bar.y};
		}
	}
	return {x:x, y:y};
}
window.gotoFight = function()
{// this sets up the fight, this needs to be changed so that it can be called multiple times, needs a destructor.
	if (window.currentRoom != "fightRoom")
	{
		window.getNPF("gotoCurrentRoom").roomFunctionName = "fight";
		window.currentRoom = "fightRoom";
		window.gameElement.children('#ui').empty();
		window.destroyScene();
		window.directionalLight.position.set(1, 1, 1).normalize();
		window.scene.add(directionalLight);
		var light = new THREE.AmbientLight( 0x404040 );
		window.scene.add(light);
		window.camera.position.set(0,20, 7);
		camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
		window.hittableObjects = [];
		window.pirates = [];
		window.shipGroup = new THREE.Object3D();
		for (var i in window.players)
		{
			window.makePirateFor(window.players[i].playerId);
		}
		window.solidObjects = [];
		window.barrels = [{x:2,y:0,size:1.5}];
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
							if (this.time > 3)
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
		window.animationsToRemove = [];
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
		// pirate move speed
		window.moveSpeed = 5;
		window.posRefreshTime = .1;
		// initialize mouse so it doesn't throw errors before you move it.
		window.mouseX = 1;
		window.mouseY = 1;
		window.startZoom = 5;
		window.gameStarted = false;
		window.centerCamera = {scaleVector:new THREE.Vector3(0,17, -15),update:function(dt)
		{
			var origin = new THREE.Vector3(0, 0, 0);
			if (window.gameStarted)
				if (window.startZoom > 1)
				{
					this.scaleVector.applyAxisAngle( new THREE.Vector3(0, 1, 0), dt*Math.PI*2/4 );
					window.startZoom -= 2*dt;
				}else
					window.startZoom = 1;
			window.camera.position = window.myPirate.mesh.position.clone().add(this.scaleVector.clone().multiplyScalar(window.startZoom));
			camera.lookAt(window.myPirate.mesh.position);
		}}
		window.addAnimation(window.centerCamera);
		window.animationsToRemove.push(window.centerCamera);
		window.updateAnimation = {keyDown:[],time:0,update:function(dt)
		{
			if (!window.myPirate.frozen)
			{
				window.gameStarted = true;
				window.myPirate.mesh.rotation.z = Math.atan2(window.mouseY/window.HEIGHT-.5, window.mouseX/window.WIDTH-.5)-Math.PI/2;
				if (!this.lastX)
					this.lastX = window.myPirate.currX;
				if (!this.lastY)
					this.lastY = window.myPirate.currY;
				var nextX = window.myPirate.currX;
				var nextY = window.myPirate.currY;
				if (this.keyDown['w'])
					nextY -= window.moveSpeed*dt;
				if (this.keyDown['a'])
					nextX -= window.moveSpeed*dt;
				if (this.keyDown['s'])
					nextY += window.moveSpeed*dt;
				if (this.keyDown['d'])
					nextX += window.moveSpeed*dt;
				if (!window.myPirate.inAction)
				{
					if (nextX != window.myPirate.currX || nextY != window.myPirate.currY)
						window.switchAnimation(window.myPirate.anims, 'walking');
					else
						window.switchAnimation(window.myPirate.anims, 'standing');
				}
				var nextPos = window.checkPossibleLocation(nextX, nextY);
				if (nextPos != null)
				{
					window.myPirate.currX = nextPos.x;
					window.myPirate.currY = nextPos.y;
				}
				window.translateGamePosToRealPos(window.myPirate.currX, window.myPirate.currY, window.myPirate.mesh);
				if (window.myPirate.doAttack)
				{
					window.myPirate.doAttack = false;
					window.doAction({type:'pirateAction', playerId:window.playerId, pirateActionType:'attack'}, true);
				}else
				if (window.myPirate.doBlock)
				{
					window.myPirate.doBlock = false;
					window.doAction({type:'pirateAction', playerId:window.playerId, pirateActionType:'block'}, true);
				}
				if (this.time > window.posRefreshTime)
				{
					this.time = 0;
					if (!this.lastRotation)
						this.lastRotation = window.myPirate.mesh.rotation.z;
					if (this.lastRotation != window.myPirate.mesh.rotation.z || window.myPirate.currY != this.lastY || window.myPirate.currX != this.lastX)
					{
						this.lastX = window.myPirate.currX;
						this.lastY = window.myPirate.currY;
						this.lastRotation = window.myPirate.mesh.rotation.z;
						window.doAction({type:'updatePirate', playerId:window.playerId, direction:this.lastRotation, x:window.myPirate.currX, y:window.myPirate.currY}, true, true);
					}
				}else
					this.time += dt;
			}
		}};
		window.addAnimation(window.updateAnimation);
		window.animationsToRemove.push(window.updateAnimation);
		$(window).keydown(function(event)
		{
			if (!chatBox.find("input").is(":focus"))
			{
				if (event.which == 87)//w
				{
					window.updateAnimation.keyDown['w'] = true;
				}else
				if (event.which == 65)//a
				{
					window.updateAnimation.keyDown['a'] = true;
				}else
				if (event.which == 83)//s
				{
					window.updateAnimation.keyDown['s'] = true;
				}else
				if (event.which == 68)//d
				{
					window.updateAnimation.keyDown['d'] = true;
				}
			}
		});
		$(window).keyup(function(event)
		{
			if (!chatBox.find("input").is(":focus"))
			{
				if (event.which == 87)//w
				{
					window.updateAnimation.keyDown['w'] = false;
				}else
				if (event.which == 65)//a
				{
					window.updateAnimation.keyDown['a'] = false;
				}else
				if (event.which == 83)//s
				{
					window.updateAnimation.keyDown['s'] = false;
				}else
				if (event.which == 68)//d
				{
					window.updateAnimation.keyDown['d'] = false;
				}
			}
		});
		$("canvas").mousemove(function(e)
		{
			var parentOffset = $(this).parent().offset();
			window.mouseX = e.clientX-parentOffset.left;
			window.mouseY = e.clientY-parentOffset.top;
		});
		$("canvas").mouseup(function(e)
		{
			if (!window.myPirate.inAction)
			{
				if (e.which == 1)
				{
					window.myPirate.doAttack = true;
				}else
				if (e.which == 3)
				{
					window.myPirate.doBlock = true;
				}
			}
		});
		$("canvas").bind("contextmenu",function(e){
		  e.preventDefault();
		});
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
		window.endingGame = false;
	}
}
window.remakeHealthBars = function()
{
	var notPastMine = 1;
	window.gameElement.children('#ui').children('.healthBar').remove();
	for (var i in window.players)
	{
		var healthBar = $('<div class=healthBar></div>');
		var pirate = window.getPirateByPlayerId(window.players[i].playerId);
		for (var c = 0; c < 3; ++c){
			if (c > pirate.hp)
				healthBar.append('<img src=jolly.png height=20 width=20 ></img>');
			else
				healthBar.append('<img src=heart.png height=20 width=20 ></img>');
		}
		window.gameElement.children('#ui').append(healthBar);
		if (window.players[i].playerId == window.playerId)
		{
			notPastMine = 0;
			healthBar.css('top', parseInt(healthBar.css('top')));
		}else
			healthBar.css('top', parseInt(healthBar.css('top'))+25*(parseInt(i)+notPastMine));
		window.players[i].healthBar = healthBar;
	}
}
window.iLost = function()
{
	window.myPirate.frozen = true;
	window.doAction({type:'pirateDead', playerId:window.playerId}, true);
}
window.switchAnimation = function(anims, animation)
{
	var ani = anims.animations[anims.currentAnimation];
	if (anims.currentAnimation != animation && !ani.pose)
		anims.morph.time = ani.start;
	anims.currentAnimation = animation;
}
window.getPirateByPlayerId = function(id)
{
	for (var i in window.pirates)
		if (id == window.pirates[i].playerId)
			return window.pirates[i];
}
window.getPirateByFunct = function(funct)
{
	for (var i in window.pirates)
		if (funct(window.pirates[i]))
			return window.pirates[i];
}
window.getHittableObjectByFunct = function(funct)
{
	for (var i in window.pirates)
		if (funct(window.pirates[i]))
			return window.pirates[i];
	for (var i in window.barrels)
		if (funct(window.barrels[i]))
			return window.barrels[i];
	for (var i in window.solidObjects)
		if (funct(window.solidObjects[i]))
			return window.solidObjects[i];
}
window.getHit = function(pirate)
{
	pirate.hp--;
	if (pirate.hp == 0 && pirate.lose)
		pirate.lose();
	for (var i = 3; i > pirate.hp; --i)
	{
		$(window.getPlayerById(pirate.playerId).healthBar.children('img')[i-1]).attr('src', 'jolly.png');
	}
}
window.makePirateFor = function(id)
{
	loader.load( "pirate.js", function( geometry, materials ) {
		geometry.computeMorphNormals();
		materials[0].morphTargets = true;
		materials[1].morphTargets = true;
		materials[2].morphTargets = true;
		var material = new THREE.MeshFaceMaterial( materials );
		window.getSortedPlayers();
		var pirateMade = false;
		for (var c in window.pirates)
		{
			if (window.pirates[c].playerId == id)
			{
				pirateMade = true;
			}
		}
		if (!pirateMade)
		{
			var meshAnim2 = new THREE.MorphAnimMesh( geometry, material );
			meshAnim2.scale.set( 1, 1, 1 );
			meshAnim2.rotation.x = Math.PI/2;
			meshAnim2.position.set(1,-3,-4);
			var morphAnimations = {morph:meshAnim2,animations:[],totalFrames:80,speed:.29};
			meshAnim2.duration = morphAnimations.totalFrames*1000;
			morphAnimations.animations['walking'] = {start:1,end:20};
			morphAnimations.animations['fighting'] = {start:21,end:45};
			morphAnimations.animations['blocking'] = {start:46,end:50,dontLoop:true};
			morphAnimations.animations['standing'] = {start:51,end:60};
			morphAnimations.currentAnimation = 'standing';
			morphs.push(morphAnimations);
			window.shipGroup.add( meshAnim2 );
			window.hittableObjects.push(meshAnim2);
			var pirate = {hp:3,anims:morphAnimations,playerId:id, mesh:meshAnim2, currX:meshAnim2.position.x, currY:meshAnim2.position.z};
			if (id == window.playerId)
				pirate.lose = window.iLost;
			window.pirates.push(pirate);
		}
		window.myPirate = window.getPirateByPlayerId(window.playerId);
		window.remakeHealthBars();
	});
}
window.removePirateById = function(id)
{
	for (var c in window.pirates)
	{
		if (window.pirates[c].playerId == id)
		{
			var pirate = window.pirates[c];
			window.removeAnimationFunct(function(anim){
				if (anim.pirate && anim.pirate.playerId == pirate.playerId)
				{
					return true;
				}
			});
			window.scene.remove(pirate.mesh);
			window.removeMorph(pirate.anims);
			window.pirates.splice(c, 1);
			break;
		}
	}
}
actions.push({
	type:"explodeBarrel",
	subType:["fightRoom"],
	funct:function(action){
		window.barrels[action.barrelNumber].getHit();
	}
});
actions.push({
	type:"disconnect",
	subType:["fightRoom"],
	funct:function(action){
		if (window.currentRoom == "fightRoom")
		{
			window.removePirateById(action.playerId);
			window.remakeHealthBars();
		}
	}
});
actions.push({
	type:"joinedGameRoom",
	subType:["fightRoom"],
	funct:function(action){
		if (window.currentRoom == "fightRoom")
		{
			window.makePirateFor(action.playerId);
		}
	}
});
actions.push({
	type:'updatePirate',
	funct:function(action){
		var pirate = window.getPirateByPlayerId(action.playerId);
		var dist = (action.direction-pirate.mesh.rotation.z);
		while (dist > Math.PI)
			dist -= Math.PI*2;
		while (dist < -Math.PI)
			dist += Math.PI*2;
		// remove other pirate move functions for the same pirate
		window.removeAnimationFunct(function(anim){
			if (anim.type == "pirateMoveAnimation" && anim.pirate && anim.pirate.playerId == action.playerId)
			{
				return true;
			}
		});
		var speed = window.posRefreshTime*1.5;
		window.addAnimation({
			type:'pirateMoveAnimation',
			pirate:pirate,
			time:0,
			destX:action.x,
			destY:action.y,
			distX:action.x-pirate.currX,
			distY:action.y-pirate.currY,
			direction:action.direction,
			dist:dist,
			speed:speed,
			special:action.special,
			update:function(delta)
			{
				this.time += delta;
				if (this.time > this.speed)
				{
					this.pirate.mesh.rotation.z = this.direction;
					this.pirate.currX = this.destX;
					this.pirate.currY = this.destY;
					if (!this.pirate.inAction)
						this.pirate.anims.currentAnimation = 'standing';
					window.removeAnimation(this);
				}else
				{
					if (this.distX != 0 || this.distY != 0)
					{
						if (!this.pirate.inAction)
							this.pirate.anims.currentAnimation = 'walking';
						this.pirate.currX += this.distX*(delta/this.speed);
						this.pirate.currY += this.distY*(delta/this.speed);
					}
					this.pirate.mesh.rotation.z += this.dist*(delta/this.speed);
					window.translateGamePosToRealPos(this.pirate.currX, this.pirate.currY, this.pirate.mesh);
				}
			}
		});
	}
});
actions.push({
	type:'lostALife',
	funct:function(action){
		window.getHit(window.getPirateByPlayerId(action.playerId));
	}
});
actions.push({
	type:'pushedBack',
	funct:function(action){
		var pirate = window.getPirateByPlayerId(action.playerId);
		pirate.frozen = true;
		// remove other pirate actions for the same pirate
		window.removeAnimationFunct(function(anim){
			if (anim.pirate && anim.pirate.playerId == action.playerId)
			{
				return true;
			}
		});
		var strength = 7;
		window.addAnimation({
			type:'piratePushedBack',
			pirate:pirate,
			time:0,
			direction:action.direction,
			strength:strength,
			update:function(delta)
			{
				this.time += delta;
				var nextX = this.pirate.currX + Math.cos(this.direction)*this.strength*delta;
				var nextY = this.pirate.currY + Math.sin(this.direction)*this.strength*delta;
				var nextPos = window.checkPossibleLocation(nextX, nextY);
				if (nextPos != null)
				{
					this.pirate.currX = nextPos.x;
					this.pirate.currY = nextPos.y;
				}
				window.translateGamePosToRealPos(this.pirate.currX, this.pirate.currY, this.pirate.mesh);
				if (this.time > .8)
				{
					this.pirate.blocking = false;
					this.pirate.inAction = false;
					this.pirate.anims.currentAnimation = 'standing';
					this.pirate.frozen = false;
					window.removeAnimation(this);
				}
			}
		});
	}
});
actions.push({
	type:'pirateDead',
	funct:function(action){
		var pirate = window.getPirateByPlayerId(action.playerId);
		pirate.dead = true;
		pirate.mesh.rotation.set(0, 0, 0);
		// remove other pirate actions for the same pirate
		window.removeAnimationFunct(function(anim){
			if (anim.pirate && anim.pirate.playerId == action.playerId)
			{
				return true;
			}
		});
		var livingPirates = 0;
		if (!window.endingGame)
		{
			for (var i in window.pirates)
				if (!window.pirates[i].dead)
					livingPirates++;
			if (livingPirates <= 1)
			{
				window.endingGame = true;
				if (livingPirates == 1 && !window.myPirate.dead)
					window.endText = "You Win!";
				else
					window.endText = "You Lose!";
				window.gameElement.children('#ui').append('<div id=endText class=endText>'+window.endText+'</div>');
				window.addAnimation(
				{time:0,
				update:function(dt)
					{
						this.time += dt;
						if (this.time > 4)
						{
							window.gotoGameRoom();
							for (var i in window.animationsToRemove)
							{
								window.removeAnimation(window.animationsToRemove[i]);
							}
							window.animationsToRemove = [];
							window.removeAnimation(this);
						}
					}
				});
			}
		}
	}
});
actions.push({
	type:'pirateAction',
	funct:function(action){
		var pirate = window.getPirateByPlayerId(action.playerId);
		pirate.inAction = true;
		// remove other pirate actions for the same pirate
		window.removeAnimationFunct(function(anim){
			if (anim.type == "pirateAction" && anim.pirate && anim.pirate.playerId == action.playerId)
			{
				return true;
			}
		});
		if (action.pirateActionType == "attack")
		{
			window.switchAnimation(pirate.anims, 'fighting');
		}else
		if (action.pirateActionType == "block")
		{
			window.switchAnimation(pirate.anims, 'blocking');
		}
		window.addAnimation({
			type:'pirateAction',
			pirate:pirate,
			time:0,
			actionType:action.pirateActionType,
			update:function(delta)
			{
				this.time += delta;
				if (this.actionType == 'attack')
				{
					if (this.time > .8 && !this.startedAttack)
					{
						this.startedAttack = true;
						// new hit code
						var closestDist = 5;
						var closestObject = null;
						for (var i in window.hittableObjects)
						{
							var obj = window.getHittableObjectByFunct(function(obj)
								{
									if (obj.mesh == window.hittableObjects[i])
										return true;
								});
							if (obj.playerId != this.pirate.playerId)
							{
								var point = window.hittableObjects[i].position;
								var diff = this.pirate.mesh.position.clone().sub(point);
								var len = diff.length();
								if (diff.length() < closestDist)
								{
									var diffRot = Math.abs(this.pirate.mesh.rotation.z-Math.PI/2 - Math.atan2(diff.z, diff.x));
									if (diffRot > Math.PI)
										diffRot -= Math.PI*2;
									if (Math.abs(diffRot) < Math.PI/6)
									{
										closestDist = len;
										closestObject = obj;
									}
								}
							}
						}
						if (closestObject != null)
						{
							if (closestObject.playerId == window.playerId)
							{
								if (!closestObject.blocking)// eventually calculate direction the pirate is facing
									window.doAction({type:'lostALife', playerId:window.playerId}, true);
								else
									window.doAction({type:'pushedBack', playerId:window.playerId, direction:this.pirate.mesh.rotation.z+Math.PI/2}, true);
							}else if (this.pirate.playerId == window.playerId)
							{
								for (var i in window.barrels)
								{
									if (closestObject == window.barrels[i])
										window.doAction({type:"explodeBarrel", barrelNumber:parseInt(i)}, true)
								}
							}
						}
					}else
					if (this.time > 1)
					{
						this.pirate.inAction = false;
						this.pirate.anims.currentAnimation = 'standing';
						window.removeAnimation(this);
					}
				}else
				if (this.actionType == 'block')
				{
					if (this.time > .1 && !this.startedBlock)
					{
						this.startedBlock = true;
						this.pirate.blocking = true;
					}else
					if (this.time > 1)
					{
						this.pirate.blocking = false;
						this.pirate.inAction = false;
						this.pirate.anims.currentAnimation = 'standing';
						window.removeAnimation(this);
					}
				}
			}
		});
	}
});