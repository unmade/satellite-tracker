TRACKER.namespace('utils.Loaders');

TRACKER.utils.Loaders = (function() {
    'use strict';

    return {
        defferedOBJLoader: defferedOBJLoader,
        defferedTextureLoader: defferedTextureLoader
    }


    function defferedOBJLoader(obj, name, url)
    {
        var defer = $.Deferred();
        var loader = new THREE.OBJLoader();
        loader.load(url, function ( event ) {
            obj[name] = event;
            defer.resolve();
        });

        return defer;
    }


    function defferedTextureLoader(obj, name, url)
    {
        var defer = $.Deferred();
        var loader = new THREE.TextureLoader();
        loader.load(url, function ( event ) {
            obj[name] = event;
            defer.resolve();
        });

        return defer;
    }

})();
