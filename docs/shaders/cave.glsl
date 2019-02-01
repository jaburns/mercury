precision highp float;

uniform mat4 u_mvp;
uniform sampler2D u_depth;
uniform sampler2D u_normal;
uniform float u_time;

varying vec2 v_uv;

#ifdef VERTEX

    attribute vec2 i_position;

    void main()
    {
        gl_Position = u_mvp * vec4(
            i_position.x + .33*sin(u_time/2.0/2100.),
            i_position.y + .33*cos(u_time/2.0/1700.),
            -.4 + .3*sin(u_time/2./1000.),
            1
        );
        v_uv = i_position.xy*0.5 + 0.5;
    }

#endif
#ifdef FRAGMENT

    void main()
    {
        vec2 normal = 2.*texture2D(u_normal, v_uv).rg - 1.;
        float depth = clamp(1.- texture2D(u_depth, v_uv).r, 0., 1.);

        depth *= depth * 2.;

        float topLightAmount = depth * dot(normal, normalize(vec2(0,2)));
        vec3 topLight = .5*vec3(.8,.2,.1)*topLightAmount;

        float bottomLightAmount = depth * dot(normal, normalize(vec2(-0,-2)));
        vec3 bottomLight = vec3(.2,.5,.0)*bottomLightAmount;

        vec3 ambientLight = .2 * vec3(.35,.1,.05);

        gl_FragColor = vec4(topLight + bottomLight + ambientLight, 1);
    }

#endif