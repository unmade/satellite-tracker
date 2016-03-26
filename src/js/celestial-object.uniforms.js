TRACKER.namespace('CelestialObject.uniforms');

TRACKER.CelestialObject.uniforms = (function() {
    'use strict';

    return {
        calcfKrESun: calcfKrESun,
        calcfKmESun: calcfKmESun,
        calcfKr4PI: calcfKr4PI,
        calcfKm4PI: calcfKm4PI,
        calcfScaleOverScaleDepth: calcfScaleOverScaleDepth,
        calcvWaveChannel: calcvWaveChannel,
        configureUniforms: configureUniforms
    }

    function calcfKrESun(Kr, ESun) {
        return Kr * ESun
    }

    function calcfKmESun(Km, ESun) {
        return Km * ESun
    }

    function calcfKr4PI(Kr) {
        return Kr * 4 * Math.PI
    }

    function calcfKm4PI(Km) {
        return Km * 4 * Math.PI
    }

    function calcfScaleOverScaleDepth(innerRadius, outerRadius, scaleDepth) {
        return 1 / (outerRadius - innerRadius) / scaleDepth
    }

    function calcvWaveChannel(val) {
        return 1 / Math.pow(val, 4)
    }

    function configureUniforms(diffuse, diffuseNight, diffuseSpecular, atmosphere) {
        return {
            v3LightPosition: {
                type: "v3",
                value: new THREE.Vector3(1e8, 0, 1e8).normalize()
            },
            v3InvWavelength: {
                type: "v3",
                value: new THREE.Vector3(calcvWaveChannel(atmosphere.wavelength[0]),
                                         calcvWaveChannel(atmosphere.wavelength[1]),
                                         calcvWaveChannel(atmosphere.wavelength[2]))
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
                value: calcfKrESun(atmosphere.Kr, atmosphere.ESun)
            },
            fKmESun: {
                type: "f",
                value: calcfKmESun(atmosphere.Km, atmosphere.ESun)
            },
            fKr4PI: {
                type: "f",
                value: calcfKr4PI(atmosphere.Kr)
            },
            fKm4PI: {
                type: "f",
                value: calcfKm4PI(atmosphere.Km)
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
                value: calcfScaleOverScaleDepth(atmosphere.innerRadius, atmosphere.outerRadius, atmosphere.scaleDepth)
            },
            g: {
                type: "f",
                value: atmosphere.g
            },
            g2: {
                type: "f",
                value: atmosphere.g * atmosphere.g
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
    }
})();
