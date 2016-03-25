TRACKER.namespace('utils');

TRACKER.utils = (function() {
    'use strict';

    function defferedOBJLoader(staticData, name, url)
    {
        var defer = $.Deferred();
        var loader = new THREE.OBJLoader();
        loader.load(url, function ( event ) {
            staticData[name] = event;
            defer.resolve();
        });

        return defer;
    }

    return {
        defferedOBJLoader: defferedOBJLoader,
        defferedTextureLoader: undefined
    }
})();
