window.EnemyFactory = function()
{
	this.makeBandit = function(mesh, id)
	{
		var bandit = 
		{
			mesh:mesh,
			id:id,
			aggroRange: 12,
			aggro:function(pirate)
			{
				if (!this.aggroed)
				{
					doAction({type:"aggroEnemy", enemyId:id, playerId:pirate.playerId}, true);
				}
			}
		}
		var morphAnimations = {morph:mesh,animations:[],totalFrames:111,speed:.60};
		mesh.duration = morphAnimations.totalFrames*1000;
		morphAnimations.animations['running'] = {start:1,end:20,speed:1};
		morphAnimations.animations['fighting'] = {start:21,end:45,speed:1};
		morphAnimations.animations['blocking'] = {start:46,end:50,dontLoop:true,speed:1};
		morphAnimations.animations['standing'] = {start:51,end:60,speed:1};
		morphAnimations.animations['jumping'] = {start:61,end:80,speed:2};
		morphAnimations.currentAnimation = 'running';
		bandit.morphAnimations = morphAnimations;
		bandit.isEnemy = true;
		bandit.dampenMovement = 1;
		return bandit;
	}
	return this;
}();
window.actions.push(
{
	type:"aggroEnemy",
	funct:function(action)
	{
		var bandit = window.getEnemy(action.enemyId);
		var pirate = window.getPirateByPlayerId(action.playerId);
		bandit.aggroed = true;
		window.addAnimation(
		{
			bandit:bandit,
			pirate:pirate,
			update:function(dt)
			{
				var vec = this.pirate.mesh.position.clone().sub(this.bandit.mesh.position);
				var dist = vec.length();
				if (dist < this.bandit.aggroRange)
				{
					vec.normalize();
					vec.multiplyScalar(5*dt);
					if (!this.bandit.frozen)
						window.goDirection(new THREE.Vector2(vec.x, vec.z), this.bandit, this.bandit.dampenMovement);
				}else
				{
					this.bandit.aggroed = false;
					window.removeAnimation(this);
				}
			}
		});
	}
});