precision highp float;

uniform mat4 u_model;
uniform mat4 u_mvp;
uniform sampler2D u_depth;
uniform sampler2D u_normal;
uniform sampler2D u_normalRocks;
uniform float u_time;
uniform vec3 u_shipWorldPos;

varying vec2 v_uv;
varying vec4 v_worldPos;

#ifdef VERTEX

    attribute vec2 i_position;

    void main()
    {
        v_uv = i_position*0.5 + 0.5;
        v_worldPos = u_model * vec4(i_position, 0, 1);
        gl_Position = u_mvp * vec4(i_position, 0, 1);
    }

#endif
#ifdef FRAGMENT

    #define BASE_RADIUS 0.25
    #define FADE_RADIUS 2.75

    mat3 axisAngle(vec3 normalizedAxis, float angle)
    {
        float x = normalizedAxis.x;
        float y = normalizedAxis.y;
        float z = normalizedAxis.z;
        float s = sin(angle);
        float c = cos(angle);
        float t = 1. - c;

        return mat3(
            t*x*x + c   , t*x*y - z*s , t*x*z + y*s ,
            t*x*y + z*s , t*y*y + c   , t*y*z - x*s ,
            t*x*z - y*s , t*y*z + x*s , t*z*z + c
        );
    }

    float ptLightAmount(vec2 pos, vec2 normal)
    {
        vec2 toPtLight = pos - u_shipWorldPos.xy;
        float intensity = clamp((1. + BASE_RADIUS) - length(toPtLight) / FADE_RADIUS, 0., 1.);
        float reflectedLight = clamp(dot(normalize(toPtLight), normal), 0., 1.);
        return intensity * reflectedLight;
    }

    void main()
    {
        float sint = 1.;//0.5+0.5*sin(u_time/500.);

        vec2 surfDir = 2.*texture2D(u_normal, v_uv).rg - 1.;
        float surfDepth = clamp(1.- texture2D(u_depth, v_uv).r, 0., 1.);
        surfDepth *= surfDepth;

        vec2 uv1 = v_uv - sint*surfDir*asin(surfDepth*0.05);
        vec2 lookup = uv1;
        lookup.x = 1. - lookup.x;
        lookup.y = 1. - lookup.y;
        vec2 normalRocks2d = 2.*texture2D(u_normalRocks, 5.*lookup).rg - 1.;
        normalRocks2d *= -1.;
        vec3 normalRocks = normalize(vec3(normalRocks2d, 1. - length(normalRocks2d)));
        normalRocks = axisAngle(normalize(vec3(surfDir.y, -surfDir.x, 0)), sint*3.14159*surfDepth) * normalRocks;

        vec3 baseColor = vec3(1,1,1) * ptLightAmount(v_worldPos.xy, normalRocks.xy);
        gl_FragColor = vec4(mix(baseColor, vec3(0), 1.-sqrt(surfDepth)), 1);
    }

#endif