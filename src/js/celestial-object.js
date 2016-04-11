/**
 * @file Celestial Object constructor
 * @author Aleksey Maslakov
 */


TRACKER.namespace('CelestialObject');

TRACKER.CelestialObject = (function() {
    'use strict';

    /**
     * Creates a new Celestial Object - basically it's two spheres (ground and atmosphere).
     * @constructor
     * @param {Object} userConf - user options.
     * @param {THREE.Texture} [userConf.diffuse] - Texture to show on the bright side of the sphere.
     * @param {THREE.Texture} [userConf.diffuseNight] - Texture to show on the dark side of the sphere.
     * @param {THREE.Texture} [userConf.diffuseSpecular] - Specular texture.
     * @param {Object} [userConf.atmosphere] - Object with parameters of the atmospheres.
     * @param {Number} [userConf.atmosphere.Kr=0.0025]
     * @param {Number} [userConf.atmosphere.Km=0.0010]
     * @param {Number} [userConf.atmosphere.ESun=20.0]
     * @param {Number} [userConf.atmosphere.g=-0.950]
     * @param {Number} [userConf.atmosphere.innerRadius=100.0] - Radius of the object.
     * @param {Number} [userConf.atmosphere.outerRadius=101.5] - Radius of the object's atmopshere.
     * @param {Number} [userConf.atmosphere.outerRadius=101.5] - Radius of the object's atmopshere.
     * @param {number[]} [userConf.atmosphere.wavelength=[0.55, 0.5, 0.475]] - RGB Color of the atmosphere.
     * @param {number} [userConf.atmosphere.scaleDepth=0.25] - RGB Color of the atmosphere.
     */
    function CelestialObject(userConf) {
        var diffuse,
            diffuseNight,
            diffuseSpecular,
            uniforms;

        /**
         * Ground
         * @type THREE.Mesh
         */
        this.atmosphere = {
            Kr: 0.0025,
            Km: 0.0010,
            ESun: 20.0,
            g: -0.950,
            innerRadius: 100.0,
            innerSegments: 50,
            outerRadius: 101.5,
            outerSegments: 128,
            wavelength: [0.550, 0.50, 0.475],
            scaleDepth: 0.25,
        };
        if (userConf) {
            if (userConf.atmosphere) {
                $.extend(this.atmosphere, userConf.atmosphere);
            }
            diffuse = userConf.diffuse;
            diffuseNight = userConf.diffuseNight;
            diffuseSpecular = userConf.diffuseSpecular;
        }

        uniforms = CelestialObject.uniforms.configureUniforms(diffuse, diffuseNight, diffuseSpecular, this.atmosphere);

        this.ground = new THREE.Mesh(
            new THREE.SphereGeometry(this.atmosphere.innerRadius,
                                     this.atmosphere.innerSegments,
                                     this.atmosphere.innerSegments),
            new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: "//\n// Atmospheric scattering vertex shader\n//\n// Author: Sean O'Neil\n//\n// Copyright (c) 2004 Sean O'Neil\n//\n// Ported for use with three.js/WebGL by James Baicoianu\n\nuniform mat3 m3RotY;\nuniform vec3 v3LightPosition;		// The direction vector to the light source\nuniform vec3 v3InvWavelength;	// 1 / pow(wavelength, 4) for the red, green, and blue channels\nuniform float fCameraHeight;	// The camera's current height\nuniform float fCameraHeight2;	// fCameraHeight^2\nuniform float fOuterRadius;		// The outer (atmosphere) radius\nuniform float fOuterRadius2;	// fOuterRadius^2\nuniform float fInnerRadius;		// The inner (planetary) radius\nuniform float fInnerRadius2;	// fInnerRadius^2\nuniform float fKrESun;			// Kr * ESun\nuniform float fKmESun;			// Km * ESun\nuniform float fKr4PI;			// Kr * 4 * PI\nuniform float fKm4PI;			// Km * 4 * PI\nuniform float fScale;			// 1 / (fOuterRadius - fInnerRadius)\nuniform float fScaleDepth;		// The scale depth (i.e. the altitude at which the atmosphere's average density is found)\nuniform float fScaleOverScaleDepth;	// fScale / fScaleDepth\nuniform sampler2D tDiffuse;\n\nvarying vec3 v3Direction;\nvarying vec3 c0;\nvarying vec3 c1;\nvarying vec3 vNormal;\nvarying vec2 vUv;\n\nconst int nSamples = 3;\nconst float fSamples = 3.0;\n\nfloat scale(float fCos)\n{\n    float x = 1.0 - fCos;\n    return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));\n}\n\nvoid main(void)\n{\n\n    vec3 corrCameraPosition = m3RotY * cameraPosition;\n    // Get the ray from the camera to the vertex and its length\n    // (which is the far point of the ray passing through the atmosphere)\n\n    vec3 v3Ray = position - corrCameraPosition;\n    float fFar = length(v3Ray);\n    v3Ray /= fFar;\n\n    // Calculate the closest intersection of the ray with the outer atmosphere\n    // (which is the near point of the ray passing through the atmosphere)\n    float B = 2.0 * dot(corrCameraPosition, v3Ray);\n    float C = fCameraHeight2 - fOuterRadius2;\n    float fDet = max(0.0, B*B - 4.0 * C);\n    float fNear = 0.5 * (-B - sqrt(fDet));\n\n    // Calculate the ray's starting position, then calculate its scattering offset\n    vec3 v3Start = corrCameraPosition + v3Ray * fNear;\n    fFar -= fNear;\n    float fDepth = exp((fInnerRadius - fOuterRadius) / fScaleDepth);\n    float fCameraAngle = dot(-v3Ray, position) / length(position);\n    float fLightAngle = dot(m3RotY*v3LightPosition, position) / length(position);\n    float fCameraScale = scale(fCameraAngle);\n    float fLightScale = scale(fLightAngle);\n    float fCameraOffset = fDepth*fCameraScale;\n    float fTemp = (fLightScale + fCameraScale);\n\n    // Initialize the scattering loop variables\n    float fSampleLength = fFar / fSamples;\n    float fScaledLength = fSampleLength * fScale;\n    vec3 v3SampleRay = v3Ray * fSampleLength;\n    vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;\n\n    // Now loop through the sample rays\n    vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);\n    vec3 v3Attenuate;\n    for(int i=0; i<nSamples; i++)\n    {\n        float fHeight = length(v3SamplePoint);\n        float fDepth = exp(fScaleOverScaleDepth * (fInnerRadius - fHeight));\n        float fScatter = fDepth*fTemp - fCameraOffset;\n        v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI)) / 1.1;\n        v3FrontColor += v3Attenuate * (fDepth * fScaledLength);\n        v3SamplePoint += v3SampleRay;\n    }\n\n    // Calculate the attenuation factor for the ground\n    c0 = v3Attenuate;\n    c1 = v3FrontColor * (v3InvWavelength * fKrESun + fKmESun);\n\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n    vUv = uv;\n    vNormal = normal;\n}",
                fragmentShader: "//\n// Atmospheric scattering fragment shader\n//\n// Author: Sean O'Neil\n//\n// Copyright (c) 2004 Sean O'Neil\n//\n// Ported for use with three.js/WebGL by James Baicoianu\n\nuniform mat3 m3RotY;\nuniform float fNightScale;\nuniform float fSpecularScale;\nuniform float fSpecularSize;\nuniform vec3 v3LightPosition;\nuniform sampler2D tDiffuse;\nuniform sampler2D tDiffuseNight;\nuniform sampler2D tDiffuseSpecular;\n\nvarying vec3 c0;\nvarying vec3 c1;\nvarying vec3 vNormal;\nvarying vec2 vUv;\n\nvoid main (void)\n{\n    vec3 diffuseTex = texture2D( tDiffuse, vUv ).xyz;\n    vec3 diffuseNightTex = texture2D( tDiffuseNight, vUv ).xyz;\n    vec3 diffuseSpecularTex = texture2D(tDiffuseSpecular, vUv).xyz;\n\n    float specularMix = pow(fSpecularScale * dot(normalize(vNormal), m3RotY*v3LightPosition), fSpecularSize) *\n                            (diffuseSpecularTex.z * 0.5);\n\n    vec3 day = diffuseTex * c0;\n    vec3 night = fNightScale * diffuseNightTex * diffuseNightTex * diffuseNightTex * (1.0 - c0);\n    vec3 specular = diffuseSpecularTex * specularMix * c0;\n\n    gl_FragColor = vec4(c1, 1.0) + vec4(day + night + specular, 1.0);\n}"
            })
        );

        /**
         * Atmosphere
         * @type THREE.Mesh
         */
        this.sky = new THREE.Mesh(
            new THREE.SphereGeometry(this.atmosphere.outerRadius,
                                     this.atmosphere.outerSegments,
                                     this.atmosphere.outerSegments),
            new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: "//\n// Atmospheric scattering vertex shader\n//\n// Author: Sean O'Neil\n//\n// Copyright (c) 2004 Sean O'Neil\n//\n\nuniform mat3 m3RotY;\nuniform vec3 v3LightPosition;	// The direction vector to the light source\nuniform vec3 v3InvWavelength;	// 1 / pow(wavelength, 4) for the red, green, and blue channels\nuniform float fCameraHeight;	// The camera's current height\nuniform float fCameraHeight2;	// fCameraHeight^2\nuniform float fOuterRadius;		// The outer (atmosphere) radius\nuniform float fOuterRadius2;	// fOuterRadius^2\nuniform float fInnerRadius;		// The inner (planetary) radius\nuniform float fInnerRadius2;	// fInnerRadius^2\nuniform float fKrESun;			// Kr * ESun\nuniform float fKmESun;			// Km * ESun\nuniform float fKr4PI;			// Kr * 4 * PI\nuniform float fKm4PI;			// Km * 4 * PI\nuniform float fScale;			// 1 / (fOuterRadius - fInnerRadius)\nuniform float fScaleDepth;		// The scale depth (i.e. the altitude at which the atmosphere's average density is found)\nuniform float fScaleOverScaleDepth;	// fScale / fScaleDepth\n\nconst int nSamples = 3;\nconst float fSamples = 3.0;\n\nvarying vec3 v3Direction;\nvarying vec3 c0;\nvarying vec3 c1;\n\n\nfloat scale(float fCos)\n{\n    float x = 1.0 - fCos;\n    return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));\n}\n\nvoid main(void)\n{\n    vec3 corrCameraPosition = m3RotY * cameraPosition;\n    // Get the ray from the camera to the vertex and its length\n    // (which is the far point of the ray passing through the atmosphere)\n    vec3 v3Ray = position - corrCameraPosition;\n    float fFar = length(v3Ray);\n    v3Ray /= fFar;\n\n    // Calculate the closest intersection of the ray with the outer atmosphere\n    // (which is the near point of the ray passing through the atmosphere)\n    float B = 2.0 * dot(corrCameraPosition, v3Ray);\n    float C = fCameraHeight2 - fOuterRadius2;\n    float fDet = max(0.0, B*B - 4.0 * C);\n    float fNear = 0.5 * (-B - sqrt(fDet));\n\n    // Calculate the ray's starting position, then calculate its scattering offset\n    vec3 v3Start = corrCameraPosition + v3Ray * fNear;\n    fFar -= fNear;\n    float fStartAngle = dot(v3Ray, v3Start) / fOuterRadius;\n    float fStartDepth = exp(-1.0 / fScaleDepth);\n    float fStartOffset = fStartDepth * scale(fStartAngle);\n\n    // Initialize the scattering loop variables\n    float fSampleLength = fFar / fSamples;\n    float fScaledLength = fSampleLength * fScale;\n    vec3 v3SampleRay = v3Ray * fSampleLength;\n    vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;\n\n    // Now loop through the sample rays\n    vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);\n    for(int i=0; i<nSamples; i++)\n    {\n        float fHeight = length(v3SamplePoint);\n        float fDepth = exp(fScaleOverScaleDepth * (fInnerRadius - fHeight));\n        float fLightAngle = dot(m3RotY*v3LightPosition, v3SamplePoint) / fHeight;\n        float fCameraAngle = dot(v3Ray, v3SamplePoint) / fHeight;\n        float fScatter = (fStartOffset + fDepth * (scale(fLightAngle) - scale(fCameraAngle)));\n        vec3 v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI));\n\n        v3FrontColor += v3Attenuate * (fDepth * fScaledLength);\n        v3SamplePoint += v3SampleRay;\n    }\n\n    // Finally, scale the Mie and Rayleigh colors and set up the varying variables for the pixel shader\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n    c0 = v3FrontColor * (v3InvWavelength * fKrESun);\n    c1 = v3FrontColor * fKmESun;\n    v3Direction = corrCameraPosition - position;\n}",
                fragmentShader: "//\n// Atmospheric scattering fragment shader\n//\n// Author: Sean O'Neil\n//\n// Copyright (c) 2004 Sean O'Neil\n//\n\nuniform vec3 v3LightPos;\nuniform float g;\nuniform float g2;\n\nvarying vec3 v3Direction;\nvarying vec3 c0;\nvarying vec3 c1;\n\n// Calculates the Mie phase function\nfloat getMiePhase(float fCos, float fCos2, float g, float g2)\n{\n    return 1.5 * ((1.0 - g2) / (2.0 + g2)) * (1.0 + fCos2) / pow(1.0 + g2 - 2.0 * g * fCos, 1.5);\n}\n\n// Calculates the Rayleigh phase function\nfloat getRayleighPhase(float fCos2)\n{\n    return 0.75 + 0.75 * fCos2;\n}\n\nvoid main (void)\n{\n    float fCos = dot(v3LightPos, v3Direction) / length(v3Direction);\n    float fCos2 = fCos * fCos;\n\n    vec3 color =	getRayleighPhase(fCos2) * c0 +\n                    getMiePhase(fCos, fCos2, g, g2) * c1;\n\n    gl_FragColor = vec4(color, 1.0);\n    gl_FragColor.a = gl_FragColor.b;\n}",
                side: THREE.BackSide,
                transparent: true
            })
        );
    };

    /**
     * Gets or sets the ESun param of the atmosphere
     * @param {number} [val] - Value to be set
     * @returns {number} If `val` is not specified return current ESun value.
     *                  If `val` is specified sets the new value and return `this`.
     */
    CelestialObject.prototype.ESun = function(val) {
        if (!arguments.length) return this.atmosphere.ESun;

        var fKrESun = CelestialObject.uniforms.calcfKrESun(this.atmosphere.Kr, val),
            fKmESun = CelestialObject.uniforms.calcfKmESun(this.atmosphere.Km, val);

        this.atmosphere.ESun = val;
        this.ground.material.uniforms.fKrESun.value = fKrESun;
        this.ground.material.uniforms.fKmESun.value = fKmESun;
        this.sky.material.uniforms.fKmESun.value = fKmESun;
        this.sky.material.uniforms.fKrESun.value = fKrESun;

        return this;
    }

    /**
     * Gets or sets the `g` param of the atmosphere
     * @param {number} [val] - Value to be set
     * @returns {number} If `val` is not specified return current g value.
     *                   If `val` is specified sets the new value and return `this`.
     */
    CelestialObject.prototype.g = function(val) {
        if (!arguments.length) return this.atmosphere.g;

        var val2 = val * val
        this.atmosphere.g = val;
        this.sky.material.uniforms.g.value = val;
        this.sky.material.uniforms.g2.value = val2;
        this.ground.material.uniforms.g.value = val;
        this.ground.material.uniforms.g2.value = val2;

        return this;
    }

    /**
     * Gets or sets the `Km` param of the atmosphere
     * @param {number} [val] - Value to be set
     * @returns {number} If `val` is not specified return current Km value.
     *                   If `val` is specified sets the new value and return `this`.
     */
    CelestialObject.prototype.Km = function(val) {
        if (!arguments.length) return this.atmosphere.Km;

        var fKmESun = CelestialObject.uniforms.calcfKmESun(val, this.atmosphere.ESun),
            fKm4PI = CelestialObject.uniforms.calcfKm4PI(val);

        this.atmosphere.Km = val;
        this.ground.material.uniforms.fKmESun.value = fKmESun;
        this.ground.material.uniforms.fKm4PI.value = fKm4PI;
        this.sky.material.uniforms.fKm4PI.value = fKm4PI;
        this.sky.material.uniforms.fKmESun.value = fKmESun;

        return this;
    }

    /**
     * Gets or sets the `Kr` param of the atmosphere
     * @param {number} [val] - Value to be set
     * @returns {number} If `val` is not specified return current Kr value.
     *                   If `val` is specified sets the new value and return `this`.
     */
    CelestialObject.prototype.Kr = function(val) {
        if (!arguments.length) return this.atmosphere.Kr;

        var fKrESun = CelestialObject.uniforms.calcfKrESun(val, this.atmosphere.ESun),
            fKr4PI = CelestialObject.uniforms.calcfKr4PI(val);

        this.atmosphere.Kr = val;
        this.ground.material.uniforms.fKrESun.value = fKrESun;
        this.ground.material.uniforms.fKr4PI.value = fKr4PI;
        this.sky.material.uniforms.fKr4PI.value = fKr4PI;
        this.sky.material.uniforms.fKrESun.value = fKrESun;

        return this;
    }

    /**
     * Gets or sets the position of the light
     * @param {THREE.Vector3} [position] - position to be set
     * @returns {number} If `position` is not specified return current light position value.
     *                   If `position` is specified sets the new value and return `this`.
     */
    CelestialObject.prototype.lightPosition = function(position) {
        if (!arguments.length) return this.ground.material.uniforms.v3LightPosition.value;

        this.ground.material.uniforms.v3LightPosition.value.copy(position).normalize();
        this.sky.material.uniforms.v3LightPosition.value.copy(position).normalize();

        return this;
    };

    /**
     * Gets or sets the position of the object
     * @param {THREE.Vector3} [position] - positions to be set
     * @returns {number} If `position` is not specified return current light position value.
     *                   If `position` is specified sets the new value and return `this`.
     */
    CelestialObject.prototype.position = function(position) {
        if (!arguments.length) return this.ground.position;

        this.ground.position.copy(position);
        this.sky.position.copy(position);

        return this;
    };

    /**
     * Rotate object around Y-axis by the specified angle.
     * @param {number} angle - Angle in radians
     @ @returns `this`
     */
    CelestialObject.prototype.rotateY = function(angle) {
        var cosA = Math.cos(angle),
            sinA = Math.sin(angle);

        this.ground.rotation.y = angle;
        this.ground.material.uniforms.m3RotY.value.set(cosA, 0, -sinA,
                                                       0,    1, 0,
                                                       sinA, 0, cosA);
        this.sky.rotation.y = angle;
        this.sky.material.uniforms.m3RotY.value.set(cosA, 0, -sinA,
                                                    0,    1, 0,
                                                    sinA, 0, cosA);

        return this;
    };

    /**
     * Sets new object's textures.
     * @param {Object} textures - Angle in radians
     * @param {THREE.Texture} [textures.diffuse] - Texture to show on the bright side of the sphere.
     * @param {THREE.Texture} [textures.diffuseNight] - Texture to show on the dark side of the sphere.
     * @param {THREE.Texture} [textures.diffuseSpecular] - Specular texture.
     @ @returns `this`
     */
    CelestialObject.prototype.setTextures = function(textures) {
        if (textures.diffuse) {
            this.ground.material.uniforms.tDiffuse.value = textures.diffuse;
        }
        if (textures.diffuseNight) {
            this.ground.material.uniforms.tDiffuseNight.value = textures.diffuseNight;
        }
        if (textures.diffuseSpecular) {
            this.ground.material.uniforms.tDiffuseSpecular.value = textures.diffuseSpecular;
        }

        return this;
    };

    /**
     * Gets or sets the `scaleDepth` param of the atmosphere
     * @param {number} [val] - Value to be set
     * @returns {number} If `val` is not specified return current scaleDepth value.
     *                   If `val` is specified sets the new value and return `this`.
     */
    CelestialObject.prototype.scaleDepth = function(val) {
        if (!arguments.length) return this.atmosphere.scaleDepth;

        var overScale = CelestialObject.uniforms.calcfScaleOverScaleDepth(this.atmosphere.innerRadius,
                                                                          this.atmosphere.outerRadius,
                                                                          this.atmosphere.scaleDepth);
        this.atmosphere.scaleDepth = val;
        this.ground.material.uniforms.fScaleDepth.value = val;
        this.ground.material.uniforms.fScaleDepth.value = val;
        this.sky.material.uniforms.fScaleOverScaleDepth.value = overScale;
        this.sky.material.uniforms.fScaleOverScaleDepth.value = overScale;

        return this;
    }

    /**
     * Gets or sets the blue color of the atmosphere's color.
     * @param {number} [val] - Value to be set
     * @returns {number} If `val` is not specified return current value value of the blue color.
     *                   If `val` is specified sets the new value and return `this`.
     */
    CelestialObject.prototype.waveBlue = function(val) {
        if (!arguments.length) return this.atmosphere.wavelength[2];

        var blue = CelestialObject.uniforms.calcvWaveChannel(val);
        this.atmosphere.wavelength[2] = val;
        this.ground.material.uniforms.v3InvWavelength.value.setZ(blue);
        this.sky.material.uniforms.v3InvWavelength.value.setZ(blue);

        return this;
    }

    /**
     * Gets or sets the green color of the atmosphere's color.
     * @param {number} [val] - Value to be set
     * @returns {number} If `val` is not specified return current value value of the green color.
     *                   If `val` is specified sets the new value and return `this`.
     */
    CelestialObject.prototype.waveGreen = function(val) {
        if (!arguments.length) return this.atmosphere.wavelength[1];

        var green = CelestialObject.uniforms.calcvWaveChannel(val);
        this.atmosphere.wavelength[1] = val;
        this.ground.material.uniforms.v3InvWavelength.value.setY(green);
        this.sky.material.uniforms.v3InvWavelength.value.setY(green);

        return this;
    }

    /**
     * Gets or sets the red color of the atmosphere's color.
     * @param {number} [val] - Value to be set
     * @returns {number} If `val` is not specified return current value value of the red color.
     *                   If `val` is specified sets the new value and return `this`.
     */
    CelestialObject.prototype.waveRed = function(val) {
        if (!arguments.length) return this.atmosphere.wavelength[0];

        var red = CelestialObject.uniforms.calcvWaveChannel(val);
        this.atmosphere.wavelength[0] = val;
        this.ground.material.uniforms.v3InvWavelength.value.setX(red);
        this.sky.material.uniforms.v3InvWavelength.value.setX(red);

        return this;
    }

    return CelestialObject;

})();
