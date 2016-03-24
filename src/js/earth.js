'use strict';


TRACKER.namespace('earth');

TRACKER.earth = (function() {
    var atmosphere = {
        Kr: 0.0025,
        Km: 0.0010,
        ESun: 20.0,
        g: -0.950,
        innerRadius: 100.0,
        outerRadius: 101.5,
        wavelength: [0.550, 0.50, 0.475],
        scaleDepth: 0.25,
        mieScaleDepth: 0.1
    };
    var textureLoader = new THREE.TextureLoader(),
        diffuse = textureLoader.load('/src/images/earth/diffuse-low.jpg'),
        diffuseNight = textureLoader.load('/src/images/earth/diffuse-night-low.jpg'),
        diffuseSpecular = textureLoader.load('/src/images/earth/diffuse-specular-low.png');

    var uniforms = {
        v3LightPosition: {
            type: "v3",
            value: new THREE.Vector3(1e8, 0, 1e8).normalize()
        },
        v3InvWavelength: {
            type: "v3",
            value: new THREE.Vector3(1 / Math.pow(atmosphere.wavelength[0], 4),
                                     1 / Math.pow(atmosphere.wavelength[1], 4),
                                     1 / Math.pow(atmosphere.wavelength[2], 4))
        },
        fCameraHeight: {
            type: "f",
            value: 0
        },
        fCameraHeight2: {
            type: "f",
            value: 0
        },
        fInnerRadius: {
            type: "f",
            value: atmosphere.innerRadius
        },
        fInnerRadius2: {
            type: "f",
            value: atmosphere.innerRadius * atmosphere.innerRadius
        },
        fOuterRadius: {
            type: "f",
            value: atmosphere.outerRadius
        },
        fOuterRadius2: {
            type: "f",
            value: atmosphere.outerRadius * atmosphere.outerRadius
        },
        fKrESun: {
            type: "f",
            value: atmosphere.Kr * atmosphere.ESun
        },
        fKmESun: {
            type: "f",
            value: atmosphere.Km * atmosphere.ESun
        },
        fKr4PI: {
            type: "f",
            value: atmosphere.Kr * 4.0 * Math.PI
        },
        fKm4PI: {
            type: "f",
            value: atmosphere.Km * 4.0 * Math.PI
        },
        fScale: {
            type: "f",
            value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius)
        },
        fScaleDepth: {
            type: "f",
            value: atmosphere.scaleDepth
        },
        fScaleOverScaleDepth: {
            type: "f",
            value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius) / atmosphere.scaleDepth
        },
        g: {
            type: "f",
            value: atmosphere.g
        },
        g2: {
            type: "f",
            value: atmosphere.g * atmosphere.g
        },
        nSamples: {
            type: "i",
            value: 3
        },
        fSamples: {
            type: "f",
            value: 3.0
        },
        tDiffuse: {
            type: "t",
            value: diffuse
        },
        tDiffuseNight: {
            type: "t",
            value: diffuseNight
        },
        tDiffuseSpecular: {
                type: "t",
                value: diffuseSpecular
        },
        tDisplacement: {
            type: "t",
            value: 0
        },
        tSkyboxDiffuse: {
            type: "t",
            value: 0
        },
        fNightScale: {
            type: "f",
            value: 1
        },
        fSpecularScale: {
            type: "f",
            value: 1
        },
        fSpecularSize: {
            type: "f",
            value: 25
        }
    };


    var ground = {
        geometry: new THREE.SphereGeometry(atmosphere.innerRadius, 50, 50),
        material: new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: $("#vertexGround").text(),
            fragmentShader: $("#fragmentGround").text()
        })
    };
    ground.mesh = new THREE.Mesh(ground.geometry, ground.material);


    var sky = {
        geometry: new THREE.SphereGeometry(atmosphere.outerRadius, 500, 500),
        material: new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: $("#vertexSky").text(),
            fragmentShader: $("#fragmentSky").text()
        })
    };
    sky.mesh = new THREE.Mesh(sky.geometry, sky.material);

    sky.material.side = THREE.BackSide;
    sky.material.transparent = true;

    return {
        ground: ground,
        sky: sky
    }

})();
