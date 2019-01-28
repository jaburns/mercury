const VERT_HEADER = 
    `#version 300 es
    #define VERTEX
    #define v2f out
    `;

const FRAG_HEADER = 
    `#version 300 es
    #define FRAGMENT
    #define v2f in
    precision highp float;
    `;

const buildProgram = (gl: WebGLRenderingContext, body: string): WebGLProgram | string => {
    const vertShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
    gl.shaderSource(vertShader, VERT_HEADER + body + '\n');
    gl.compileShader(vertShader);

    const vertLog = gl.getShaderInfoLog(vertShader);
    if (vertLog === null || vertLog.length > 0) {
        return vertLog as string;
    }

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
    gl.shaderSource(fragShader, FRAG_HEADER + body + '\n');
    gl.compileShader(fragShader);

    const fragLog = gl.getShaderInfoLog(fragShader);
    if (fragLog === null || fragLog.length > 0) {
        return fragLog as string;
    }

    const prog = gl.createProgram() as WebGLProgram;
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    return prog;
};

export const loadShader = (gl: WebGLRenderingContext, url: string): Promise<WebGLProgram | string> =>
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("HTTP error, status = " + response.status);
            return response.text();
        })
        .then(shader => buildProgram(gl, shader));