describe('test moon position', function() {
    'use strict';

    var date,
        MoonPos;

        beforeEach(function() {
            date = new Date('2019-06-17T02:45:00'),
            MoonPos = TRACKER.MoonPosition;
        })

    it('should get moon ecliptic position in spherical coordinates', function() {
        var eclPos = MoonPos.getEclipticPosition(date);

        expect(eclPos.x).toBe(4.587370850518838);
        expect(eclPos.y).toBe(0.03844919125928288);
        expect(eclPos.z).toBe(388874.50678931805);
    });

    it('should get moon equatorial position in cartesian coordinates', function() {
        var equPos = MoonPos.getEquatorialPosition(date);

        expect(equPos.x).toBe(-48453.982867738516);
        expect(equPos.y).toBe(-139634.0925418332);
        expect(equPos.z).toBe(359691.4146527646);
    })
});
