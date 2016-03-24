'use strict';

$(document).ready(function() {
	var webglEl = document.getElementById('scene');

	var width  = window.innerWidth,
		height = window.innerHeight;

    var earth = TRACKER.earth,
		sun = TRACKER.sun,
		milkyway = TRACKER.milkyway;

	var scene = new THREE.Scene();
    scene.add(earth.ground.mesh);
    scene.add(earth.sky.mesh);
	scene.add(sun.lensFlare);
	scene.add(milkyway.milkyway);

	var camera = new THREE.PerspectiveCamera(90, width / height, 1, 1e5);
	camera.position.set(5600, 5300, 500);
	camera.up = new THREE.Vector3( 0, 0, 1 );

	var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
	renderer.setPixelRatio(window.devicePixelRatio || 1);
	renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 1);
    webglEl.appendChild(renderer.domElement);


    var controls = new THREE.TrackballControls(camera);

	var debugaxis = axes;
	// debugaxis(200);
	render();

	var f = 0,
		g = 0;

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

	function axes(axisLength){
		function v(x,y,z){
			return new THREE.Vector3(x,y,z);
		}

		// Create axis (point1, point2, colour)
		// {x: red, y: green, z: blue}
		function createAxis(p1, p2, color){
			var line, lineGeometry = new THREE.Geometry(),
			lineMat = new THREE.LineBasicMaterial({color: color});
			lineGeometry.vertices.push(p1, p2);
			line = new THREE.Line(lineGeometry, lineMat);
			scene.add(line);
		}

		createAxis(v(-axisLength, 0, 0), v(axisLength, 0, 0), 0xFF0000);
		createAxis(v(0, -axisLength, 0), v(0, axisLength, 0), 0x00FF00);
		createAxis(v(0, 0, -axisLength), v(0, 0, axisLength), 0x0000FF);
	};

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    window.addEventListener( 'resize', onWindowResize, false );
});
