TRACKER.namespace('Satellite');

TRACKER.Satellite = (function() {
    'use strict';

    var utils = TRACKER.utils,
        omega = 2*Math.PI/86164.09,
        Satellite;

    Satellite = function(tle, scale) {
        this.axis = new THREE.Vector3(0, 1, 0);
        this.object = null;
        this.satrec = satellite.twoline2satrec(tle.line1, tle.line2);
        this.scale = scale;
    };

    Satellite.prototype.fixPosition = function(date) {
        var position = satellite.propagate(
    		this.satrec,
    		date.getUTCFullYear(),
    		date.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
    		date.getUTCDate(),
    		date.getUTCHours(),
    		date.getUTCMinutes(),
    		date.getUTCSeconds()
    	).position;

        return new THREE.Vector3(position.x, position.z, -position.y).divideScalar(this.scale);
    };

    Satellite.prototype.loadObj = function(url) {
        return utils.defferedOBJLoader(this, "object", url);
    };

    Satellite.prototype.propagate = function(date, gmst) {
        var position = this.terraPosition(date, gmst);
        this.object.position.copy(position);

        return position;
    }

    Satellite.prototype.terraPosition = function(date, gmst) {
        var deg,
            _gmst = gmst || satellite.gstimeFromDate(
        		date.getUTCFullYear(),
        		date.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
        		date.getUTCDate(),
        		date.getUTCHours(),
        		date.getUTCMinutes(),
        		date.getUTCSeconds()
        	);

        deg = _gmst * (180/Math.PI);
        deg += (deg >= 360) ? -360 : (deg < 0) ? 360 : 0;

        return this.fixPosition(date).applyAxisAngle(this.axis, -omega*deg/15*3600);
    };

    return Satellite;

})();
