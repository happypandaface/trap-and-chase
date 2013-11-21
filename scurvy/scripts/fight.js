window.directionalLight = new THREE.DirectionalLight(0xffffff);
actions.push({type:'fight',funct:function(action)
{// starts the fight screen, only only player needs to send this, no confirmation, that's how it works on the high seas
	if (window.playerId == action.from ||
		window.playerId == action.to)
		window.gotoFight();// this is wrong, all players should gotoFight actually
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
	var ray = new THREE.Raycaster( new THREE.Vector3(x, -3, y), new THREE.Vector3(0, -3, 0).normalize() );
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
	return {x:x, y:y};
}
window.gotoFight = function()
{// this sets up the fight, this needs to be changed so that it can be called multiple times, needs a destructor.
	window.gameElement.children('#ui').empty();
	window.destroyScene();
	var notPastMine = 1;
	for (var i in window.players)
	{
		var healthBar = $('<div class=healthBar></div>');
		for (var c = 0; c < 3; ++c){
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
	window.directionalLight.position.set(1, 1, 1).normalize();
	window.scene.add(directionalLight);
	var light = new THREE.AmbientLight( 0x404040 );
	window.scene.add(light);
	window.camera.position.set(0,20, 7);
    camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
	window.hittableObjects = [];
	loader.load( "pirate.js", function( geometry, materials ) {
		geometry.computeMorphNormals();
		materials[0].morphTargets = true;
		materials[1].morphTargets = true;
		materials[2].morphTargets = true;
		var material = new THREE.MeshFaceMaterial( materials );
		window.pirates = [];
		window.getSortedPlayers();
		for (var i in window.players)
		{
			var meshAnim2 = new THREE.MorphAnimMesh( geometry, material );
			meshAnim2.scale.set( 1, 1, 1 );
			meshAnim2.rotation.x = Math.PI/2;
			meshAnim2.position.set(2+parseInt(i),-3,-5);
			var morphAnimations = {morph:meshAnim2,animations:[],totalFrames:60,speed:.45};
			morphAnimations.animations['walking'] = {start:1,end:20};
			morphAnimations.animations['fighting'] = {start:21,end:45};
			morphAnimations.animations['blocking'] = {start:46,end:50,dontLoop:true};
			morphAnimations.animations['standing'] = {start:51,end:60};
			morphAnimations.currentAnimation = 'standing';
			morphs.push(morphAnimations);
			scene.add( meshAnim2 );
			window.hittableObjects.push(meshAnim2);
			var pirate = {hp:3,anims:morphAnimations,playerId:window.players[i].playerId, mesh:meshAnim2, currX:meshAnim2.position.x, currY:meshAnim2.position.z};
			if (window.players[i].playerId == window.playerId)
				pirate.lose = window.iLost;
			window.pirates.push(pirate);
		}
		window.myPirate = window.getPirateByPlayerId(window.playerId);
    } );
	window.barrels = [{x:2,y:0,size:1.5}];
	loader.load( "pirateBarrel.js", function( geometry, materials ) {
		var material = new THREE.MeshFaceMaterial( materials );
		for (var i in window.barrels)
		{
			var meshAnim2 = new THREE.Mesh( geometry, material );
			meshAnim2.scale.set( 1, 1, 1 );
			meshAnim2.position.set(	window.barrels[i].x,-4,	window.barrels[i].y);
			scene.add( meshAnim2 );
			window.hittableObjects.push(meshAnim2);
			window.barrels[i].mesh = meshAnim2;
		}
    } );
	loader.load( "pirateShip.js", function( geometry, materials ) {
		var material = new THREE.MeshFaceMaterial( materials );
		var meshAnim2 = new THREE.Mesh( geometry, material );
		meshAnim2.position.set(0,-12,0);
		meshAnim2.scale.set( 2, 2, 2 );
		window.walkableMeshes = [meshAnim2];
		window.scene.add(meshAnim2);
    } );
	// pirate move speed
	window.moveSpeed = 5;
	window.posRefreshTime = .1;
	// initialize mouse so it doesn't throw errors before you move it.
	window.mouseX = 1;
	window.mouseY = 1;
	window.updateAnimation = {keyDown:[],time:0,update:function(dt)
	{
		if (!window.myPirate.frozen)
		{
			var elem = window.renderer.domElement, 
				boundingRect = elem.getBoundingClientRect(),
				x = (window.mouseX - boundingRect.left) * (elem.width / boundingRect.width),
				y = (window.mouseY - boundingRect.top) * (elem.height / boundingRect.height);
			var vector = new THREE.Vector3( 
				( x / WIDTH ) * 2 - 1, 
				- ( y / HEIGHT ) * 2 + 1, 
				0.5 
			);
			projector.unprojectVector( vector, camera );
			var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
			var intersects = ray.intersectObject( window.mousePlane );
			if (intersects.length > 0)
			{
				var point = intersects[0].point;
				var diff = window.myPirate.mesh.position.clone().sub(point);
				window.myPirate.mesh.rotation.z = Math.atan2(diff.z, diff.x)+Math.PI/2;
			}
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
		window.mouseX = e.clientX;
		window.mouseY = e.clientY;
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
	window.mousePlane = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshNormalMaterial());
	window.mousePlane.position.set(0,-6,0);
	window.mousePlane.rotation.x = -Math.PI/2;
	//window.mousePlane.visible = false;
	window.scene.add(window.mousePlane);
	window.endingGame = false;
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
							window.removeAnimation(window.updateAnimation);
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
						var pLocal = new THREE.Vector3( 0, 1, 0 );
						var pWorld = pLocal.applyMatrix4( this.pirate.mesh.matrixWorld );
						var dir = pWorld.sub( this.pirate.mesh.position ).normalize();
						var ray = new THREE.Raycaster( this.pirate.mesh.position, dir );
						var intersects = ray.intersectObjects( window.hittableObjects );
						if (intersects.length > 0)
						{
							if (intersects[0].distance < 5)
							{
								var objHit = window.getHittableObjectByFunct(function(obj)
								{
									if (obj.mesh == intersects[0].object)
										return true;
								});
								if (objHit)
								{
									if (this.pirate.playerId != window.playerId &&
										objHit.playerId == window.playerId)
									{
										if (!objHit.blocking)// eventually calculate direction the pirate is facing
											window.doAction({type:'lostALife', playerId:window.playerId}, true);
										else
											window.doAction({type:'pushedBack', playerId:window.playerId, direction:this.pirate.mesh.rotation.z+Math.PI/2}, true);
									}
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