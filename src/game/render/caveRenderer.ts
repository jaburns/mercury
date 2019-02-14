import { Cave } from 'caveGenerator';
import flatten = require('lodash/flatten');
import { getShaders } from 'shaders';
import { BufferRenderer } from 'graphics/bufferRenderer';
import { GaussianBlur } from 'graphics/gaussianBlur';
import { FrameBufferTexture } from 'graphics/frameBufferTexture';
import { mat4, vec3 } from 'gl-matrix';
import { Camera } from 'graphics/camera';

const mxa = mat4.create();
const mxb = mat4.create();

export interface SurfaceInfoBuffers {
    readonly depth: WebGLTexture,
    readonly normal: WebGLTexture,
}

const getFlatVerts = (cave: Cave): number[] =>
    flatten(flatten(cave.edges).map(x => [x[0], -x[1]]));

const getFlatIndices = (cave: Cave): number[] => {
    let baseCount = 0;
    let result: number[] = [];

    cave.triangles.forEach((tris, index) => {
        result = result.concat(tris.map(x => x + baseCount));
        baseCount += cave.edges[index].length;
    });

    result.reverse();

    return result;
};

export class CaveRenderer {
    static readonly SURFACE_INFO_BUFFER_SIZE = 1024;
    static readonly CAVE_SIZE = 20;
    private static readonly CAVE_SCALE: vec3 = vec3.fromValues(CaveRenderer.CAVE_SIZE, CaveRenderer.CAVE_SIZE, CaveRenderer.CAVE_SIZE);

    private readonly gl: WebGLRenderingContext;
    private readonly vertexBuffer: WebGLBuffer;
    private readonly indexBuffer: WebGLBuffer;
    private readonly indexBufferLen: number;
    private readonly normalsTexture: WebGLTexture | null;
    private readonly _surfaceInfoBuffers: SurfaceInfoBuffers;

    constructor(gl: WebGLRenderingContext, cave: Cave, normalsTexture: WebGLTexture | null) {
        this.gl = gl;
        this.normalsTexture = normalsTexture;

        this.vertexBuffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getFlatVerts(cave)), gl.STATIC_DRAW);

        const indexBufferData = getFlatIndices(cave);
        this.indexBufferLen = indexBufferData.length;

        this.indexBuffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBufferData), gl.STATIC_DRAW);

        this._surfaceInfoBuffers = this.buildSurfaceInfoBuffers(CaveRenderer.SURFACE_INFO_BUFFER_SIZE);
    }

    private buildSurfaceInfoBuffers(size: number): SurfaceInfoBuffers {
        const gl = this.gl;
        const normalsBlit = new BufferRenderer(gl, getShaders(gl).normals);
        const gaussBlur0 = new GaussianBlur(gl, size, size);
        const gaussBlur1 = new GaussianBlur(gl, size, size);
        const frameBufferTex = new FrameBufferTexture(gl, size, size);
        const flatWhiteShader = getShaders(gl).flatWhite;

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferTex.framebuffer);
        gl.viewport(0, 0, size, size);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(flatWhiteShader);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const posLoc = gl.getAttribLocation(flatWhiteShader, "i_position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexBufferLen, gl.UNSIGNED_SHORT, 0);

        gaussBlur0.run(frameBufferTex.texture, 30);

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferTex.framebuffer);
        gl.viewport(0, 0, size, size);

        normalsBlit.draw(gaussBlur0.resultTexture, (gl, shader) => {
            gl.uniform2f(gl.getUniformLocation(shader, "u_resolution"), size, size);
        });

        gaussBlur1.run(frameBufferTex.texture, 2);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        normalsBlit.release();
        const depth = gaussBlur0.releaseTexture();
        const normal = gaussBlur1.releaseTexture();

        return { depth, normal };
    };

    get surfaceInfoBuffers() {
        return this._surfaceInfoBuffers;
    }

    drawDemo(t: number, zoom: number, x: number, y: number) {
        const gl = this.gl;
        const shader = getShaders(gl).caveDemo;

        gl.useProgram(shader);

        gl.uniform1f(gl.getUniformLocation(shader, "u_time"), t);
        gl.uniform1f(gl.getUniformLocation(shader, "u_zoom"), zoom);
        gl.uniform2f(gl.getUniformLocation(shader, "u_pointLightPos"), x, y);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._surfaceInfoBuffers.depth);
        gl.uniform1i(gl.getUniformLocation(shader, "u_depth"), 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this._surfaceInfoBuffers.normal);
        gl.uniform1i(gl.getUniformLocation(shader, "u_normal"), 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.normalsTexture);
        gl.uniform1i(gl.getUniformLocation(shader, "u_normalRocks"), 2);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const posLoc = gl.getAttribLocation(shader, "i_position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexBufferLen, gl.UNSIGNED_SHORT, 0);
    }

    draw(camera: Camera, shipWorldPos: vec3) {
        const gl = this.gl;
        const shader = getShaders(gl).cave;

        gl.useProgram(shader);

        mat4.identity(mxa); // mxa -> MVP matrix
        mat4.scale(mxa, mxa, CaveRenderer.CAVE_SCALE);
        gl.uniformMatrix4fv(gl.getUniformLocation(shader, "u_model"), false, mxa);

        Camera.getViewMatrix(camera, mxb);
        mat4.mul(mxa, mxb, mxa);
        Camera.getProjectionMatrix(camera, mxb);
        mat4.mul(mxa, mxb, mxa);
        gl.uniformMatrix4fv(gl.getUniformLocation(shader, "u_mvp"), false, mxa);

        gl.uniform1f(gl.getUniformLocation(shader, "u_time"), 0);
        gl.uniform3fv(gl.getUniformLocation(shader, "u_shipWorldPos"), shipWorldPos);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._surfaceInfoBuffers.depth);
        gl.uniform1i(gl.getUniformLocation(shader, "u_depth"), 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this._surfaceInfoBuffers.normal);
        gl.uniform1i(gl.getUniformLocation(shader, "u_normal"), 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.normalsTexture);
        gl.uniform1i(gl.getUniformLocation(shader, "u_normalRocks"), 2);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const posLoc = gl.getAttribLocation(shader, "i_position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexBufferLen, gl.UNSIGNED_SHORT, 0);
    }

    release() {
        const gl = this.gl;

        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.indexBuffer);
        gl.deleteTexture(this._surfaceInfoBuffers.depth);
        gl.deleteTexture(this._surfaceInfoBuffers.normal);
    }
}
