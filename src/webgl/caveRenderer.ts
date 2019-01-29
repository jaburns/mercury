import { Cave } from 'caveGenerator';
import flatten = require('lodash/flatten');
import { loadShader } from './shaderLoader';

const getFlatVerts = (cave: Cave): number[] =>
    flatten(flatten(cave.edges).map(v => [v.x, v.y]));

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
    private readonly gl: WebGL2RenderingContext;
    private readonly shader: WebGLProgram;

    private readonly vao: WebGLVertexArrayObject;
    private readonly vertexBuffer: WebGLBuffer;
    private readonly indexBuffer: WebGLBuffer;

    private readonly indexBufferLen: number;

    static create(gl: WebGL2RenderingContext, cave: Cave): Promise<CaveRenderer> {
        return loadShader(gl, 'shaders/flatWhite.glsl')
            .then(shader => new CaveRenderer(gl, cave, shader));
    }

    private constructor(gl: WebGL2RenderingContext, cave: Cave, shader: WebGLProgram) {
        this.gl = gl;
        this.shader = shader;

        this.vao = gl.createVertexArray() as WebGLVertexArrayObject;
        gl.bindVertexArray(this.vao);

        this.vertexBuffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getFlatVerts(cave)), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        const indexBufferData = getFlatIndices(cave);
        this.indexBufferLen = indexBufferData.length;

        this.indexBuffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBufferData), gl.STATIC_DRAW);
    }

    draw() {
        const gl = this.gl;

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.useProgram(this.shader);

        gl.drawElements(gl.TRIANGLES, this.indexBufferLen, gl.UNSIGNED_SHORT, 0);
    }

    delete() {
        const gl = this.gl;

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.indexBuffer);
        gl.deleteVertexArray(this.vao);
    }
}
