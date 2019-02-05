precision highp float;

uniform mat4 u_mvp;
uniform sampler2D u_depth;
uniform sampler2D u_normal;
uniform sampler2D u_normalRocks;
uniform float u_time;
uniform float u_zoom;
uniform vec2 u_pointLightPos;

varying vec2 v_uv;


float rand(vec2 c){
	return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float noise(vec2 p){
	float unit = 1.;
	vec2 ij = floor(p/unit);
	vec2 xy = mod(p,unit)/unit;
	//xy = 3.*xy*xy-2.*xy*xy*xy;
	xy = .5*(1.-cos(3.14159*xy));
	float a = rand((ij+vec2(0.,0.)));
	float b = rand((ij+vec2(1.,0.)));
	float c = rand((ij+vec2(0.,1.)));
	float d = rand((ij+vec2(1.,1.)));
	float x1 = mix(a, b, xy.x);
	float x2 = mix(c, d, xy.x);
	return mix(x1, x2, xy.y);
}



#ifdef VERTEX

    attribute vec2 i_position;

    void main()
    {
        vec2 pospos = i_position - (2.*u_pointLightPos-1.)*(1. - u_zoom);
        gl_Position = u_mvp * vec4(pospos, -u_zoom, 1);
        v_uv = i_position.xy*0.5 + 0.5;
    }

#endif
#ifdef FRAGMENT

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

    float ptLightAmount(vec2 uv, vec2 normal)
    {
        vec2 toPtLight = uv - u_pointLightPos;
        float ptLightIntensity = 1.6 + .4 * sin(u_time/100.);
        float LightAmount = clamp(dot(normalize(toPtLight), normal), 0., 1.);
        float distToPtLight = 20. * length(toPtLight);
        LightAmount *= ptLightIntensity / max(1., distToPtLight * distToPtLight);
        return LightAmount;
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

        vec3 baseColor = vec3(0,0,0);// .1 * vec3(1, .8, 1);
        baseColor += vec3(1,.2,.1) * ptLightAmount(v_uv, normalRocks.xy);

        gl_FragColor = mix(vec4(baseColor, 1), vec4(0,0,0,1), 1.-sqrt(surfDepth));
    }

#endif