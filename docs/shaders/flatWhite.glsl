#ifdef VERTEX

    layout(location = 0) in vec2 position;

    void main()
    {
        gl_Position = vec4(position, 0, 1);
    }

#endif
#ifdef FRAGMENT

    out vec4 f_color;

    void main()
    {
        f_color = vec4(1, 1, 1, 1);
    }

#endif