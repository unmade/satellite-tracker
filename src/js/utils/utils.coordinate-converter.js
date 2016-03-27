TRACKER.namespace("utils.CoordinateConverter");

TRACKER.utils.CoordinateConverter = (function() {
    'use strict';

    var Const = TRACKER.utils.Constants;

    return {
        eclipSpherToEquCart: eclipSpherToEquCart,
        eclipticToEquatorial: eclipticToEquatorial,
        getTerrestrialAngle: getTerrestrialAngle,
        getEpsMean: getEpsMean,
        sphericalToCartesian: sphericalToCartesian
    }

    function eclipSpherToEquCart(tdb, l, b, r) {
        var eps = getEpsMean(tdb);

        return new THREE.Vector3(
            r * Math.cos(b) * Math.cos(l),
            r * Math.cos(b) * (Math.cos(eps)*Math.sin(l) - Math.sin(eps)*Math.tan(b)),
            r * Math.cos(b) * (Math.sin(eps)*Math.sin(l) + Math.cos(eps)*Math.tan(b))
        )
    }

    function eclipticToEquatorial(tdb, x, y, z) {
        var eps = getEpsMean(tdb);

        return new THREE.Vector3(
            x,
            y*Math.cos(eps) - z*Math.sin(eps),
            y*Math.sin(eps) + z*Math.cos(eps)
        );
    }

    function getEpsMean(tdb) {
        var ts = (tdb - Const.MJD2000) / Const.JULIAN_C,
            ts2 = ts*ts,
            ts3 = ts*ts2;

        return Const.SEC_IN_RAD * (84381.448 - 46.8150*ts - 0.00059*ts2 + 0.001813*ts3);
    }

    function getTerrestrialAngle(date, gmst) {
        var deg,
            _gmst = gmst || satellite.gstimeFromDate(
                date.getUTCFullYear(),
                date.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
                date.getUTCDate(),
                date.getUTCHours(),
                date.getUTCMinutes(),
                date.getUTCSeconds()
            );

        deg = _gmst / Const.GRAD_IN_RAD;
        deg += (deg >= 360) ? -360 : (deg < 0) ? 360 : 0;

        return -Const.OMEGA * deg/15 * 3600;
    }

    function sphericalToCartesian(l, b, r) {
        return new THREE.Vector3(
            r * Math.cos(b) * Math.cos(l),  // x
            r * Math.cos(b) * Math.sin(l),  // y
            r * Math.sin(b)                 // z
        );
    }

})();
