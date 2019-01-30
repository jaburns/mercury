uniform sampler2D u_tex;
uniform vec2 u_resolution;

v2f vec2 v_uv;

#ifdef VERTEX

    layout(location = 0) in vec2 position;

    void main()
    {
        gl_Position = vec4(position, 0, 1);
        v_uv = position.xy*0.5 + 0.5;
    }

#endif
#ifdef FRAGMENT

    out vec4 f_color;

    vec2 sampleTap(vec4 tap, vec2 dir)
    {
        dir /= u_resolution;
        vec4 outTap = texture(u_tex, v_uv + dir);
        return (outTap - tap).r * dir;
    }

    void main()
    {
        vec4 tap = texture(u_tex, v_uv);

        vec2 dir = normalize(
              sampleTap(tap, vec2( 1.5, 0.))
            + sampleTap(tap, vec2(-1.5, 0.))
            + sampleTap(tap, vec2(0., -1.5))
            + sampleTap(tap, vec2(0.,  1.5))
            + sampleTap(tap, vec2( 1.5,  1.5))
            + sampleTap(tap, vec2( 1.5, -1.5))
            + sampleTap(tap, vec2(-1.5, -1.5))
            + sampleTap(tap, vec2(-1.5,  1.5))
        );

        f_color = vec4(dir*0.5+0.5, 1, 1);
    }

#endif