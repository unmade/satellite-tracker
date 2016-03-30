describe('test date convert', function() {
    'use strict';

    var DateConverter,
        past,
        epoch,
        future;

    beforeEach(function() {
        DateConverter = TRACKER.utils.DateConverter;
        past = new Date('2003-11-15T15:35:00');
        epoch = new Date('2000-01-01T12:00:00');
        future = new Date('2036-02-29T02:45:00');
    });

    it('should convert civil UTC date to MJD', function() {
        expect(DateConverter.utcToMjd(past)).toBe(52958.649305555504);
        expect(DateConverter.utcToMjd(epoch)).toBe(51544.5);
        expect(DateConverter.utcToMjd(future)).toBe(64752.11458333349);
    });

    it('should convert civil UTC date to Terrestrial Time (TT)', function() {
        expect(DateConverter.utcToTT(past)).toBe(52958.65004842587);
        expect(DateConverter.utcToTT(epoch)).toBe(51544.50074287037);
        expect(DateConverter.utcToTT(future)).toBe(64752.11537250016);
    });

    it('should convert civil UTC date to Barycentric dynamic time (TDB)', function() {
        expect(DateConverter.utcToTdb(past)).toBe(52958.65004844286);
        expect(DateConverter.utcToTdb(epoch)).toBe(51544.500742870456);
        expect(DateConverter.utcToTdb(future)).toBe(64752.11537251895);
    });

    it('should return deltaT', function() {
        expect(DateConverter.getDeltaT(past.getUTCFullYear(), past.getUTCMonth() + 1)).toBe(64.184);
        expect(DateConverter.getDeltaT(epoch.getUTCFullYear(), epoch.getUTCMonth() + 1)).toBe(64.184);
        expect(DateConverter.getDeltaT(future.getUTCFullYear(), future.getUTCMonth() + 1)).toBe(68.184);
    });

});
