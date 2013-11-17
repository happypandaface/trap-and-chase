actions.push({type:'fight',funct:function(action)
{
	if (window.playerId == action.from ||
		window.playerId == action.to)
		window.gotoFight();
}});
window.gotoFight = function()
{
	window.gameElement.children('#ui').empty();
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
    } );
}