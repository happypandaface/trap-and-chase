
	/*
	loader.load( "threejsTest.js", function( geometry, materials ) {
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
    } );*/
	window.gotoMap = function()
	{
		$('div#nav').remove();
		var nav = $("<div id=nav class=map></div>");
		nav.css('position', 'absolute');
		nav.css('left', '0');
		nav.css('padding', '10');
		nav.css('margin', '10');
		nav.css('top', '0');
		nav.css('height', '300');
		nav.css('width', '150');
		nav.css('background-color', '#C40020');
		nav.append("<button class=nav id=london>London</button>");
		nav.append("<button class=nav id=normandy>Normandy</button>");
		nav.append("<button class=nav id=tortuga>Tortuga</button>");
		nav.append("<button class=nav id=portRoyal>Port Royal</button>");
		bindButtons(nav);
		$('body').append(nav);
	}
	window.gotoLocation = function(location)
	{
		$('div#nav').remove();
		var townNav = $("<div id=nav class=nav></div>");
		townNav.css('position', 'absolute');
		townNav.css('left', '0');
		townNav.css('padding', '10');
		townNav.css('margin', '10');
		townNav.css('top', '0');
		townNav.css('height', '300');
		townNav.css('width', '150');
		townNav.css('background-color', '#C40020');
		townNav.append("<button class=nav id=tavern>Tavern</button>");
		townNav.append("<button class=nav id=shop>Shop</button>");
		townNav.append("<button class=nav id=tortuga>Tortuga</button>");
		townNav.append("<button class=nav id=portRoyal>Port Royal</button>");
	}
	window.confirmAction = function(action, backAction, text)
	{
		bindButtons($('div#nav'), true);
		var confirm = $("<div class=dialogue id=nav></div>");
		confirm.css('position', 'absolute');
		confirm.css('left', '200');
		confirm.css('top', '150');
		confirm.css('padding', '10');
		confirm.css('height', '100');
		confirm.css('width', '200');
		confirm.css('text-align', 'center');
		confirm.html(text+"<br/><button class=nav id=yes>Yes</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button class=nav id=no>No</button>");
		confirm.find('button#yes').mouseup(function(event)
		{
			window.doAction(action, true);
		});
		confirm.find('button#no').mouseup(function(event)
		{
			window.doAction(backAction, true);
		});
		confirm.css('background-color', '#C40020');
		$('body').append(confirm);
	}
	window.bindButtons = function(element, off)
	{
		if (!off)
		{
			element.find('button.nav').mouseover(function(event)
			{
				window.doAction({type:'mouseover', buttonId:$(this).attr('id')}, true);
			});
			element.find('button.nav').mouseout(function(event)
			{
				window.doAction({type:'mouseout', buttonId:$(this).attr('id')}, true);
			});
			element.find('button.nav').mouseup(function(event)
			{
				window.doAction({type:'mouseup', buttonId:$(this).attr('id')}, true);
			});
		}else
		{
			$('div#nav').find('button.nav').off('mouseover');
			$('div#nav').find('button.nav').off('mouseout');
			$('div#nav').find('button.nav').off('mouseup');
		}
	}
	actions.push({
		type:"mouseover",
		funct:function(action){
			$('button#'+action.buttonId).css('background-color', '#8888ff');
		}
	});
	actions.push({
		type:"mouseout",
		funct:function(action){
			$('button#'+action.buttonId).css('background-color', '#ffaaaa');
		}
	});
	actions.push({
		type:"mouseup",
		funct:function(action){
			var button = $('#'+action.buttonId);
			if (button.parent().hasClass('map'))
				confirmAction({type:"travel", location:action.buttonId}, {type:"gotoMap"}, "Travel to "+$('button#'+action.buttonId).html()+" ?");
		}
	});
	actions.push({
		type:"gotoMap",
		funct:function(action){
			gotoMap();
		}
	});
	actions.push({
		type:"travel",
		funct:function(action){
			gotoLocation(action.location);
		}
	});