/**
 * @file Calculates moon position in different coordinate systems
 * @author Aleksey Maslakov
 */

TRACKER.namespace("MoonPosition");

/**
 * Methods to calculate Moon position
 * @namespace MoonPosition
 */
TRACKER.MoonPosition = (function() {
    'use strict';

    var Const = TRACKER.utils.Constants,
        CoordConverter = TRACKER.utils.CoordinateConverter,
        DateConverter = TRACKER.utils.DateConverter;

    function frac(f) {
        return f % 1;
    }

    return {
        /**
         * Returns Moon's ecliptic position in spherical coordinates
         * @param {Date} date - Civil Date in UTC scale to calculate to
         * @returns {THREE.Vector3} longitude (rad), latitude (rad) and distance (km) respectively
         */
        getEclipticPosition: function(date) {
            var dt = (DateConverter.utcToMjd(date) - Const.MJD2000) / Const.JULIAN_C;
            // mean elements of lunar orbit
            var fam = frac(0.606433 + 1336.855225*dt);       // { mean longitude [rev] }
            var fal = Const.PI2 * frac(0.374897 + 1325.552410*dt);  // { Moon's mean anomaly radian }
            var fap = Const.PI2 * frac(0.993133 + 99.997361*dt);  // { Sun's mean anomaly  radian }
            var fad = Const.PI2 * frac(0.827361 + 1236.853086*dt);  // { Diff. long. Moon-Sun }
            var faf = Const.PI2 * frac(0.259086+1342.227825*dt);  // { Dist. from ascending node }
            // { perturbations in longitude and latitude }
            var dl = +22640*Math.sin(fal) - 4586*Math.sin(fal-2*fad)
                     +2370*Math.sin(2*fad) + 769*Math.sin(2*fal)
                     -668*Math.sin(fap) - 412*Math.sin(2*faf)
                     -212*Math.sin(2*fal-2*fad) - 206*Math.sin(fal+fap-2*fad)
                     +192*Math.sin(fal+2*fad) - 165*Math.sin(fap-2*fap)
                     -125*Math.sin(fad) - 110*Math.sin(fal+fap)
                     +148*Math.sin(fal-fap) - 55*Math.sin(2*faf-2*fad);
            var ds = faf + Const.SEC_IN_RAD * (dl + 412*Math.sin(2*faf) + 541*Math.sin(fap));
            var dh = faf - 2*fad;
            var dn = -526*Math.sin(dh) + 44*Math.sin(fal+dh) - 31*Math.sin(-fal+dh) - 23*Math.sin(fap+dh) +
                      11*Math.sin(-fap+dh) - 25*Math.sin(-2*fal+faf) + 21*Math.sin(-fal+faf);
            // { ecliptic longitude and latitude }
            var v = Const.PI2 * frac(fam+dl/1296.0e3);  // { longitude [rad] }
            var b = Const.SEC_IN_RAD*(18520.0*Math.sin(ds)+dn); // { latitude  [rad] }
            // { range with correction for range in arcsec }
            var dr = +3422.70
                  +28.233869*Math.cos(2*fad)
                    +3.08589*Math.cos(fal+2*fad)
                 +186.539296*Math.cos(fal)
                  +34.311569*Math.cos(fal-2*fad)
                   +1.916735*Math.cos(fap-2*fad)
                   -0.977818*Math.cos(fad)
                  +10.165933*Math.cos(2*fal)
                   -0.949147*Math.cos(fal+fap)
                   +1.443617*Math.cos(fal+fap-2*fad);
            var r = Const.R0 / (0.999953253 * Const.SEC_IN_RAD*dr);  // { range in km }

            return new THREE.Vector3(v, b, r);
        },

        /**
         * Returns Moon's Equatorial position
         * @param {Date} date - Civil Date in UTC scale to calculate to
         * @returns {THREE.Vector3} - Moon's equatorial position in the cartesian system.
         */
        getEquatorialPosition: function(date) {
            var tdb = DateConverter.utcToTdb(date),
                eclPos = this.getEclipticPosition(date),
                equPos = CoordConverter.eclipSpherToEquCart(tdb, eclPos.x, eclPos.y, eclPos.z);

            return new THREE.Vector3(equPos.x, equPos.z, -equPos.y);
        }
    }
})();
