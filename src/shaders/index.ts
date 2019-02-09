//foreach_shader import * as $ from './$.glsl';
import * as bufferCopy from './bufferCopy.glsl';//_generated
import * as cave from './cave.glsl';//_generated
import * as flatWhite from './flatWhite.glsl';//_generated
import * as gaussianBlur from './gaussianBlur.glsl';//_generated
import * as normals from './normals.glsl';//_generated

interface ShaderCollection {
    //foreach_shader readonly $: WebGLShader;
    readonly bufferCopy: WebGLShader;//_generated
    readonly cave: WebGLShader;//_generated
    readonly flatWhite: WebGLShader;//_generated
    readonly gaussianBlur: WebGLShader;//_generated
    readonly normals: WebGLShader;//_generated
}

const buildCollection = (gl: WebGLRenderingContext): ShaderCollection => ({
    //foreach_shader $: compileShader(gl, $),
    bufferCopy: compileShader(gl, bufferCopy),//_generated
    cave: compileShader(gl, cave),//_generated
    flatWhite: compileShader(gl, flatWhite),//_generated
    gaussianBlur: compileShader(gl, gaussianBlur),//_generated
    normals: compileShader(gl, normals),//_generated
});

const compiledShaders: { [canvasId: string]: ShaderCollection } = {};

export const getShaders = (gl: WebGLRenderingContext): ShaderCollection => {
    if (! (gl.canvas.id in compiledShaders)) {
        compiledShaders[gl.canvas.id] = buildCollection(gl);
    }

    return compiledShaders[gl.canvas.id];
};

const compileShader = (gl: WebGLRenderingContext, body: string): WebGLProgram => {
    const vertShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
    gl.shaderSource(vertShader, '#define VERTX\n' + body + '\n');
    gl.compileShader(vertShader);

    const vertLog = gl.getShaderInfoLog(vertShader);
    if (vertLog === null || vertLog.length > 0) {
        throw new Error(vertLog as string);
    }

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
    gl.shaderSource(fragShader, '#define FRAGMENT\n' + body + '\n');
    gl.compileShader(fragShader);

    const fragLog = gl.getShaderInfoLog(fragShader);
    if (fragLog === null || fragLog.length > 0) {
        throw new Error( fragLog as string);
    }

    const prog = gl.createProgram() as WebGLProgram;
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);

    return prog;
};