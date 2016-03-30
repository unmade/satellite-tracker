TRACKER.namespace('utils.Loaders');

TRACKER.utils.Loaders = (function() {
    'use strict';

    return {
        defferedOBJLoader: defferedOBJLoader,
        defferedOBJMTLLoader: defferedOBJMTLLoader,
        defferedTextureLoader: defferedTextureLoader
    }


    function defferedOBJLoader(obj, name, url) {
        var defer = $.Deferred();
        var loader = new THREE.OBJLoader();
        loader.load(url, function ( event ) {
            obj[name] = event;
            defer.resolve();
        });

        return defer;
    }


    function defferedMTLLoader(obj, name, url) {
        var defer = $.Deferred();
        var loader = new THREE.OBJLoader();
        loader.load(url, function ( event ) {
            obj[name] = event;
            defer.resolve();
        });

        return defer;
    }

    function defferedOBJMTLLoader(obj, name, objUrl, mtlUrl) {
        var defer = $.Deferred();
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.load(mtlUrl, function ( event ) {
            event.preload();

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(event);
            objLoader.load(objUrl, function ( object ) {
                obj[name] = object;
                defer.resolve();
            })
        });

        return defer.promise();
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
