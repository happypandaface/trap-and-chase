window.directionalLight = new THREE.DirectionalLight(0xffffff);
actions.push({type:'fight',funct:function(action)
{// starts the fight screen, only one player needs to send this, no confirmation, that's how it works on the high seas
	window.gotoFight(action.place);
}});
window.getSortedPlayers = function()
{// sort the players alphabetically so that everyone has the same list, this is used to position players
	var sortedPlayers = window.players;
	sortedPlayers.sort(function(a,b){return a.playerId.valueOf()>b.playerId.valueOf()});
	return sortedPlayers;
}
/*
window.translateGamePosToRealPos = function(x, y, mesh)
{// because the rocking of the ship, the logical location of the player is different than the graphical position. (NOT TRUE ANYMORE BECAUSE OF 3D GROUPS)
	if (!mesh)
		return {x:x, y:mesh.position.y, z:y};
	else
		mesh.position.set(x,mesh.position.y,y);
}
*/
window.checkPossibleLocation = function(x, y, pirate)
{// check if a player can go to this location and if not try and return the closest spot they can go to.
	var posY = pirate.mesh.position.y;
	if (!pirate.ignoreWalkingMesh)
	{
		var vector = new THREE.Vector3(0, -3, 0).normalize();
		//vector.applyQuaternion(window.shipGroup.quaternion);
		var ray = new THREE.Raycaster( new THREE.Vector3(x, pirate.mesh.position.y, y), vector );
		//window.shipGroup
		var intersects = ray.intersectObjects( window.walkableMeshes );
		if (intersects.length == 0)
			return null;// if it doesn't intersect a walkable mesh, tell them they can't go there
		else
		{
			posY = intersects[0].point.y+3.4;
		}
	}
	for (var i in window.barrels)
	{
		var pos = new THREE.Vector2(x, y);
		var bar = new THREE.Vector2(window.barrels[i].x, window.barrels[i].y);
		if (pos.distanceTo(bar) < window.barrels[i].size)
		{
			// this means the point is in the barrel, return the nearest point on the barrel's perimeter
			bar.add(pos.sub(bar).normalize().multiplyScalar(window.barrels[i].size));
			return new THREE.Vector3(bar.x, posY, bar.y);
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
			if (window.solidObjects[i].hitBy)
			{
				var hit = window.solidObjects[i].hitBy(pirate);
				if (hit == "ignore")
					continue;
				else if (hit)
				{
					if (hit.returnNull)
						return null;
					return hit;
				}else
					return new THREE.Vector3(bar.x, posY, bar.y);
			}else
				return new THREE.Vector3(bar.x, posY, bar.y);
		}
	}
	return new THREE.Vector3(x, posY, y);
}
window.addThingsToLoad = function(thngs)
{
	window.thingsToLoad += thngs;
}
window.thingsWereLoaded = function(thngs)
{
	window.thingsLoaded += thngs;
	if (window.thingsLoaded == window.thingsToLoad)
		window.gameStarted = true;
}
window.gotoFight = function(place)
{// this sets up the fight, this needs to be changed so that it can be called multiple times, needs a destructor.
	if (window.currentRoom != "fightRoom")
	{
		window.getNPF("gotoCurrentRoom").roomFunctionName = "fight";
		window.getNPF("gotoCurrentRoom").fightPlace = place;
		window.currentRoom = "fightRoom";
		window.gameElement.children('#ui').empty();
		window.destroyScene();
		window.animationsToRemove = [];
		window.hittableObjects = [];
		window.pirates = [];
		window.parentGroup = null;
		window.solidObjects = [];
		window.barrels = [];
		window.gameStarted = false;
		
		window.traps = [];
		// these two variables allow the level js file to setup things to load like models and textures.
		window.thingsLoaded = 0;
		window.thingsToLoad = 0;
		window.scaleVector = null;// this allows specific locations to have different camera angles
		if (place == "ship")
			window.doShipFight();
		else if (place == "beach")
			window.doBeachFight();
		if (!window.scaleVector)
		{
			window.scaleVector = new THREE.Vector3(0,17, -15);
		}
		window.thingsWereLoaded(0);
		window.centerCamera = {scaleVector:window.scaleVector,update:function(dt)
		{
			var origin = new THREE.Vector3(0, 0, 0);
			if (window.gameStarted)
				if (window.startZoom > 1)
				{
					this.scaleVector.applyAxisAngle( new THREE.Vector3(0, 1, 0), dt*Math.PI*2/4 );
					window.startZoom -= 2*dt;
				}else
					window.startZoom = 1;
			if (!window.myPirate.leaveCamera)
			{
				window.camera.position = window.myPirate.mesh.position.clone().add(this.scaleVector.clone().multiplyScalar(window.startZoom));
				camera.lookAt(window.myPirate.mesh.position);
			}
		}}
		window.addAnimation(window.centerCamera);
		window.animationsToRemove.push(window.centerCamera);
		// pirate move speed
		window.moveSpeed = 5;
		window.posRefreshTime = .1;
		// initialize mouse so it doesn't throw errors before you move it.
		window.mouseX = 1;
		window.mouseY = 1;
		window.startZoom = 5;
		window.updateAnimation = {keyDown:[],time:0,update:function(dt)
		{
			if (!window.myPirate.frozen && window.gameStarted)
			{
				if (!this.lastX)
					this.lastX = window.myPirate.currX;
				if (!this.lastY)
					this.lastY = window.myPirate.currY;
				if (!window.myPirate.inAction && this.keyDown['space'])
				doAction({type:'pirateJump', playerId:window.playerId}, true);
				var camDir = window.myPirate.mesh.position.clone().sub(window.camera.position);
				var moveAngle = Math.atan2(camDir.z, camDir.x);
				window.myPirate.mesh.rotation.z = Math.atan2(window.mouseY/window.HEIGHT-.5, window.mouseX/window.WIDTH-.5)+moveAngle;
				var nextPos = new THREE.Vector2(0, 0);
				if (this.keyDown['w'])
					window.pushInDir(nextPos, moveAngle, dt*window.myPirate.dampenMovement);
				if (this.keyDown['a'])
					window.pushInDir(nextPos, moveAngle-Math.PI/2, dt*window.myPirate.dampenMovement);
				if (this.keyDown['s'])
					window.pushInDir(nextPos, moveAngle+Math.PI, dt*window.myPirate.dampenMovement);
				if (this.keyDown['d'])
					window.pushInDir(nextPos, moveAngle+Math.PI/2, dt*window.myPirate.dampenMovement);
				if (!window.myPirate.inAction)
				{
					if (nextPos.length() != 0)
						window.switchAnimation(window.myPirate.anims, 'walking');
					else
						window.switchAnimation(window.myPirate.anims, 'standing');
				}
				window.goDirection(nextPos, window.myPirate, 1);
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
						window.doAction({type:'updatePirate', playerId:window.playerId, direction:this.lastRotation, x:window.myPirate.currX, y:window.myPirate.mesh.position.y, z:window.myPirate.currY}, true, true);
					}
				}else
					this.time += dt;
			}
		}};
		window.addAnimation(window.updateAnimation);
		window.animationsToRemove.push(window.updateAnimation);
		window.keyLink = {w:87, a:65, s:83, d:68, space:32};
		window.switchKey = function(key, bool)
		{
			for (var i in window.keyLink)
			{
				if (key == window.keyLink[i])
				{
					window.updateAnimation.keyDown[i] = bool;
					break;
				}
			}
		}
		$(window).keydown(function(event)
		{
			if (!chatBox.find("input").is(":focus"))
			{
				window.switchKey(event.which, true);
			}
		});
		$(window).keyup(function(event)
		{
			if (!chatBox.find("input").is(":focus"))
			{
				window.switchKey(event.which, false);
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
		window.endingGame = false;
	}
}
window.pushInDir = function(next, angle, amount)
{
	next.x += window.moveSpeed*amount*Math.cos(angle);
	next.y += window.moveSpeed*amount*Math.sin(angle);
}
window.goDirection = function(dir, pirate, amount)
{
	var nextPos = window.checkPossibleLocation(pirate.mesh.position.x+dir.x*amount, pirate.mesh.position.z+dir.y*amount, pirate);
	if (nextPos != null)
	{
		pirate.currX = nextPos.x;
		pirate.currY = nextPos.z;
		pirate.mesh.position = nextPos;
	}
	//window.translateGamePosToRealPos(pirate.currX, pirate.currY, pirate.mesh);
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
window.getTrapById = function(id)
{
	for (var i in window.traps)
	{
		if (window.traps[i].id == id)
			return window.traps[i];
	}
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
		materials[3].morphTargets = true;
		materials[4].morphTargets = true;
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
			morphAnimations.animations['walking'] = {start:1,end:20,speed:1};
			morphAnimations.animations['fighting'] = {start:21,end:45,speed:1};
			morphAnimations.animations['blocking'] = {start:46,end:50,dontLoop:true,speed:1};
			morphAnimations.animations['standing'] = {start:51,end:60,speed:1};
			morphAnimations.animations['jumping'] = {start:61,end:80,speed:2};
			morphAnimations.currentAnimation = 'standing';
			morphs.push(morphAnimations);
			window.shipGroup.add( meshAnim2 );
			window.hittableObjects.push(meshAnim2);
			var pirate = {hp:3,anims:morphAnimations,playerId:id, mesh:meshAnim2, currX:meshAnim2.position.x, currY:meshAnim2.position.z};
			if (id == window.playerId)
				pirate.lose = window.iLost;
			pirate.dampenMovement = 1;
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