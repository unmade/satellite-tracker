TRACKER.namespace('Satellite');

TRACKER.Satellite = (function() {
    'use strict';

    var Const = TRACKER.utils.Constants,
        CoordConverter = TRACKER.utils.CoordinateConverter,
        Satellite;

    Satellite = function(tle, scale, object3d) {
        this.object3d = object3d;
        this.satrec = satellite.twoline2satrec(tle.line1, tle.line2);
        this.scale = scale;
    };

    Satellite.prototype.setObj = function(obj) {
        this.object3d = obj;
    };

    Satellite.prototype.position = function(date, gmst) {
        var p = satellite.propagate(
    		this.satrec,
    		date.getUTCFullYear(),
    		date.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
    		date.getUTCDate(),
    		date.getUTCHours(),
    		date.getUTCMinutes(),
    		date.getUTCSeconds()
    	).position;

        return new THREE.Vector3(p.x, p.z, -p.y).divideScalar(this.scale);
    };

    Satellite.prototype.propagate = function(date, gmst) {
        var position = this.position(date, gmst);
        this.object3d.position.copy(position);

        return position;
    }

    Satellite.prototype.rotateY = function(angle) {
        var axis = new THREE.Vector3(0, 1, 0);

        this.object3d.position.applyAxisAngle(axis, angle);
    }

    return Satellite;

})();
