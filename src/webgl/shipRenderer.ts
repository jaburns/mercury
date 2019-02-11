import { vec3, vec2, mat4, quat } from "gl-matrix";
import { getShaders } from "shaders";

const verts: ReadonlyArray<number> = [0,0.2492,-0.0237,0.1102,-0.081,0.1333,-0.0506,0.04749999,-0.0564,0.0031,-0.1155,-0.0337,-0.1747,-0.003200002,-0.149,-0.09190001,-0.084,-0.1102,-0.0931,-0.158,-0.0332,-0.158,0,-0.1347,0.0332,-0.158,0.0931,-0.158,0.084,-0.1102,0.149,-0.09190001,0.1747,-0.003200002,0.1155,-0.0337,0.0564,0.0031,0.0506,0.04749999,0.081,0.1333,0.0237,0.1102];
const tris:  ReadonlyArray<number> = [0,1,11,1,3,11,3,4,11,4,5,11,5,8,11,8,9,11,9,10,11,1,2,3,5,6,7,5,7,8,11,21,0,11,19,21,11,18,19,11,17,18,11,14,17,11,13,14,11,12,13,19,20,21,14,15,17,15,16,17];

export class ShipRenderer {
    private readonly gl: WebGLRenderingContext;
    private readonly vertexBuffer: WebGLBuffer;
    private readonly indexBuffer: WebGLBuffer;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;

        this.vertexBuffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tris), gl.STATIC_DRAW);
    }

    draw(camera: vec3, position: vec2, rotoRads: number, ratio: number) {
        const gl = this.gl;
        const shader = getShaders(gl).ship;

        gl.useProgram(shader);

        camera = vec3.clone(camera);
        vec3.scale(camera, camera, -1);

        const model = mat4.fromRotationTranslationScale(mat4.create(), quat.create(), vec3.fromValues(position[0], position[1], 0), vec3.fromValues(1, 1, 1));
        const view = mat4.fromRotationTranslationScale(mat4.create(), quat.create(), camera, vec3.fromValues(1, 1, 1));
        const projection = mat4.perspective(mat4.create(), 3.14159/2, ratio, 0.01, 100);

        const mv = mat4.mul(mat4.create(), view, model);
        const mvp = mat4.mul(mat4.create(), projection, mv);
        
        gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'u_mvp'), false, mvp);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const posLoc = gl.getAttribLocation(shader, "i_position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, tris.length, gl.UNSIGNED_SHORT, 0);
    }
}
