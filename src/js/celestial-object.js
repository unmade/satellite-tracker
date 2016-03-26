TRACKER.namespace('CelestialObject');

TRACKER.CelestialObject = (function() {
    'use strict';

    function CelestialObject(userConf) {
        var atmosphere,
            diffuse,
            diffuseNight,
            diffuseSpecular,
            uniforms;

        atmosphere = {
            Kr: 0.0025,
            Km: 0.0010,
            ESun: 20.0,
            g: -0.950,
            innerRadius: 100.0,
            outerRadius: 101.5,
            wavelength: [0.550, 0.50, 0.475],
            scaleDepth: 0.25,
        };
        $.extend(atmosphere, userConf.atmosphere);

        diffuse = userConf.diffuse;
        diffuseNight = userConf.diffuseNight;
        diffuseSpecular = userConf.diffuseSpecular;
        uniforms = CelestialObject.uniforms.configureUniforms(diffuse, diffuseNight, diffuseSpecular, atmosphere);

        this.atmosphere = atmosphere;
        this.ground = new THREE.Mesh(
            new THREE.SphereGeometry(atmosphere.innerRadius, 50, 50),
            new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: $("#vertexGround").text(),
                fragmentShader: $("#fragmentGround").text()
            })
        );
        this.sky = new THREE.Mesh(
            new THREE.SphereGeometry(atmosphere.outerRadius, 500, 500),
            new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: $("#vertexSky").text(),
                fragmentShader: $("#fragmentSky").text(),
                side: THREE.BackSide,
                transparent: true
            })
        );
    };

    CelestialObject.prototype.ESun = function(val) {
        if (!arguments.length) return this.atmosphere.ESun;

        var fKrESun = CelestialObject.uniforms.calcfKrESun(this.atmosphere.Kr, val),
            fKmESun = CelestialObject.uniforms.calcfKmESun(this.atmosphere.Km, val);

        this.atmosphere.ESun = val;
        this.ground.material.uniforms.fKrESun.value = fKrESun;
        this.ground.material.uniforms.fKmESun.value = fKmESun;
        this.sky.material.uniforms.fKmESun.value = fKmESun;
        this.sky.material.uniforms.fKrESun.value = fKrESun;
    }

    CelestialObject.prototype.g = function(val) {
        if (!arguments.length) return this.atmosphere.g;

        var val2 = val * val
        this.atmosphere.g = val;
        this.sky.material.uniforms.g.value = val;
        this.sky.material.uniforms.g2.value = val2;
        this.ground.material.uniforms.g.value = val;
        this.ground.material.uniforms.g2.value = val2;
    }

    CelestialObject.prototype.Km = function(val) {
        if (!arguments.length) return this.atmosphere.Km;

        var fKmESun = CelestialObject.uniforms.calcfKmESun(val, this.atmosphere.ESun),
            fKm4PI = CelestialObject.uniforms.calcfKm4PI(val);

        this.atmosphere.Km = val;
        this.ground.material.uniforms.fKmESun.value = fKmESun;
        this.ground.material.uniforms.fKm4PI.value = fKm4PI;
        this.sky.material.uniforms.fKm4PI.value = fKm4PI;
        this.sky.material.uniforms.fKmESun.value = fKmESun;
    }

    CelestialObject.prototype.Kr = function(val) {
        if (!arguments.length) return this.atmosphere.Kr;

        var fKrESun = CelestialObject.uniforms.calcfKrESun(val, this.atmosphere.ESun),
            fKr4PI = CelestialObject.uniforms.calcfKr4PI(val);

        this.atmosphere.Kr = val;
        this.ground.material.uniforms.fKrESun.value = fKrESun;
        this.ground.material.uniforms.fKr4PI.value = fKr4PI;
        this.sky.material.uniforms.fKr4PI.value = fKr4PI;
        this.sky.material.uniforms.fKrESun.value = fKrESun;
    }

    CelestialObject.prototype.lightPosition = function(position) {
        if (!arguments.length) return this.ground.material.uniforms.v3LightPosition.value;

        this.ground.material.uniforms.v3LightPosition.value.copy(position).normalize();
        this.sky.material.uniforms.v3LightPosition.value.copy(position).normalize();
    };

    CelestialObject.prototype.position = function(position) {
        if (!arguments.length) return this.ground.position;

        this.ground.position.copy(position);
        this.sky.position.copy(position);
    };

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
    };

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
    }

    CelestialObject.prototype.waveBlue = function(val) {
        if (!arguments.length) return this.atmosphere.wavelength[2];

        var blue = CelestialObject.uniforms.calcvWaveChannel(val);
        this.atmosphere.wavelength[2] = val;
        this.ground.material.uniforms.v3InvWavelength.value.setZ(blue);
        this.sky.material.uniforms.v3InvWavelength.value.setZ(blue);
    }

    CelestialObject.prototype.waveGreen = function(val) {
        if (!arguments.length) return this.atmosphere.wavelength[1];

        var green = CelestialObject.uniforms.calcvWaveChannel(val);
        this.atmosphere.wavelength[1] = val;
        this.ground.material.uniforms.v3InvWavelength.value.setY(green);
        this.sky.material.uniforms.v3InvWavelength.value.setY(green);
    }

    CelestialObject.prototype.waveRed = function(val) {
        if (!arguments.length) return this.atmosphere.wavelength[0];

        var red = CelestialObject.uniforms.calcvWaveChannel(val);
        this.atmosphere.wavelength[0] = val;
        this.ground.material.uniforms.v3InvWavelength.value.setX(red);
        this.sky.material.uniforms.v3InvWavelength.value.setX(red);
    }

    return CelestialObject;

})();
