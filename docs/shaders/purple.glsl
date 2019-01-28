#ifdef VERTEX

    in vec3 c;

    void main()
    {
        gl_Position = vec4(c, 1);
    }

#endif
#ifdef FRAGMENT

    out vec4 f_color;

    void main()
    {
        f_color = vec4(1, 0, 1, 1);
    }

#endif