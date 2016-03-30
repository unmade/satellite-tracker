describe('test coordinate convert', function() {
    'use strict';

    var CoordConverter;

    beforeEach(function() {
        CoordConverter = TRACKER.utils.CoordinateConverter;
    });

    it('should converts ecliptic (spherical) coordinates to the equatorial (cartesian) ones', function() {
        var spher = {
                l: 3.787930671498,
                b: -0.000003961191,
                r: 148552579.338
            },
            equat = CoordConverter.sphericalToCartesian(spher.l, spher.b, spher.r);

        expect(equat.x).toBe(-118588727.4855058);
        expect(equat.y).toBe(-89468332.61548443);
        expect(equat.z).toBe(-588.4451402989326);
    });

    it('should convert ecliptic (cartesian) coordinates to the equatorial (cartesian) coordinates', function() {
        var ecliptic = {
                x: -118588727.4855058,
                y: -89468332.61548443,
                z: -588.4451402989326
            },
            equat = CoordConverter.eclipticToEquatorial(55000.5, ecliptic.x, ecliptic.y, ecliptic.z);

        expect(equat.x).toBe(-118588727.4855058);
        expect(equat.y).toBe(-82086120.50138335);
        expect(equat.z).toBe(-35587235.94736737);
    });

    it('should get obliquity of the ecliptic', function() {
        var eps = CoordConverter.getEpsMean(55000.5);
        expect(eps).toBe(0.4090713286982453);
    });

    it('should convert spherical coordinates to the cartesian ones', function() {
        var spher = {
                l: 3.787930671498,
                b: -0.000003961191,
                r: 148552579.338
            },
            cart = CoordConverter.sphericalToCartesian(spher.l, spher.b, spher.r);

        expect(cart.x).toBe(-118588727.4855058);
        expect(cart.y).toBe(-89468332.61548443);
        expect(cart.z).toBe(-588.4451402989326);
    });

});
