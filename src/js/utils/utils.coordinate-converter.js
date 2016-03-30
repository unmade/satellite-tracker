/**
 * @file Coverts date between different formats
 * @author Aleksey Maslakov
 */


TRACKER.namespace("utils.CoordinateConverter");

/** @namespace utils/utils.coordinate-converter.js */
TRACKER.utils.CoordinateConverter = (function() {
    'use strict';

    var Const = TRACKER.utils.Constants;

    return {
        /** Converts ecliptic (spherical) coordinates to the equatorial (cartesian) ones */
        eclipSpherToEquCart: eclipSpherToEquCart,

        /** Converts ecliptic (cartesian) coordinates to the equatorial (cartesian) ones */
        eclipticToEquatorial: eclipticToEquatorial,

        /** Returns angle between absolute and relative celestial coordinate system */
        getGMST: getGMST,

        /** Return obliquity of the ecliptic in radians */
        getEpsMean: getEpsMean,

        /** Coverts spherical coordinate to the cartesian  */
        sphericalToCartesian: sphericalToCartesian
    }

    /**
     * Converts ecliptic (spherical) coordinates to the equatorial (cartesian) ones.
     * @param {Number} tdb - MJD in TDB scale.
     * @param {Number} l - Longitude in radians.
     * @param {Number} b - Latitude in radians.
     * @param {Number} r - Range in km
     * @returns {THREE.Vector3} Equatorial cartesian coordinates
     */
    function eclipSpherToEquCart(tdb, l, b, r) {
        var eps = getEpsMean(tdb);

        return new THREE.Vector3(
            r * Math.cos(b) * Math.cos(l),
            r * Math.cos(b) * (Math.cos(eps)*Math.sin(l) - Math.sin(eps)*Math.tan(b)),
            r * Math.cos(b) * (Math.sin(eps)*Math.sin(l) + Math.cos(eps)*Math.tan(b))
        )
    }

    /**
     * Converts ecliptic (cartesian) coordinates to the equatorial (cartesian) ones.
     * @param {Number} tdb - MJD date in TDB scale.
     * @param {Number} x - x-coordinate on the tdb moment
     * @param {Number} y - y-coordinate on the tdb moment
     * @param {Number} z - z-coordinate on the tdb moment
     * @returns {THREE.Vector3} Equatorial cartesian coordinates
     */
    function eclipticToEquatorial(tdb, x, y, z) {
        var eps = getEpsMean(tdb);

        return new THREE.Vector3(
            x,
            y*Math.cos(eps) - z*Math.sin(eps),
            y*Math.sin(eps) + z*Math.cos(eps)
        );
    }

    /**
     * Return obliquity of the ecliptic in radians.
     * @param {Number} tdb - MJD date in TDB scale.
     * @returns {Number} Obliquity of the ecliptic in radians.
     */
    function getEpsMean(tdb) {
        var ts = (tdb - Const.MJD2000) / Const.JULIAN_C,
            ts2 = ts*ts,
            ts3 = ts*ts2;

        return Const.SEC_IN_RAD * (84381.448 - 46.8150*ts - 0.00059*ts2 + 0.001813*ts3);
    }

    /**
     * Returns greenwich mean sidereal time (GMST) in radians.
     * @param {Date} date - Civil UTC date.
     * @returns {Number} GMST in radians.
     */
    function getGMST(date) {
        return satellite.gstimeFromDate(
            date.getUTCFullYear(),
            date.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds()
        );
    }

    /**
     * Coverts spherical coordinates to the cartesian.
     * @param {Number} l - Longitude in radians.
     * @param {Number} b - Latitude in radians.
     * @param {Number} r - Range in km.
     * @returns {THREE.Vector3} Cartesian coordinates.
     */
    function sphericalToCartesian(l, b, r) {
        return new THREE.Vector3(
            r * Math.cos(b) * Math.cos(l),  // x
            r * Math.cos(b) * Math.sin(l),  // y
            r * Math.sin(b)                 // z
        );
    }

})();
