precision highp float;

uniform sampler2D u_tex;

varying vec2 v_uv;

#ifdef VERTEX

    attribute vec2 position;

    void main()
    {
        gl_Position = vec4(position, 0, 1);
        v_uv = position.xy*0.5 + 0.5;
    }

#endif
#ifdef FRAGMENT

    void main()
    {
        gl_FragColor = texture2D(u_tex, v_uv);
    }

#endif
