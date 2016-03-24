'use strict';


TRACKER.namespace('milkyway');


TRACKER.milkyway = (function() {
    var milkyway = new THREE.Mesh(
        new THREE.SphereGeometry(1e4, 64, 64),
        new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('/src/images/milkyway/milkyway.jpg'),
            side: THREE.BackSide,
            opacity: 0.1
        })
    )

    return 	{
        milkyway: milkyway
    }
})();
