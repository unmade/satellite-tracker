TRACKER.namespace('utils.Constants');

TRACKER.utils.Constants = (function() {
    'use strict';

    // TODO: поправить названия у GRAD_IN_RAD, SEC_IN_RAD
    return {
        AU: 149597870.691,
        DIFF_EPOCH: 2400000.5,
        GRAD_IN_RAD: 0.017453292519943295088124656649908317,
        JULIAN_C: 36525.0,
        MJD2000: 51544.5,
        OMEGA: 2*Math.PI / 86164.090530833,
        PI2: 2*Math.PI,
        SEC_IN_DAY: 86400.0,
        SEC_IN_RAD: 4.8481368110953597467454098131995829e-06,
        TT_TAI_DIFF: 32.184
    }
})();
