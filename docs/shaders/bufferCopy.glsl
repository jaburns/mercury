uniform sampler2D u_tex;

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

    void main()
    {
        f_color = texture(u_tex, v_uv);
    }

#endif
