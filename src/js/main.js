$(document).ready(function() {
	'use strict';

	var utils = TRACKER.utils;

	var width  = window.innerWidth,
		height = window.innerHeight;

	var tle = {
		elektro1: {
			"line1": "1 37344U 11001A   16084.50580970  .00000000  00000-0  10000-3 0  9991",
			"line2": "2 37344   1.5394  79.7599 0005633 181.1213 179.7726  1.00271467 19002"
		},
		elektro2: {
			"line1": "1 41105U 15074A   16084.53509896 -.00000132  00000-0  00000+0 0  9998",
			"line2": "2 41105   0.2604 277.8149 0001219 144.5680  30.4420  1.00273958  1058"
		}
	};

	var scale = 63.71;

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
			now = new Date(),
			position,
			webglEl = document.getElementById('scene');

		camera = new THREE.PerspectiveCamera(20, width / height, 1, 2e5);
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
		controls.maxDistance = 1e5;

		window.addEventListener( 'resize', onWindowResize, false );

		var onLoad = function() {
			sun = TRACKER.sun;
			milkyway = TRACKER.milkyway;

			earth = new TRACKER.CelestialObject({
				diffuse: assets.earthDay,
				diffuseNight: assets.earthNight,
				diffuseSpecular: assets.earthSpecular
			});

			moon = new TRACKER.CelestialObject({
				atmosphere: {
					ESun: 10,
					innerRadius: moonRadius,
					outerRadius: moonRadius + 0.1,
					wavelength: [0.55, 0.55, 0.55]
				},
				diffuse: assets.moon,
				diffuseNight: assets.moonNight,
				diffuseSpecular: assets.moonSpecular
			});

			assets.elektro.scale.set(1e-3, 1e-3, 1e-3);
			elektro1 = new TRACKER.Satellite(tle.elektro1, scale, assets.elektro.clone());
		    elektro2 = new TRACKER.Satellite(tle.elektro2, scale, assets.elektro.clone());
			position = elektro1.propagate(now);
			elektro2.propagate(now);

			camera.position.copy(position).multiplyScalar(1.05);
			earth.lightPosition(position);
			moon.position(new THREE.Vector3(100, 4e5/scale, 200));
			moon.lightPosition(position);
			sun.lensFlare.position.copy(position).multiplyScalar(1e2);
			sun.light.position.copy(position).multiplyScalar(1e2);

			scene.add(earth.ground);
			scene.add(earth.sky);
			scene.add(moon.ground);
			scene.add(moon.sky);
			scene.add(elektro1.object3d);
			scene.add(elektro2.object3d);
			scene.add(sun.lensFlare);
			scene.add(sun.light);
			scene.add(new THREE.AmbientLight(0x333333));

			render();
		};

		$.when(
			utils.defferedTextureLoader(assets, 'earthDay', '/src/images/earth/diffuse-low.jpg'),
			utils.defferedTextureLoader(assets, 'earthNight', '/src/images/earth/diffuse-night-low.jpg'),
			utils.defferedTextureLoader(assets, 'earthSpecular', '/src/images/earth/diffuse-specular-low.png'),
			utils.defferedTextureLoader(assets, 'moon', '/src/images/moon/moon-low.jpg'),
			utils.defferedTextureLoader(assets, 'moonNight', '/src/images/default-night.jpg'),
			utils.defferedTextureLoader(assets, 'moonSpecular', '/src/images/default-specular.png'),
			utils.defferedOBJLoader(assets, 'elektro', '/src/obj/elektro.obj')
		)
		.then(function() {
			onLoad();
		});
	}

	function render() {
		controls.update();

		requestAnimationFrame(render);

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
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

});
