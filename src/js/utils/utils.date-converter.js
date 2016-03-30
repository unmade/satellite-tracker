/**
 * @file Coverts date between different formats
 * @author Aleksey Maslakov
 */

TRACKER.namespace('utils.DateConverter');

/** @namespace utils/utils.date-converter.js */
TRACKER.utils.DateConverter = (function() {
    'use strict';
    var Const = TRACKER.utils.Constants;

    return {
        /** Returns ΔT (difference between UT and TT) */
        getDeltaT: getDeltaT,

        /** Converts civil UTC date to the modified julian days (MJD) */
        utcToMjd: utcToMjd,

        /** Converts civil UTC date to the barycentric dynamic time (TDB) */
        utcToTdb: utcToTdb,

        /** Converts civil UTC date to the terrestrial time (TT) */
        utcToTT: utcToTT,
    }

    /**
     * Converts civil UTC date to the modified julian days (MJD)
     * @param {Date object} date - Date to be converted.
     * @return {number} Date in modified julian days in UTC scale.
     */
    function utcToMjd(date) {
        var nyear = date.getUTCFullYear(),
            nmonth = date.getUTCMonth() + 1,
            nday = date.getUTCDate(),
            nhours = date.getUTCHours(),
            nminutes = date.getUTCMinutes(),
            nseconds = date.getUTCSeconds();

        var a = parseInt((14 - nmonth) / 12);
        var y = nyear + 4800 - a;
        var m = nmonth + 12*a - 3;

        var jdn = nday + parseInt((153*m + 2)/5) + 365*y + parseInt(y/4) - parseInt(y/100) + parseInt(y/400) - 32045;

        var jd = (jdn) + ((nhours-12.0)/24.0) + (nminutes/1440.0) + (nseconds/86400.0);

        return jd - Const.DIFF_EPOCH;
    }

    /**
     * Converts civil UTC date to the barycentric dynamic time (TDB)
     * @param {Date object} date - Date to be converted.
     * @return {number} Date in modified julian days in TDB scale.
     */
    function utcToTdb(date) {
        var tt = utcToTT(date),
            d = (tt - Const.MJD2000) / Const.JULIAN_C,
            g = (Const.GRAD_IN_RAD) * (357.258 * 35999.05 * d);

        return tt + (0.001658 * Math.sin(g + 0.0167*Math.sin(g))) / Const.SEC_IN_DAY;
    }

    /**
     * Converts civil UTC date to the terrestrial time (TT)
     * @param {Date object} date - Date to be converted.
     * @return {number} Date in modified julian days in TT scale.
     */
    function utcToTT(date) {
        var mjd = utcToMjd(date),
            deltaT = getDeltaT(date.getUTCFullYear(), date.getUTCMonth() + 1);

        return mjd + (deltaT / Const.SEC_IN_DAY);
    }

    /** Returns ΔT (Correction (TT-UTC) in second)
     * @param {number} nyear - Full utc year
     * @param {number} nmonth - Month (1 - 12)
     * @return {number} Correction (TT-UTC) in second
     */
    function getDeltaT(nyear, nmonth) {
        var leap_second = 0;

        switch (nyear)
        {
            case 1972:
                leap_second = (0 < nmonth && nmonth < 7) ? 10 : 11;
                break;
            case 1973:
                leap_second = 12;
                break;
            case 1974:
                leap_second = 13;
                break;
            case 1975:
                leap_second = 14;
                break;
            case 1976:
                leap_second = 15;
                break;
            case 1977:
                leap_second = 16;
                break;
            case 1978:
                leap_second = 17;
                break;
            case 1979:
                leap_second = 18;
                break;
            case 1980:
                leap_second = 19;
                break;
            case 1981:
                leap_second = (0 < nmonth && nmonth < 7) ? 19 : 20;
                break;
            case 1982:
                leap_second = (0 < nmonth && nmonth < 7) ? 20 : 21;
                break;
            case 1983:
                leap_second = (0 < nmonth && nmonth < 7) ? 21 : 22;
                break;
            case 1984:
                leap_second = 22;
                break;
            case 1985:
                leap_second = (0 < nmonth && nmonth < 7) ? 22 : 23;
                break;
            case 1986:
            case 1987:
                leap_second = 23;
                break;
            case 1988:
            case 1989:
                leap_second = 24;
                break;
            case 1990:
                leap_second = 25;
                break;
            case 1991:
                leap_second = 26;
                break;
            case 1992:
                leap_second = (0 < nmonth && nmonth < 7) ? 26 : 27;
                break;
            case 1993:
                leap_second = (0 < nmonth && nmonth < 7) ? 27 : 28;
                break;
            case 1994:
                leap_second = (0 < nmonth && nmonth < 7) ? 28 : 29;
                break;
            case 1995:
                leap_second = 29;
                break;
            case 1996:
                leap_second = 30;
                break;
            case 1997:
                leap_second = (0 < nmonth && nmonth < 7) ? 30 : 31;
                break;
            case 1998:
                leap_second = 31;
                break;
            case 1999:
            case 2000:
            case 2001:
            case 2002:
            case 2003:
            case 2004:
            case 2005:
                leap_second = 32;
                break;
            case 2006:
            case 2007:
            case 2008:
                leap_second = 33;
                break;
            case 2009:
            case 2010:
            case 2011:
                leap_second = 34;
                break;
            case 2012:
                leap_second = (0 < nmonth && nmonth < 7) ? 34 : 35;
                break;
            case 2013:
            case 2014:
                leap_second = 35;
                break;
            case 2015:
                leap_second = (0 < nmonth && nmonth < 7) ? 35 : 36;
                break;
            default:
                leap_second = (nyear > 1972) ? 36 : 10;
        }

        return leap_second + Const.TT_TAI_DIFF;
    }

})();
