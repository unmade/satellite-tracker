$(document).ready(function() {
	'use strict';

	var CoordinateConverter = TRACKER.utils.CoordinateConverter,
		loaders = TRACKER.utils.Loaders,
		player = TRACKER.Player;

	var width  = window.innerWidth,
		height = window.innerHeight;

	var tle = {
		elektro1: {
			line1: "1 37344U 11001A   16102.90167773 -.00000123  00000-0  00000+0 0  9990",
			line2: "2 37344   1.5774  79.6490 0003902 183.9973 337.5061  1.00267944 19183"
		},
		elektro2: {
			line1: "1 41105U 15074A   16102.89237153 -.00000142  00000-0  00000+0 0  9993",
			line2: "2 41105   0.2243 278.1535 0001763 170.5017 150.9556  1.00272010  1233"
		},
		spektrr: {
			line1: "1 37755U 11037A   16100.17782304 -.00001490  00000-0  00000+0 0  9993",
			line2: "2 37755  38.6798  43.7029 9297736 261.9201   0.0802  0.11433683  2022"
		}
	};
	var paths = {
	// 	earth: {
	// 		low: 'https://res.cloudinary.com/dqdmb8lkr/image/upload/v1460453924/diffuse-2k_pptb3b.jpg',
	// 		mid: 'https://res.cloudinary.com/dqdmb8lkr/image/upload/v1460453924/diffuse-4k_dxcwpb.jpg',
	// 		high: 'https://res.cloudinary.com/dqdmb8lkr/image/upload/v1460454270/diffuse-8k-1_diyaii.jpg'
	// 	},
	// 	earthNight: {
	// 		low: 'https://res.cloudinary.com/dqdmb8lkr/image/upload/v1460453923/diffuse-night-2k_waymla.jpg',
	// 		mid: 'https://res.cloudinary.com/dqdmb8lkr/image/upload/v1460453924/diffuse-night-4k_bfhlas.jpg',
	// 		high: 'https://res.cloudinary.com/dqdmb8lkr/image/upload/v1460453925/diffuse-night-8k_znszxy.jpg'
	// 	},
	// 	earthSpecular: {
	// 		low: 'https://res.cloudinary.com/dqdmb8lkr/image/upload/v1460453925/diffuse-specular-2k_excwc3.png',
	// 		mid: 'https://res.cloudinary.com/dqdmb8lkr/image/upload/v1460453926/diffuse-specular-4k_iqrnyh.png'
	// 	},
	// 	lensflare0: 'https://res.cloudinary.com/dqdmb8lkr/image/upload/v1460453938/lensflare0_acpml3.png',
	// 	lensflare2: 'https://res.cloudinary.com/dqdmb8lkr/image/upload/v1460453937/lensflare2_txpczc.png',
	// 	lensflare3: 'https://res.cloudinary.com/dqdmb8lkr/image/upload/v1460453937/lensflare3_j13tzs.png',
	// 	moon: {
	// 		low: 'https://res.cloudinary.com/dqdmb8lkr/image/upload/v1460453942/moon-2k_hczfxp.jpg',
	// 		mid: 'https://res.cloudinary.com/dqdmb8lkr/image/upload/v1460453941/moon-4k_zyrli7.jpg'
	// 	},
	// 	moonNight: {
	// 		low:'https://res.cloudinary.com/dqdmb8lkr/image/upload/v1460453923/default-night_kuxx0h.jpg'
	// 	},
	// 	moonSpecular: {
	// 		low: 'https://res.cloudinary.com/dqdmb8lkr/image/upload/v1460453922/default-specular_p2h2ew.png'
	// 	},
	// 	elektro:  {
	// 		obj: 'https://raw.githubusercontent.com/unmade/satellite-tracker/master/dist/obj/Aura_27.obj',
	// 		mtl: 'https://raw.githubusercontent.com/unmade/satellite-tracker/master/dist/obj/Aura_27.mtl'
	// 	},
	// 	spektr: {
	// 		obj: 'https://raw.githubusercontent.com/unmade/satellite-tracker/master/dist/obj/jason-1_final.obj',
	// 		mtl: 'https://raw.githubusercontent.com/unmade/satellite-tracker/master/dist/obj/jason-1_final.mtl'
	// 	}
	// }
	var paths = {
		earth: {
			low: '/dist/images/textures/earth/diffuse-2k.jpg',
			mid: '/dist/images/textures/earth/diffuse-4k.jpg',
			high: '/dist/images/textures/earth/diffuse-8k.jpg',
		},
		earthNight: {
			low: '/dist/images/textures/earth/diffuse-night-2k.jpg',
			mid: '/dist/images/textures/earth/diffuse-night-4k.jpg',
			high: '/dist/images/textures/earth/diffuse-night-8k.jpg',
		},
		earthSpecular: {
			low: '/dist/images/textures/earth/diffuse-specular-2k.png',
			mid: '/dist/images/textures/earth/diffuse-specular-4k.png',
		},
		lensflare0: '/dist/images/textures/lensflare/lensflare0.png',
		lensflare2: '/dist/images/textures/lensflare/lensflare2.png',
		lensflare3: '/dist/images/textures/lensflare/lensflare3.png',
		moon: {
			low: '/dist/images/textures/moon/moon-2k.jpg',
			mid: '/dist/images/textures/moon/moon-4k.jpg',
		},
		moonNight: {
			low:'/dist/images/textures/earth/default-night.jpg'
		},
		moonSpecular: {
			low: '/dist/images/textures/earth/default-specular.png'
		},
		elektro:  {
			obj: '/dist/obj/Aura_27.obj',
			mtl: '/dist/obj/Aura_27.mtl'
		},
		spektr: {
			obj: '/dist/obj/jason-1_final.obj',
			mtl: '/dist/obj/jason-1_final.mtl'
		}
	}

	var scale = 63.71,
		i = 0,
		yAxis = new THREE.Vector3(0, 1, 0);

	var	assets = {},
		earth,
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
		var earthRadius = 6371 / scale,
			moonRadius = 1738.14 / scale,
			position,
			webglEl = document.getElementById('scene');

		player.init({
			date: new Date(),
			onDateChangeCallback: propagate,
			toggleCoordinatesCallback: toggleCoordinates,
			changeCameraViewCallback: changeCameraView,
			changeTextureResCallback: changeTextureRes,
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
				diffuse: assets.earth2k,
				diffuseNight: assets.earthNight2k,
				diffuseSpecular: assets.earthSpecular2k
			});

			moon = new TRACKER.CelestialObject({
				diffuse: assets.moon2k,
				diffuseNight: assets.moonNight2k,
				diffuseSpecular: assets.moonSpecular2k
			});

			// assets.elektro.scale.set(1e-3, 1e-3, 1e-3);
			assets.spektr.scale.set(9e-4, 9e-4, 9e-4);
			elektro1 = new TRACKER.Satellite(tle.elektro1, scale, assets.elektro.clone());
		    elektro2 = new TRACKER.Satellite(tle.elektro2, scale, assets.elektro.clone());
		    spektr = new TRACKER.Satellite(tle.spektrr, scale, assets.spektr.clone());

			var angle = CoordinateConverter.getGMST(player.date)
			camera.position.copy(elektro2.position(player.date).applyAxisAngle(yAxis, -angle)).multiplyScalar(1.3);

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

			$('.st-background-container').fadeOut('slow');
		};

		$.when(
			loaders.defferedTextureLoader(assets, 'earth2k', paths.earth.low),
			loaders.defferedTextureLoader(assets, 'earthNight2k', paths.earthNight.low),
			loaders.defferedTextureLoader(assets, 'earthSpecular2k', paths.earthSpecular.low),
			loaders.defferedTextureLoader(assets, 'lensflare0', paths.lensflare0),
			loaders.defferedTextureLoader(assets, 'lensflare2', paths.lensflare2),
			loaders.defferedTextureLoader(assets, 'lensflare3', paths.lensflare3),
			loaders.defferedTextureLoader(assets, 'moon2k', paths.moon.low),
			loaders.defferedTextureLoader(assets, 'moonNight2k', paths.moonNight.low),
			loaders.defferedTextureLoader(assets, 'moonSpecular2k', paths.moonSpecular.low),
			loaders.defferedOBJMTLLoader(assets, 'elektro', paths.elektro.obj, paths.elektro.mtl),
			loaders.defferedOBJMTLLoader(assets, 'spektr', paths.spektr.obj, paths.spektr.mtl)
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
		try {
			spektr.propagate(player.date);
		}
		catch (TypeError) {
		}

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
			controls.target = new THREE.Vector3(0,0,0);
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
			console.log(spektr);
		}
	};

	function makeSnapshot() {
		window.open( renderer.domElement.toDataURL("image/jpeg"), "Satellite Tracker");
		return false;
	}

	function changeTextureRes() {
		var loader,
			res = $(this).attr('texture-res');

		if (res === '8k') {
			if (!assets['earth8k']) {
				$.when(
					loaders.defferedTextureLoader(assets, 'earth8k', paths.earth.high),
					loaders.defferedTextureLoader(assets, 'earthNight8k', paths.earthNight.high),
					loaders.defferedTextureLoader(assets, 'earthSpecular4k', paths.earthSpecular.mid),
					loaders.defferedTextureLoader(assets, 'moon4k', paths.moon.mid)
				)
				.then(function() {
					updateTextures(assets.earth8k, assets.earthNight8k, assets.earthSpecular4k, assets.moon4k);
				});
			}
			else {
				updateTextures(assets.earth8k, assets.earthNight8k, assets.earthSpecular4k, assets.moon4k);
			}
		}
		if (res === '4k') {
			if (!assets['earth4k']) {
				$.when(
					loaders.defferedTextureLoader(assets, 'earth4k', paths.earth.mid),
					loaders.defferedTextureLoader(assets, 'earthNight4k', paths.earthNight.mid),
					loaders.defferedTextureLoader(assets, 'earthSpecular4k', paths.earthSpecular.mid),
					loaders.defferedTextureLoader(assets, 'moon4k', paths.moon.mid)
				)
				.then(function() {
					updateTextures(assets.earth4k, assets.earthNight4k, assets.earthSpecular4k, assets.moon4k);
				});
			}
			else {
				updateTextures(assets.earth4k, assets.earthNight4k, assets.earthSpecular4k, assets.moon4k);
			}
		}
		if (res === '2k') {
			updateTextures(assets.earth2k, assets.earthNight2k, assets.earthSpecular2k, assets.moon2k);
		}
	}

	function updateTextures(earthDay, earthNight, earthSpecular, moonDay) {
		earth.setTextures({
			diffuse: earthDay,
			diffuseNight: earthNight,
			diffuseSpecular: earthSpecular
		});
		moon.setTextures({
			diffuse: moonDay
		});
	}

});
