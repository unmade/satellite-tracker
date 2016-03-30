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
                vertexShader: $("#vertexGround").text(),
                fragmentShader: $("#fragmentGround").text()
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
                vertexShader: $("#vertexSky").text(),
                fragmentShader: $("#fragmentSky").text(),
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
