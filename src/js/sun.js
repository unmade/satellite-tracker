TRACKER.namespace('Sun');

TRACKER.Sun = (function() {
    'use strict';

    var Const = TRACKER.utils.Constants,
        CoordConverter = TRACKER.utils.CoordinateConverter,
        DateConverter = TRACKER.utils.DateConverter;

    function frac(f) {
        return f % 1;
    }

    var Sun = function(textures, color, scale) {
        var flareColor = new THREE.Color( 0xffffff );

        if (color) {
            flareColor.setHSL( color.h, color.s, color.l + 0.5 );
        }
        else {
            flareColor.setHSL( 0.55, 0.9, 0.5 + 0.5 );
        }

        this.light = new THREE.DirectionalLight( 0xffffff, 1 );
        this.lensFlare = new THREE.LensFlare( textures[0], 350, 0.0, THREE.AdditiveBlending, flareColor );
        this.lensFlare.add( textures[1], 512, 0.0, THREE.AdditiveBlending );
        this.lensFlare.add( textures[2], 60, 0.6, THREE.AdditiveBlending );
        this.lensFlare.add( textures[2], 70, 0.7, THREE.AdditiveBlending );
        this.lensFlare.add( textures[2], 120, 0.9, THREE.AdditiveBlending );
        this.lensFlare.add( textures[2], 70, 1.0, THREE.AdditiveBlending );
        this.lensFlare.customUpdateCallback = lensFlareUpdateCallback;
        this.scale = scale || 63.71;
    };

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

    Sun.prototype.sunEclipticPosition = function(date) {
        var tdb = DateConverter.utcToTdb(date),
            ts = (tdb - Const.MJD2000) / Const.JULIAN_C,
            u3 = Const.PI2 * frac(0.993133 + 99.997361*ts);

        var l = Const.PI2 * frac(0.7859453 + u3/Const.PI2 +
                        (6893.0*Math.sin(u3) + 72.0*Math.sin(2*u3) + 6191.2 * ts) / 1296.0e3);
        var b = 0;
        var r = 1.0001398 + 1.0e-6 *
                    ((-16707.37 + 42.04*ts) * Math.cos(u3) - 139.57*Math.cos(2*u3) +
                      30.76*Math.cos(Const.PI2*frac(0.8274+1236.8531*ts)));

        return {
            lambda: l,
            betta: b,
            range: r * Const.AU
        };
    }

    Sun.prototype.position = function(date) {
        var tdb = DateConverter.utcToTdb(date),
            eclPos = this.sunEclipticPosition(date),
            equPos = CoordConverter.eclipSpherToEquCart(tdb, eclPos.lambda, eclPos.betta, eclPos.range);

        return new THREE.Vector3(equPos.x, equPos.z, -equPos.y).divideScalar(this.scale);
    }

    Sun.prototype.propagate = function(date) {
        var p = this.position(date);

        this.lensFlare.position.copy(p);
        this.light.position.copy(p);

        return p;
    }

    return Sun;

})();
