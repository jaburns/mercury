uniform sampler2D tex;

v2f vec2 uv;

vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
    vec4 color = vec4(0.0);
    vec2 off1 = vec2(1.411764705882353) * direction;
    vec2 off2 = vec2(3.2941176470588234) * direction;
    vec2 off3 = vec2(5.176470588235294) * direction;
    color += texture(image, uv) * 0.1964825501511404;
    color += texture(image, uv + (off1 / resolution)) * 0.2969069646728344;
    color += texture(image, uv - (off1 / resolution)) * 0.2969069646728344;
    color += texture(image, uv + (off2 / resolution)) * 0.09447039785044732;
    color += texture(image, uv - (off2 / resolution)) * 0.09447039785044732;
    color += texture(image, uv + (off3 / resolution)) * 0.010381362401148057;
    color += texture(image, uv - (off3 / resolution)) * 0.010381362401148057;
    return color;
}

#ifdef VERTEX

    in vec3 c;

    void main()
    {
        gl_Position = vec4(c, 1);
        uv = c.xy*0.5 + 0.5;
    }

#endif
#ifdef FRAGMENT

    out vec4 f_color;

    void main()
    {
        // TODO multipass blur instead of to 1,1 
        f_color = blur13(tex, uv, vec2(300,300)*sqrt(2.), normalize(vec2(1,1)));
    }

#endif