precision highp float;

uniform mat4 u_mvp;
uniform sampler2D u_depth;
uniform sampler2D u_normal;
uniform float u_time;
uniform float u_zoom;
uniform vec2 u_pointLightPos;

varying vec2 v_uv;

#ifdef VERTEX

    attribute vec2 i_position;

    void main()
    {
    //  gl_Position = u_mvp * vec4(
    //      i_position.x + .33*sin(u_time/2.0/2100.),
    //      i_position.y + .33*cos(u_time/2.0/1700.),
    //      -.4 + .3*sin(u_time/2./1000.),
    //      1
    //  );

        vec2 pospos = i_position - (2.*u_pointLightPos-1.)*(1. - u_zoom);
        //
        gl_Position = u_mvp * vec4(pospos, -u_zoom, 1);
        v_uv = i_position.xy*0.5 + 0.5;
    }

#endif
#ifdef FRAGMENT

    void main()
    {
        vec2 normal = 2.*texture2D(u_normal, v_uv).rg - 1.;
        float depth = clamp(1.- texture2D(u_depth, v_uv).r, 0., 1.);
        depth = 2. * pow(depth, 2.);

        float directionalLightAmount = clamp(dot(normalize(vec2(1,-2)), normal), 0., 1.);

        vec2 toPtLight = v_uv - u_pointLightPos;
        float ptLightIntensity = 1.6 + .4 * sin(u_time/100.);
        float ptLightAmount = clamp(dot(normalize(toPtLight), normal), 0., 1.);
        float distToPtLight = 20. * length(toPtLight);
        ptLightAmount *= ptLightIntensity / max(1., distToPtLight * distToPtLight);

        vec3 baseColor = .1 * vec3(1, .8, 1);
        baseColor += vec3(1,0,1) * depth * directionalLightAmount;
        baseColor += vec3(1,0,0) * depth * ptLightAmount;

        gl_FragColor = vec4(baseColor, 1);
    }

#endif