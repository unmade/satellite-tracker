vertexGround = """
    //
    // Atmospheric scattering vertex shader
    //
    // Author: Sean O'Neil
    //
    // Copyright (c) 2004 Sean O'Neil
    //
    // Ported for use with three.js/WebGL by James Baicoianu

    uniform mat3 m3RotY;
    uniform vec3 v3LightPosition;		// The direction vector to the light source
    uniform vec3 v3InvWavelength;	// 1 / pow(wavelength, 4) for the red, green, and blue channels
    uniform float fCameraHeight;	// The camera's current height
    uniform float fCameraHeight2;	// fCameraHeight^2
    uniform float fOuterRadius;		// The outer (atmosphere) radius
    uniform float fOuterRadius2;	// fOuterRadius^2
    uniform float fInnerRadius;		// The inner (planetary) radius
    uniform float fInnerRadius2;	// fInnerRadius^2
    uniform float fKrESun;			// Kr * ESun
    uniform float fKmESun;			// Km * ESun
    uniform float fKr4PI;			// Kr * 4 * PI
    uniform float fKm4PI;			// Km * 4 * PI
    uniform float fScale;			// 1 / (fOuterRadius - fInnerRadius)
    uniform float fScaleDepth;		// The scale depth (i.e. the altitude at which the atmosphere's average density is found)
    uniform float fScaleOverScaleDepth;	// fScale / fScaleDepth
    uniform sampler2D tDiffuse;

    varying vec3 v3Direction;
    varying vec3 c0;
    varying vec3 c1;
    varying vec3 vNormal;
    varying vec2 vUv;

    const int nSamples = 3;
    const float fSamples = 3.0;

    float scale(float fCos)
    {
        float x = 1.0 - fCos;
        return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));
    }

    void main(void)
    {

        vec3 corrCameraPosition = m3RotY * cameraPosition;
        // Get the ray from the camera to the vertex and its length
        // (which is the far point of the ray passing through the atmosphere)

        vec3 v3Ray = position - corrCameraPosition;
        float fFar = length(v3Ray);
        v3Ray /= fFar;

        // Calculate the closest intersection of the ray with the outer atmosphere
        // (which is the near point of the ray passing through the atmosphere)
        float B = 2.0 * dot(corrCameraPosition, v3Ray);
        float C = fCameraHeight2 - fOuterRadius2;
        float fDet = max(0.0, B*B - 4.0 * C);
        float fNear = 0.5 * (-B - sqrt(fDet));

        // Calculate the ray's starting position, then calculate its scattering offset
        vec3 v3Start = corrCameraPosition + v3Ray * fNear;
        fFar -= fNear;
        float fDepth = exp((fInnerRadius - fOuterRadius) / fScaleDepth);
        float fCameraAngle = dot(-v3Ray, position) / length(position);
        float fLightAngle = dot(m3RotY*v3LightPosition, position) / length(position);
        float fCameraScale = scale(fCameraAngle);
        float fLightScale = scale(fLightAngle);
        float fCameraOffset = fDepth*fCameraScale;
        float fTemp = (fLightScale + fCameraScale);

        // Initialize the scattering loop variables
        float fSampleLength = fFar / fSamples;
        float fScaledLength = fSampleLength * fScale;
        vec3 v3SampleRay = v3Ray * fSampleLength;
        vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;

        // Now loop through the sample rays
        vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);
        vec3 v3Attenuate;
        for(int i=0; i<nSamples; i++)
        {
            float fHeight = length(v3SamplePoint);
            float fDepth = exp(fScaleOverScaleDepth * (fInnerRadius - fHeight));
            float fScatter = fDepth*fTemp - fCameraOffset;
            v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI)) / 1.1;
            v3FrontColor += v3Attenuate * (fDepth * fScaledLength);
            v3SamplePoint += v3SampleRay;
        }

        // Calculate the attenuation factor for the ground
        c0 = v3Attenuate;
        c1 = v3FrontColor * (v3InvWavelength * fKrESun + fKmESun);

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        vUv = uv;
        vNormal = normal;
    }
"""

fragmentGround = """
    //
    // Atmospheric scattering fragment shader
    //
    // Author: Sean O'Neil
    //
    // Copyright (c) 2004 Sean O'Neil
    //
    // Ported for use with three.js/WebGL by James Baicoianu

    uniform mat3 m3RotY;
    uniform float fNightScale;
    uniform float fSpecularScale;
    uniform float fSpecularSize;
    uniform vec3 v3LightPosition;
    uniform sampler2D tDiffuse;
    uniform sampler2D tDiffuseNight;
    uniform sampler2D tDiffuseSpecular;

    varying vec3 c0;
    varying vec3 c1;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main (void)
    {
        vec3 diffuseTex = texture2D( tDiffuse, vUv ).xyz;
        vec3 diffuseNightTex = texture2D( tDiffuseNight, vUv ).xyz;
        vec3 diffuseSpecularTex = texture2D(tDiffuseSpecular, vUv).xyz;

        float specularMix = pow(fSpecularScale * dot(normalize(vNormal), m3RotY*v3LightPosition), fSpecularSize) *
                                (diffuseSpecularTex.z * 0.5);

        vec3 day = diffuseTex * c0;
        vec3 night = fNightScale * diffuseNightTex * diffuseNightTex * diffuseNightTex * (1.0 - c0);
        vec3 specular = diffuseSpecularTex * specularMix * c0;

        gl_FragColor = vec4(c1, 1.0) + vec4(day + night + specular, 1.0);
    }
"""

vertexSky = """
    //
    // Atmospheric scattering vertex shader
    //
    // Author: Sean O'Neil
    //
    // Copyright (c) 2004 Sean O'Neil
    //

    uniform mat3 m3RotY;
    uniform vec3 v3LightPosition;	// The direction vector to the light source
    uniform vec3 v3InvWavelength;	// 1 / pow(wavelength, 4) for the red, green, and blue channels
    uniform float fCameraHeight;	// The camera's current height
    uniform float fCameraHeight2;	// fCameraHeight^2
    uniform float fOuterRadius;		// The outer (atmosphere) radius
    uniform float fOuterRadius2;	// fOuterRadius^2
    uniform float fInnerRadius;		// The inner (planetary) radius
    uniform float fInnerRadius2;	// fInnerRadius^2
    uniform float fKrESun;			// Kr * ESun
    uniform float fKmESun;			// Km * ESun
    uniform float fKr4PI;			// Kr * 4 * PI
    uniform float fKm4PI;			// Km * 4 * PI
    uniform float fScale;			// 1 / (fOuterRadius - fInnerRadius)
    uniform float fScaleDepth;		// The scale depth (i.e. the altitude at which the atmosphere's average density is found)
    uniform float fScaleOverScaleDepth;	// fScale / fScaleDepth

    const int nSamples = 3;
    const float fSamples = 3.0;

    varying vec3 v3Direction;
    varying vec3 c0;
    varying vec3 c1;


    float scale(float fCos)
    {
        float x = 1.0 - fCos;
        return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));
    }

    void main(void)
    {
        vec3 corrCameraPosition = m3RotY * cameraPosition;
        // Get the ray from the camera to the vertex and its length
        // (which is the far point of the ray passing through the atmosphere)
        vec3 v3Ray = position - corrCameraPosition;
        float fFar = length(v3Ray);
        v3Ray /= fFar;

        // Calculate the closest intersection of the ray with the outer atmosphere
        // (which is the near point of the ray passing through the atmosphere)
        float B = 2.0 * dot(corrCameraPosition, v3Ray);
        float C = fCameraHeight2 - fOuterRadius2;
        float fDet = max(0.0, B*B - 4.0 * C);
        float fNear = 0.5 * (-B - sqrt(fDet));

        // Calculate the ray's starting position, then calculate its scattering offset
        vec3 v3Start = corrCameraPosition + v3Ray * fNear;
        fFar -= fNear;
        float fStartAngle = dot(v3Ray, v3Start) / fOuterRadius;
        float fStartDepth = exp(-1.0 / fScaleDepth);
        float fStartOffset = fStartDepth * scale(fStartAngle);

        // Initialize the scattering loop variables
        float fSampleLength = fFar / fSamples;
        float fScaledLength = fSampleLength * fScale;
        vec3 v3SampleRay = v3Ray * fSampleLength;
        vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;

        // Now loop through the sample rays
        vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);
        for(int i=0; i<nSamples; i++)
        {
            float fHeight = length(v3SamplePoint);
            float fDepth = exp(fScaleOverScaleDepth * (fInnerRadius - fHeight));
            float fLightAngle = dot(m3RotY*v3LightPosition, v3SamplePoint) / fHeight;
            float fCameraAngle = dot(v3Ray, v3SamplePoint) / fHeight;
            float fScatter = (fStartOffset + fDepth * (scale(fLightAngle) - scale(fCameraAngle)));
            vec3 v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI));

            v3FrontColor += v3Attenuate * (fDepth * fScaledLength);
            v3SamplePoint += v3SampleRay;
        }

        // Finally, scale the Mie and Rayleigh colors and set up the varying variables for the pixel shader
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        c0 = v3FrontColor * (v3InvWavelength * fKrESun);
        c1 = v3FrontColor * fKmESun;
        v3Direction = corrCameraPosition - position;
    }
"""

fragmentSky = """
    //
    // Atmospheric scattering fragment shader
    //
    // Author: Sean O'Neil
    //
    // Copyright (c) 2004 Sean O'Neil
    //

    uniform vec3 v3LightPos;
    uniform float g;
    uniform float g2;

    varying vec3 v3Direction;
    varying vec3 c0;
    varying vec3 c1;

    // Calculates the Mie phase function
    float getMiePhase(float fCos, float fCos2, float g, float g2)
    {
        return 1.5 * ((1.0 - g2) / (2.0 + g2)) * (1.0 + fCos2) / pow(1.0 + g2 - 2.0 * g * fCos, 1.5);
    }

    // Calculates the Rayleigh phase function
    float getRayleighPhase(float fCos2)
    {
        return 0.75 + 0.75 * fCos2;
    }

    void main (void)
    {
        float fCos = dot(v3LightPos, v3Direction) / length(v3Direction);
        float fCos2 = fCos * fCos;

        vec3 color =	getRayleighPhase(fCos2) * c0 +
                        getMiePhase(fCos, fCos2, g, g2) * c1;

        gl_FragColor = vec4(color, 1.0);
        gl_FragColor.a = gl_FragColor.b;
    }
"""
