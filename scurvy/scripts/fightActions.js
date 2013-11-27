actions.push({
	type:"bearTrap",
	subType:["fightRoom"],
	funct:function(action){
		var trap = window.getTrapById(action.trapId);
		trap.sprung = true;
		window.switchAnimation(trap.ani, 'spring');
		var pirate = window.getPirateByPlayerId(action.playerId);
		pirate.dampenMovement = 0;
		pirate.mesh.position.x = trap.mesh.position.x;
		pirate.currX = trap.mesh.position.x;
		pirate.mesh.position.z = trap.mesh.position.z;
		pirate.currY = trap.mesh.position.z;
		window.addAnimation({time:0,pirate:pirate,update:function(dt)
		{
			this.time += dt;
			if (this.time > 2)
			{
				this.pirate.dampenMovement = 1;
				window.removeAnimation(this);
			}
		}});
	}
});
actions.push({
	type:"pirateThrown",
	subType:["fightRoom"],
	funct:function(action){
		var pirate = window.getPirateByPlayerId(action.playerId);
		window.removeAnimationFunct(function(anim){
			if (anim.pirate && anim.pirate.playerId == action.playerId)
			{
				return true;
			}
		});
		pirate.inAction = true;
		pirate.dampenMovement = 0;
		var mag = (5-action.distToGuy)/5;
		if (mag > .2)
			pirate.ignoreWalkingMesh = true;
		window.switchAnimation(pirate.anims, 'jumping');
		window.addAnimation({type:"pirateThrow",time:0,pirate:pirate,mag:mag+.5,dir:action.dir,update:function(dt){
			window.switchAnimation(this.pirate.anims, 'jumping');
			this.pirate.mesh.position.y = -3 + this.mag*6*Math.sin(this.time*Math.PI/this.mag);
			window.goDirection(this.dir, this.pirate, this.mag*10*dt);
			this.time += dt;
			if (this.time > this.mag)
			{
				this.pirate.mesh.position.y = -3;
				this.pirate.dampenMovement = 1;
				this.pirate.inAction = false;
				if (this.pirate.ignoreWalkingMesh && this.pirate.playerId == window.playerId)
					window.doAction({type:'lostALife', playerId:window.playerId}, true);
				this.pirate.ignoreWalkingMesh = false;
				if (this.pirate.playerId == window.playerId && window.checkPossibleLocation(this.pirate.currX, this.pirate.currY, this.pirate) == null)
					doAction({type:"pirateRingOut", playerId:this.pirate.playerId}, true);
				window.removeAnimation(this);
			}
		}});
	}
});
actions.push({
	type:"pirateJump",
	subType:["fightRoom"],
	funct:function(action){
		var pirate = window.getPirateByPlayerId(action.playerId);
		pirate.inAction = true;
		pirate.ignoreWalkingMesh = true;
		window.addAnimation({type:"pirateJump",startY:pirate.mesh.position.y,time:0,pirate:pirate,update:function(dt){
			window.switchAnimation(this.pirate.anims, 'jumping');
			this.pirate.mesh.position.y = this.startY + 4*Math.sin(this.time*Math.PI/.7);
			this.time += dt;
			if (this.time > .7)
			{
				this.pirate.mesh.position.y = this.startY;
				this.pirate.ignoreWalkingMesh = false;
				this.pirate.inAction = false;
				if (this.pirate.playerId == window.playerId && window.checkPossibleLocation(this.pirate.currX, this.pirate.currY, this.pirate) == null)
					doAction({type:"pirateRingOut", playerId:this.pirate.playerId}, true);
				window.removeAnimation(this);
			}
		}});
	}
});
actions.push(
	{type:"pirateRingOut",
	funct:function(action)
	{
		var pirate = window.getPirateByPlayerId(action.playerId);
		pirate.inAction = true;
		pirate.ignoreWalkingMesh = false;
		pirate.leaveCamera = true;
		window.switchAnimation(pirate.anims, 'jumping');
		window.addAnimation({type:"pirateOut",time:0,startY:pirate.mesh.position.y,pirate:pirate,update:function(dt){
			window.switchAnimation(this.pirate.anims, 'jumping');
			this.pirate.mesh.position.y = this.startY +5*(-(this.time+1)*(this.time+1)+1);
			this.time += dt;
			if (this.time > .5 && !this.madeSplash)
			{
				this.madeSplash = true;
				var splashTex = new THREE.ImageUtils.loadTexture("splashTex.png");
				this.splashAnimator = new TextureAnimator( splashTex, 4, 1, 4, 55 ); // texture, #horiz, #vert, #total, duration.
				window.addAnimatedTexture(this.splashAnimator);
				this.splashMaterial = (new THREE.MeshBasicMaterial({map:splashTex, transparent: true}));
				this.splashMesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), this.splashMaterial);
				this.splashMeshPos = this.pirate.mesh.position.clone().add(new THREE.Vector3(0,-3,0));
				this.splashMesh.position = this.splashMeshPos;
				this.splashMesh.rotation.x = 0;
				this.splashMesh.scale.y = 6;
				window.shipGroup.add(this.splashMesh);
			}else
			if (this.time > 1.5)
			{
				doAction({type:"pirateDead", playerId:pirate.playerId, ownAnimation:true}, true);
				window.scene.remove(this.splashMesh);
				window.removeAnimatedTexture(this.splashAnimator);
				window.removeAnimation(this);
			}else
			if (this.time > .5 && this.madeSplash)
			{
				this.splashMesh.position = this.splashMeshPos;
				this.splashMesh.position.y += Math.sin((this.time-.5)*Math.PI*2);
				this.splashMaterial.opacity = 1-(this.time-.5);
			}
		}});
	}
});
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
			dest:new THREE.Vector3(action.x, action.y, action.z),
			dist:new THREE.Vector3(action.x, action.y, action.z).sub(pirate.mesh.position),
			direction:action.direction,
			rotDist:dist,
			speed:speed,
			special:action.special,
			update:function(delta)
			{
				this.time += delta;
				if (this.time > this.speed)
				{
					this.pirate.mesh.rotation.z = this.direction;
					this.pirate.mesh.position = this.dest;
					if (!this.pirate.inAction)
						window.switchAnimation(this.pirate.anims, 'standing');
					window.removeAnimation(this);
				}else
				{
					if (this.distX != 0 || this.distY != 0)
					{
						if (!this.pirate.inAction)
							this.pirate.anims.currentAnimation = 'walking';
						this.pirate.mesh.position.add(this.dist.clone().multiplyScalar(delta/this.speed));
					}
					this.pirate.mesh.rotation.z += this.rotDist*(delta/this.speed);
					//window.translateGamePosToRealPos(this.pirate.currX, this.pirate.currY, this.pirate.mesh);
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
		var dir = new THREE.Vector2(Math.cos(action.direction), Math.sin(action.direction));
		window.addAnimation({
			type:'piratePushedBack',
			pirate:pirate,
			time:0,
			direction:dir,
			strength:strength,
			update:function(delta)
			{
				this.time += delta;
				window.goDirection(this.direction, this.pirate, this.strength*delta);
				if (this.time > .8)
				{
					if (!this.pirate.dead)
					{
						this.pirate.blocking = false;
						this.pirate.inAction = false;
						window.switchAnimation(this.pirate.anims, 'standing');
						this.pirate.frozen = false;
					}
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
		window.switchAnimation(pirate.anims, 'standing');
		pirate.dead = true;
		pirate.frozen = true;
		if (!action.ownAnimation)
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
								{
									window.doAction({type:'pushedBack', playerId:window.playerId, direction:this.pirate.mesh.rotation.z+Math.PI/2}, true);
									window.doAction({type:'lostALife', playerId:window.playerId}, true);
								}else
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
						window.switchAnimation(this.pirate.anims, 'standing');
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
						window.switchAnimation(this.pirate.anims, 'standing');
						window.removeAnimation(this);
					}
				}
			}
		});
	}
});