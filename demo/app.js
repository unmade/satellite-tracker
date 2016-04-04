$(document).ready(function() {
	'use strict';

	var loaders = TRACKER.utils.Loaders,
		player = TRACKER.Player;

	var width  = window.innerWidth,
		height = window.innerHeight;

	var tle = {
		elektro1: {
			"line1": "1 37344U 11001A   16089.08445441 -.00000109  00000-0  00000+0 0  9998",
			"line2": "2 37344   1.5488  79.7204 0004243 185.3717  28.4035  1.00272932 19045"
		},
		elektro2: {
			"line1": "1 41105U 15074A   16088.85108008 -.00000125  00000-0  00000+0 0  9999",
			"line2": "2 41105   0.2520 277.8033 0001441 151.5660 141.5013  1.00274042  1091"
		},
		spektrr: {
			line1: "1 37755U 11037A   16091.41028187 -.00007822  00000-0  00000+0 0  9996",
			line2: "2 37755  38.8255  45.7767 9318024 260.5904   2.5200  0.11364580  2019"
		},
		iss: {
			"line1": "1 25544U 98067A   16087.52161653  .00004158  00000-0  69668-4 0  9998",
			"line2": "2 25544  51.6430 105.3354 0002084   2.4544 144.7923 15.54266717992278"
		}
	};

	var scale = 63.71,
		now = new Date('2011-03-18T05:17:00'),
		nnow,
		i = 0,
		moonPosition;

	var	earth,
		moon,
		sun,
		milkyway,
		elektro1,
		elektro2;

	var camera,
		scene,
		renderer,
		controls;

	init();


	function init() {
		var assets = {},
			earthRadius = 6371 / scale,
			moonRadius = 1738.14 / scale,
			position,
			webglEl = document.getElementById('scene');

		player.init({
			date: new Date(),
			callback: propagate
		});

		camera = new THREE.PerspectiveCamera(20, width / height, 1, 1e10);
		camera.up = new THREE.Vector3( 0, 1, 0 );

		scene = new THREE.Scene();
		// x: red, y: green, z: blue
		var axisHelper = new THREE.AxisHelper( 1000 );
		// scene.add( axisHelper );

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
		renderer.setPixelRatio(window.devicePixelRatio || 1);
		renderer.setSize(width, height);
		renderer.setClearColor(0x000000, 1);
		webglEl.appendChild(renderer.domElement);

		controls = new THREE.TrackballControls(camera, document.getElementById('scene'));
		controls.minDistance = 300;
		controls.maxDistance = 1e10;

		window.addEventListener( 'resize', onWindowResize, false );

		var onLoad = function() {
			sun = new TRACKER.Sun([assets.lensflare0, assets.lensflare2, assets.lensflare3]);
			milkyway = TRACKER.milkyway;

			earth = new TRACKER.CelestialObject({
				diffuse: assets.earthDay,
				diffuseNight: assets.earthNight,
				diffuseSpecular: assets.earthSpecular
			});

			moon = new TRACKER.CelestialObject({
				diffuse: assets.moon,
				diffuseNight: assets.moonNight,
				diffuseSpecular: assets.moonSpecular
			});

			assets.elektro.scale.set(1e-3, 1e-3, 1e-3);
			elektro1 = new TRACKER.Satellite(tle.elektro1, scale, assets.elektro.clone());
		    elektro2 = new TRACKER.Satellite(tle.elektro2, scale, assets.elektro.clone());

			position = elektro1.propagate(player.date);
			elektro2.propagate(player.date);

			camera.position.copy(position).multiplyScalar(1.05);

			var lightPosition = sun.propagate(player.date);
			earth.lightPosition(lightPosition);

			moonPosition = TRACKER.MoonPosition.getEquatorialPosition(player.date).divideScalar(63.71);
			moon.lightPosition(lightPosition);
			moon.position(moonPosition);

			var angle = TRACKER.utils.CoordinateConverter.getGMST(player.date);
			earth.rotateY(angle);
			moon.rotateY(angle);

			// earth.ground.add(camera);

			scene.add(earth.ground);
			scene.add(earth.sky);
			scene.add(moon.ground);
			scene.add(moon.sky);
			scene.add(elektro1.object3d);
			scene.add(elektro2.object3d);
			scene.add(sun.lensFlare);
			scene.add(sun.light);
			scene.add(new THREE.AmbientLight(0x111111));

			animate();
			updateDate();
		};

		$.when(
			loaders.defferedTextureLoader(assets, 'earthDay', '/src/images/earth/diffuse-low.jpg'),
			loaders.defferedTextureLoader(assets, 'earthNight', '/src/images/earth/diffuse-night-low.jpg'),
			loaders.defferedTextureLoader(assets, 'earthSpecular', '/src/images/earth/diffuse-specular-low.png'),
			loaders.defferedTextureLoader(assets, 'lensflare0', '/src/images/lensflare/lensflare0.png'),
			loaders.defferedTextureLoader(assets, 'lensflare2', '/src/images/lensflare/lensflare2.png'),
			loaders.defferedTextureLoader(assets, 'lensflare3', '/src/images/lensflare/lensflare3.png'),
			loaders.defferedTextureLoader(assets, 'moon', '/src/images/moon/moon-low.jpg'),
			loaders.defferedTextureLoader(assets, 'moonNight', '/src/images/earth/default-night.jpg'),
			loaders.defferedTextureLoader(assets, 'moonSpecular', '/src/images/earth/default-specular.png'),
			loaders.defferedOBJMTLLoader(assets, 'elektro', '/src/obj/elektro.obj', '/src/obj/Elektro.mtl')
		)
		.then(function() {
			onLoad();
		});
	}


	function updateDate() {
		setTimeout(function() {
			requestAnimationFrame(updateDate);
		}, (player.play && player.speed === 1000) ? 1000 : 0);
		player.date = new Date(player.date.getTime() + player.speed);
		player.updateHover();
	}

    function propagate() {
		i++;

		var position = elektro1.propagate(player.date);
		elektro2.propagate(player.date);

		moonPosition = TRACKER.MoonPosition.getEquatorialPosition(player.date).divideScalar(63.71);
		moon.position(moonPosition);

		var lightPosition = sun.propagate(player.date);
		earth.lightPosition(lightPosition);

		var angle = TRACKER.utils.CoordinateConverter.getGMST(player.date);
		earth.rotateY(angle);
		moon.rotateY(angle);

		$('#propagation_date').text(player.date.toUTCString());
    }


	function animate() {
		requestAnimationFrame( animate );

		if (player.play && player.speed != 1) {
			propagate();
		}

		render();
	}

	function render() {
		controls.update();

        var cameraHeight = camera.position.length(),
			cameraHeight2 = cameraHeight * cameraHeight;

        earth.sky.material.uniforms.fCameraHeight.value = cameraHeight;
        earth.sky.material.uniforms.fCameraHeight2.value = cameraHeight2;
        earth.ground.material.uniforms.fCameraHeight.value = cameraHeight;
        earth.ground.material.uniforms.fCameraHeight2.value = cameraHeight2;

		moon.ground.material.uniforms.fCameraHeight.value = cameraHeight;
        moon.ground.material.uniforms.fCameraHeight2.value = cameraHeight2;
		moon.sky.material.uniforms.fCameraHeight.value = cameraHeight;
        moon.sky.material.uniforms.fCameraHeight2.value = cameraHeight2;

        return renderer.render(scene, camera);
	}

    function onWindowResize() {
		player.updateScale(player.range, $(document).width());
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

});
