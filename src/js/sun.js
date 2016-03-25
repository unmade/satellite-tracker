'use strict';


TRACKER.namespace('sun');


TRACKER.sun = (function() {
    var textureLoader = new THREE.TextureLoader(),
        textureFlare0 = textureLoader.load( "/src/images/lensflare/lensflare0.png" ),
        textureFlare2 = textureLoader.load( "/src/images/lensflare/lensflare2.png" ),
        textureFlare3 = textureLoader.load( "/src/images/lensflare/lensflare3.png" );

    var lensFlare,
        light;

    addLight( 0.55, 0.9, 0.5, 5000, 0, 5000 );

	function addLight( h, s, l, x, y, z ) {
		light = new THREE.DirectionalLight( 0xffffff, 1 );
		light.position.set( x, y, z );

		var flareColor = new THREE.Color( 0xffffff );
		flareColor.setHSL( h, s, l + 0.5 );
		lensFlare = new THREE.LensFlare( textureFlare0, 350, 0.0, THREE.AdditiveBlending, flareColor );
		lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
		lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
		lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
		lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
		lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );
		lensFlare.customUpdateCallback = lensFlareUpdateCallback;
		lensFlare.position.set( x, y, z );
	}

    function lensFlareUpdateCallback( object ) {
		var f, fl = object.lensFlares.length;
		var flare;
		var vecX = -object.positionScreen.x * 2;
		var vecY = -object.positionScreen.y * 2;
		for( f = 0; f < fl; f++ ) {
			flare = object.lensFlares[ f ];
			flare.x = object.positionScreen.x + vecX * flare.distance;
			flare.y = object.positionScreen.y + vecY * flare.distance;
			flare.rotation = 0;
		}
		object.lensFlares[ 2 ].y += 0.025;
		object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );
	}

    return {
        light: light,
        lensFlare: lensFlare
    }

})();
