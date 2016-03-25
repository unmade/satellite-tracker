$(document).ready(function() {
	'use strict';
	var webglEl = document.getElementById('scene');

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

    var earth = TRACKER.earth,
		sun = TRACKER.sun,
		milkyway = TRACKER.milkyway,
		elektro1 = new TRACKER.Satellite(tle.elektro1, scale),
		elektro2 = new TRACKER.Satellite(tle.elektro2, scale);

	var scene = new THREE.Scene();
    scene.add(earth.ground.mesh);
    scene.add(earth.sky.mesh);
	scene.add(sun.lensFlare);
	scene.add(sun.light);
	scene.add(new THREE.AmbientLight(0x333333));

	$.when(
		elektro1.loadObj('/src/obj/elektro.obj'),
		elektro2.loadObj('/src/obj/elektro.obj')
	)
	.then(function() {
		var now = new Date(),
			position;
		elektro1.object.scale.set(1e-3, 1e-3, 1e-3);
		position = elektro1.propagate(now);

		elektro2.object.scale.set(1e-3, 1e-3, 1e-3);
		elektro2.propagate(now);

		scene.add(elektro1.object);
		scene.add(elektro2.object);

		camera.position.copy(position).multiplyScalar(1.05);
		earth.ground.material.uniforms.v3LightPosition.value.copy(position).normalize();
		sun.lensFlare.position.copy(position).multiplyScalar(1e1);
		sun.light.position.copy(position).multiplyScalar(1e1);
		render();
	});

	var camera = new THREE.PerspectiveCamera(90, width / height, 1, 1e5);
	camera.position.set(300, 50, -150);
	camera.up = new THREE.Vector3( 0, 1, 0 );

	var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
	renderer.setPixelRatio(window.devicePixelRatio || 1);
	renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 1);
    webglEl.appendChild(renderer.domElement);

    var controls = new THREE.TrackballControls(camera);
	controls.minDistance = 300;
	controls.maxDistance = 1e5;

	// x: red, y: green, z: blue
	var axisHelper = new THREE.AxisHelper( 1000 );
	// scene.add( axisHelper );

	function render() {
		controls.update();
        requestAnimationFrame(render);

        var cameraHeight = camera.position.length();
        earth.sky.material.uniforms.fCameraHeight.value = cameraHeight;
        earth.sky.material.uniforms.fCameraHeight2.value = cameraHeight * cameraHeight;
        earth.ground.material.uniforms.fCameraHeight.value = cameraHeight;
        earth.ground.material.uniforms.fCameraHeight2.value = cameraHeight * cameraHeight;

        return renderer.render(scene, camera);
	}

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    window.addEventListener( 'resize', onWindowResize, false );
});
