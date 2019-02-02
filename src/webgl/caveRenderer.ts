import { Cave } from 'caveGenerator';
import flatten = require('lodash/flatten');
import { loadShader } from './shaderLoader';
import { mat4 } from 'gl-matrix';

const getFlatVerts = (cave: Cave): number[] =>
    flatten(flatten(cave.edges).map(x => Array.from(x)));

const getFlatIndices = (cave: Cave): number[] => {
    let baseCount = 0;
    let result: number[] = [];

    cave.triangles.forEach((tris, index) => {
        result = result.concat(tris.map(x => x + baseCount));
        baseCount += cave.edges[index].length;
    });

    return result;
};

export class CaveRenderer {
    private readonly gl: WebGLRenderingContext;
    private readonly shader: WebGLProgram;
    private readonly vertexBuffer: WebGLBuffer;
    private readonly indexBuffer: WebGLBuffer;

    private readonly indexBufferLen: number;

    static create(gl: WebGLRenderingContext, shaderPath: string, cave: Cave): Promise<CaveRenderer> {
        return loadShader(gl, shaderPath)
            .then(shader => new CaveRenderer(gl, cave, shader));
    }

    private constructor(gl: WebGLRenderingContext, cave: Cave, shader: WebGLProgram) {
        this.gl = gl;
        this.shader = shader;

        this.vertexBuffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getFlatVerts(cave)), gl.STATIC_DRAW);

        const indexBufferData = getFlatIndices(cave);
        this.indexBufferLen = indexBufferData.length;

        this.indexBuffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBufferData), gl.STATIC_DRAW);
    }

    draw() {
        const gl = this.gl;

        gl.useProgram(this.shader);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        const posLoc = gl.getAttribLocation(this.shader, "i_position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexBufferLen, gl.UNSIGNED_SHORT, 0);
    }

    // TODO this should be default draw function
    drawNice(ta: WebGLTexture, tb: WebGLTexture, t: number, zoom: number, x: number, y: number) {
        const gl = this.gl;

        gl.useProgram(this.shader);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        const posLoc = gl.getAttribLocation(this.shader, "i_position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const mvp = mat4.identity(mat4.create());
        mat4.perspective(mvp, Math.PI / 2, 1, .01, 100);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shader, "u_mvp"), false, mvp);

        gl.uniform1f(gl.getUniformLocation(this.shader, "u_time"), t);
        gl.uniform1f(gl.getUniformLocation(this.shader, "u_zoom"), zoom);
        gl.uniform2f(gl.getUniformLocation(this.shader, "u_pointLightPos"), x, y);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, ta);
        gl.uniform1i(gl.getUniformLocation(this.shader, "u_depth"), 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, tb);
        gl.uniform1i(gl.getUniformLocation(this.shader, "u_normal"), 1);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexBufferLen, gl.UNSIGNED_SHORT, 0);
    }

    release() {
        const gl = this.gl;

        gl.useProgram(null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.deleteProgram(this.shader);
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
}
