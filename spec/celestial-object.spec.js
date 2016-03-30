describe("test CelestialObject", function() {
    'use strict';

    var CelestialObject,
        uniforms,
        co;

    beforeEach(function (){
        CelestialObject = TRACKER.CelestialObject;
        uniforms = TRACKER.CelestialObject.uniforms;
        co = new TRACKER.CelestialObject({
            atmosphere: {
                innerSegments: 16,
                outerSegments: 16
            }
        });
    });

    it('should init new CelestialObject', function() {
        expect(co.atmosphere.Kr).toBe(0.0025);
        expect(co.atmosphere.Km).toBe(0.0010);
        expect(co.atmosphere.ESun).toBe(20.0);
        expect(co.atmosphere.g).toBe(-0.950);
        expect(co.atmosphere.innerRadius).toBe(100.0);
        expect(co.atmosphere.outerRadius).toBe(101.5);
        expect(co.atmosphere.wavelength).toEqual([0.550, 0.50, 0.475]);
        expect(co.atmosphere.scaleDepth).toBe(0.25);

        expect(co.ground).toBeDefined();
        expect(co.ground.material.uniforms).toBeDefined();
        expect(co.sky).toBeDefined();
        expect(co.sky.material.uniforms).toBeDefined();
    });

    it('should init new Celestial Object with user params', function() {
        var texture = new THREE.Texture();
        var userConf = {
            diffuse: texture,
            diffuseNight: texture,
            diffuseSpecular: texture,
            atmosphere: {
                Kr: 0.002,
                Km: 0.003,
                ESun: 10.0,
                g: -0.850,
                innerRadius: 101.0,
                innerSegments: 32,
                outerRadius: 102.5,
                outerSegments: 64,
                wavelength: [0.65, 0.49, 0.485],
                scaleDepth: 0.2,
            }
        }
        var newCo = new CelestialObject(userConf);

        expect(newCo.atmosphere.Kr).toBe(0.002);
        expect(newCo.atmosphere.Km).toBe(0.003);
        expect(newCo.atmosphere.ESun).toBe(10.0);
        expect(newCo.atmosphere.g).toBe(-0.850);
        expect(newCo.atmosphere.innerRadius).toBe(101.0);
        expect(newCo.atmosphere.innerSegments).toBe(32);
        expect(newCo.atmosphere.outerRadius).toBe(102.5);
        expect(newCo.atmosphere.outerSegments).toBe(64);
        expect(newCo.atmosphere.wavelength).toEqual([0.65, 0.49, 0.485]);
        expect(newCo.atmosphere.scaleDepth).toBe(0.2);

        expect(newCo.ground).toBeDefined();
        expect(newCo.ground.material.uniforms).toBeDefined();
        expect(newCo.sky).toBeDefined();
        expect(newCo.sky.material.uniforms).toBeDefined();

        expect(newCo.ground.material.uniforms.tDiffuse.value).toEqual(texture);
        expect(newCo.ground.material.uniforms.tDiffuseNight.value).toEqual(texture);
        expect(newCo.ground.material.uniforms.tDiffuseSpecular.value).toEqual(texture);
    });

    it('should get/set ESun value', function() {
        expect(co.ESun()).toBe(20.0);

        var val = 10,
            fKrESun = uniforms.calcfKrESun(co.atmosphere.Kr, val),
            fKmESun = uniforms.calcfKmESun(co.atmosphere.Km, val);

        co.ESun(val);
        expect(co.ESun()).toBe(val);
        expect(co.atmosphere.ESun).toBe(val);
        expect(co.ground.material.uniforms.fKrESun.value).toBe(fKrESun);
        expect(co.ground.material.uniforms.fKmESun.value).toBe(fKmESun);
        expect(co.sky.material.uniforms.fKmESun.value).toBe(fKmESun);
        expect(co.sky.material.uniforms.fKrESun.value).toBe(fKrESun);
    });

    it('should get/set g value', function() {
        expect(co.g()).toBe(-0.950);

        var val = 10;

        co.g(val);
        expect(co.g()).toBe(val);
        expect(co.atmosphere.g).toBe(val);
        expect(co.ground.material.uniforms.g.value).toBe(val);
        expect(co.ground.material.uniforms.g2.value).toBe(val*val);
    });

    it('should get/set Kr value', function() {
        expect(co.Kr()).toBe(0.0025);

        var val = 10,
            fKrESun = uniforms.calcfKrESun(val, co.atmosphere.ESun);

        co.Kr(val);
        expect(co.Kr()).toBe(val);
        expect(co.atmosphere.Kr).toBe(val);
        expect(co.ground.material.uniforms.fKrESun.value).toBe(fKrESun);
        expect(co.ground.material.uniforms.fKr4PI.value).toBe(val*4*Math.PI);
        expect(co.sky.material.uniforms.fKrESun.value).toBe(fKrESun);
        expect(co.sky.material.uniforms.fKr4PI.value).toBe(val*4*Math.PI);
    });

    it('should get/set Km value', function() {
        expect(co.Km()).toBe(0.0010);

        var val = 10,
            fKmESun = uniforms.calcfKmESun(val, co.atmosphere.ESun);

        co.Km(val);
        expect(co.Km()).toBe(val);
        expect(co.atmosphere.Km).toBe(val);
        expect(co.ground.material.uniforms.fKmESun.value).toBe(fKmESun);
        expect(co.ground.material.uniforms.fKm4PI.value).toBe(val*4*Math.PI);
        expect(co.sky.material.uniforms.fKmESun.value).toBe(fKmESun);
        expect(co.sky.material.uniforms.fKm4PI.value).toBe(val*4*Math.PI);
    });

    it('should get/set light position', function() {
        expect(co.lightPosition()).toEqual(new THREE.Vector3(1e8, 0, 1e8).normalize());

        var newLightPosition = new THREE.Vector3(2,4,5).normalize();
        co.lightPosition(newLightPosition);
        expect(co.lightPosition()).toEqual(newLightPosition);
        expect(co.ground.material.uniforms.v3LightPosition.value).toEqual(newLightPosition);
        expect(co.sky.material.uniforms.v3LightPosition.value).toEqual(newLightPosition);
    });

    it('should get/set position', function() {
        expect(co.position()).toEqual(new THREE.Vector3(0, 0, 0).normalize());

        var newPosition = new THREE.Vector3(2,4,5).normalize();
        co.position(newPosition);
        expect(co.position()).toEqual(newPosition);
        expect(co.ground.position).toEqual(newPosition);
        expect(co.sky.position).toEqual(newPosition);
    });

    it('should rotate object around Y-axis by the specified angle', function() {
        var angle = Math.PI / 2,
            cosA = Math.cos(angle),
            sinA = Math.sin(angle),
            rotY = new THREE.Matrix3();

        expect(co.ground.rotation.y).toBe(0);
        expect(co.ground.material.uniforms.m3RotY.value).toEqual(rotY);
        expect(co.sky.rotation.y).toBe(0);
        expect(co.sky.material.uniforms.m3RotY.value).toEqual(rotY);

        co.rotateY(angle);
        rotY.set(cosA, 0, -sinA,
                 0,    1, 0,
                 sinA, 0, cosA);

        expect(co.ground.rotation.y).toBe(angle);
        expect(co.ground.material.uniforms.m3RotY.value).toEqual(rotY);
        expect(co.sky.rotation.y).toBe(angle);
        expect(co.sky.material.uniforms.m3RotY.value).toEqual(rotY);
    });

    it('should set new textures', function() {
        var texture = new THREE.Texture();

        expect(co.ground.material.uniforms.tDiffuse.value).toBe(undefined);
        expect(co.ground.material.uniforms.tDiffuseNight.value).toBe(undefined);
        expect(co.ground.material.uniforms.tDiffuseSpecular.value).toBe(undefined);

        co.setTextures({diffuse: texture});
        expect(co.ground.material.uniforms.tDiffuse.value).toEqual(texture);
        expect(co.ground.material.uniforms.tDiffuseNight.value).toBe(undefined);
        expect(co.ground.material.uniforms.tDiffuseSpecular.value).toBe(undefined);

        co.setTextures({diffuseNight: texture});
        expect(co.ground.material.uniforms.tDiffuse.value).toEqual(texture);
        expect(co.ground.material.uniforms.tDiffuseNight.value).toEqual(texture);
        expect(co.ground.material.uniforms.tDiffuseSpecular.value).toBe(undefined);

        co.setTextures({diffuseSpecular: texture});
        expect(co.ground.material.uniforms.tDiffuse.value).toEqual(texture);
        expect(co.ground.material.uniforms.tDiffuseNight.value).toEqual(texture);
        expect(co.ground.material.uniforms.tDiffuseSpecular.value).toEqual(texture);
    });

    it('should get/set scaleDepth value', function() {
        expect(co.scaleDepth()).toBe(0.25);

        var val = 10,
            overScale = uniforms.calcfScaleOverScaleDepth(co.atmosphere.innerRadius,
                                                          co.atmosphere.outerRadius,
                                                          co.atmosphere.scaleDepth);

        co.scaleDepth(val);
        expect(co.scaleDepth()).toBe(val);
        expect(co.atmosphere.scaleDepth).toBe(val);
        expect(co.ground.material.uniforms.fScaleDepth.value).toBe(val);
        expect(co.ground.material.uniforms.fScaleOverScaleDepth.value).toBe(overScale);
        expect(co.sky.material.uniforms.fScaleDepth.value).toBe(val);
        expect(co.sky.material.uniforms.fScaleOverScaleDepth.value).toBe(overScale);
    });

    it('should get/set the blue color value of the atmosphere\'s color.', function() {
        expect(co.waveBlue()).toBe(0.475);

        var val = 10,
            blue = uniforms.calcvWaveChannel(val);

        co.waveBlue(val);
        expect(co.waveBlue()).toBe(val);
        expect(co.atmosphere.wavelength[2]).toBe(val);
        expect(co.ground.material.uniforms.v3InvWavelength.value.z).toBe(blue);
        expect(co.sky.material.uniforms.v3InvWavelength.value.z).toBe(blue);
    });

    it('should get/set the green color value of the atmosphere\'s color.', function() {
        expect(co.waveGreen()).toBe(0.5);

        var val = 10,
            green = uniforms.calcvWaveChannel(val);

        co.waveGreen(val);
        expect(co.waveGreen()).toBe(val);
        expect(co.atmosphere.wavelength[1]).toBe(val);
        expect(co.ground.material.uniforms.v3InvWavelength.value.y).toBe(green);
        expect(co.sky.material.uniforms.v3InvWavelength.value.y).toBe(green);
    });

    it('should get/set the red color value of the atmosphere\'s color.', function() {
        expect(co.waveRed()).toBe(0.55);

        var val = 1,
            red = uniforms.calcvWaveChannel(val);

        co.waveRed(val);
        expect(co.waveRed()).toBe(val);
        expect(co.atmosphere.wavelength[0]).toBe(val);
        expect(co.ground.material.uniforms.v3InvWavelength.value.x).toBe(red);
        expect(co.sky.material.uniforms.v3InvWavelength.value.x).toBe(red);
    });

    it('should test method chaining', function() {
        var obj = co.ESun(10.0)
            .g(0.1)
            .Km(0.01)
            .Kr(1)
            .lightPosition(new THREE.Vector3())
            .position(new THREE.Vector3())
            .rotateY(1.57)
            .setTextures({})
            .scaleDepth(11)
            .waveBlue(0.05)
            .waveGreen(0.12)
            .waveRed(1.2);

        expect(obj).toEqual(co);
    });

});
