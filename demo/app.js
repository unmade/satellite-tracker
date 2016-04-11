$(document).ready(function() {
	'use strict';

	var CoordinateConverter = TRACKER.utils.CoordinateConverter,
		loaders = TRACKER.utils.Loaders,
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
		i = 0,
		yAxis = new THREE.Vector3(0, 1, 0);

	var	earth,
		moon,
		sun,
		elektro1,
		elektro2,
		spektr;

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
			onDateChangeCallback: propagate,
			toggleCoordinatesCallback: toggleCoordinates,
			changeCameraViewCallback: changeCameraView,
			snapshotCallback: makeSnapshot
		});

		camera = new THREE.PerspectiveCamera(20, width / height, 1, 1e10);
		camera.up = new THREE.Vector3( 0, 1, 0 );

		scene = new THREE.Scene();
		// x: red, y: green, z: blue
		var axisHelper = new THREE.AxisHelper( 1000 );
		// scene.add( axisHelper );

		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			preserveDrawingBuffer: true
		});
		renderer.setPixelRatio(window.devicePixelRatio || 1);
		renderer.setSize(width, height);
		renderer.setClearColor(0x000000, 1);
		webglEl.appendChild(renderer.domElement);

		controls = new THREE.TrackballControls(camera, document.getElementById('scene'));
		controls.minDistance = 200;
		controls.maxDistance = 1e10;

		window.addEventListener( 'resize', onWindowResize, false );

		var onLoad = function() {
			sun = new TRACKER.Sun([assets.lensflare0, assets.lensflare2, assets.lensflare3]);

			earth = new TRACKER.CelestialObject({
				diffuse: assets.earth,
				diffuseNight: assets.earthNight,
				diffuseSpecular: assets.earthSpecular
			});

			moon = new TRACKER.CelestialObject({
				diffuse: assets.moon,
				diffuseNight: assets.moonNight,
				diffuseSpecular: assets.moonSpecular
			});

			// assets.elektro.scale.set(1e-3, 1e-3, 1e-3);
			assets.spektr.scale.set(9e-4, 9e-4, 9e-4);
			elektro1 = new TRACKER.Satellite(tle.elektro1, scale, assets.elektro.clone());
		    elektro2 = new TRACKER.Satellite(tle.elektro2, scale, assets.elektro.clone());
		    spektr = new TRACKER.Satellite(tle.spektrr, scale, assets.spektr.clone());

			var angle = CoordinateConverter.getGMST(player.date)
			camera.position.copy(elektro2.position(player.date).applyAxisAngle(yAxis, -angle)).multiplyScalar(1.05);

			scene.add(earth.ground);
			scene.add(earth.sky);
			scene.add(moon.ground);
			scene.add(moon.sky);
			scene.add(elektro1.object3d);
			scene.add(elektro2.object3d);
			scene.add(spektr.object3d);
			scene.add(sun.lensFlare);
			scene.add(sun.light);
			scene.add(new THREE.AmbientLight(0x111111));

			animate();
			updateDate();
		};

		$.when(
			loaders.defferedTextureLoader(assets, 'earth', '/dist/images/textures/earth/diffuse-2k.jpg'),
			loaders.defferedTextureLoader(assets, 'earthNight', '/dist/images/textures/earth/diffuse-night-2k.jpg'),
			loaders.defferedTextureLoader(assets, 'earthSpecular', '/dist/images/textures/earth/diffuse-specular-2k.png'),
			loaders.defferedTextureLoader(assets, 'lensflare0', '/dist/images/textures/lensflare/lensflare0.png'),
			loaders.defferedTextureLoader(assets, 'lensflare2', '/dist/images/textures/lensflare/lensflare2.png'),
			loaders.defferedTextureLoader(assets, 'lensflare3', '/dist/images/textures/lensflare/lensflare3.png'),
			loaders.defferedTextureLoader(assets, 'moon', '/dist/images/textures/moon/moon-2k.jpg'),
			loaders.defferedTextureLoader(assets, 'moonNight', '/dist/images/textures/earth/default-night.jpg'),
			loaders.defferedTextureLoader(assets, 'moonSpecular', '/dist/images/textures/earth/default-specular.png'),
			loaders.defferedOBJMTLLoader(assets, 'elektro', '/dist/obj/Aura_27.obj', '/dist/obj/Aura_27.mtl'),
			loaders.defferedOBJMTLLoader(assets, 'spektr', '/dist/obj/jason-1_final.obj', '/dist/obj/jason-1_final.mtl')
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

		var angle = CoordinateConverter.getGMST(player.date),
			lightPosition = sun.propagate(player.date),
			moonPosition = TRACKER.MoonPosition.getEquatorialPosition(player.date).divideScalar(63.71),
			position = elektro1.propagate(player.date);

		elektro2.propagate(player.date);
		spektr.propagate(player.date);

		if (player.coordinateSystem === 'heliocentric') {
			earth.rotateY(angle);
			earth.lightPosition(lightPosition);
			moon.position(moonPosition);
			moon.lightPosition(lightPosition);
			moon.rotateY(angle);
		}
		if (player.coordinateSystem === 'geocentric') {
			lightPosition = lightPosition.applyAxisAngle(yAxis, -angle);
			earth.lightPosition(lightPosition);
			elektro1.rotateY(-angle);
			elektro2.rotateY(-angle);
			spektr.rotateY(-angle);
			moon.position(moonPosition.applyAxisAngle(yAxis, -angle));
			moon.lightPosition(lightPosition);
			sun.rotateY(-angle);
		}

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

        renderer.render(scene, camera);
	}

    function onWindowResize() {
		player.updateScale(player.range, window.innerWidth);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
		controls.handleResize();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

	function toggleCoordinates() {
		var angle = CoordinateConverter.getGMST(player.date);
		if (player.coordinateSystem === 'heliocentric') {
			elektro1.rotateY(0);
			elektro2.rotateY(0);
			spektr.rotateY(0);
			sun.rotateY(0);
			controls.object.position.applyAxisAngle(yAxis, angle);
		}
		if (player.coordinateSystem === 'geocentric') {
			earth.rotateY(0);
			moon.rotateY(0);
			controls.object.position.applyAxisAngle(yAxis, -angle);
		}
	}

	function changeCameraView() {
		var setCameraTo = $(this).attr('set-camera-to');
		if (setCameraTo === 'earth') {
			controls.target = earth.position();
			controls.minDistance = 200;
			controls.maxDistance = 1e10;
			camera.position.set(0, 0, 1250.0);
		}
		if (setCameraTo === 'elektro1') {
			controls.target = elektro1.object3d.position;
			controls.minDistance = 20;
			controls.maxDistance = 1e5;
			camera.position.copy(elektro1.object3d.position).multiplyScalar(1.1);
		}
		if (setCameraTo === 'elektro2') {
			controls.target = elektro2.object3d.position;
			controls.minDistance = 20;
			controls.maxDistance = 1e5;
			camera.position.copy(elektro2.object3d.position).multiplyScalar(1.1);
		}
		if (setCameraTo === 'spektr-r') {
			controls.target = spektr.object3d.position;
			controls.minDistance = 20;
			controls.maxDistance = 1e5;
			camera.position.copy(elektro2.object3d.position).multiplyScalar(1.1);
		}
	};

	function makeSnapshot() {
		window.open( renderer.domElement.toDataURL("image/jpeg"), "Satellite Tracker");
		return false;
	}

});
