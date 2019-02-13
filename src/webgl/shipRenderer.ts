import { vec3, mat4, quat } from "gl-matrix";
import { getShaders } from "shaders";
import { Transform } from "./transform";
import { Camera } from "./camera";

const verts: ReadonlyArray<number> = [0.2492,0,0.1102,-0.0237,0.1333,-0.081,0.04749999,-0.0506,0.0031,-0.0564,-0.0337,-0.1155,-0.003200002,-0.1747,-0.09190001,-0.149,-0.1102,-0.084,-0.158,-0.0931,-0.158,-0.0332,-0.1347,0,-0.158,0.0332,-0.158,0.0931,-0.1102,0.084,-0.09190001,0.149,-0.003200002,0.1747,-0.0337,0.1155,0.0031,0.0564,0.04749999,0.0506,0.1333,0.081,0.1102,0.0237];
//old [0,0.2492,-0.0237,0.1102,-0.081,0.1333,-0.0506,0.04749999,-0.0564,0.0031,-0.1155,-0.0337,-0.1747,-0.003200002,-0.149,-0.09190001,-0.084,-0.1102,-0.0931,-0.158,-0.0332,-0.158,0,-0.1347,0.0332,-0.158,0.0931,-0.158,0.084,-0.1102,0.149,-0.09190001,0.1747,-0.003200002,0.1155,-0.0337,0.0564,0.0031,0.0506,0.04749999,0.081,0.1333,0.0237,0.1102];
//new [0.2492,0,0.1102,-0.0237,0.1333,-0.081,0.04749999,-0.0506,0.0031,-0.0564,-0.0337,-0.1155,-0.003200002,-0.1747,-0.09190001,-0.149,-0.1102,-0.084,-0.158,-0.0931,-0.158,-0.0332,-0.1347,0,-0.158,0.0332,-0.158,0.0931,-0.1102,0.084,-0.09190001,0.149,-0.003200002,0.1747,-0.0337,0.1155,0.0031,0.0564,0.04749999,0.0506,0.1333,0.081,0.1102,0.0237]
const tris:  ReadonlyArray<number> = [1,0,11,3,1,11,4,3,11,5,4,11,8,5,11,9,8,11,10,9,11,2,1,3,6,5,7,7,5,8,21,11,0,19,11,21,18,11,19,17,11,18,14,11,17,13,11,14,12,11,13,20,19,21,15,14,17,16,15,17];
//old[0,1,11,1,3,11,3,4,11,4,5,11,5,8,11,8,9,11,9,10,11,1,2,3,5,6,7,5,7,8,11,21,0,11,19,21,11,18,19,11,17,18,11,14,17,11,13,14,11,12,13,19,20,21,14,15,17,15,16,17];
//new[1,0,11,3,1,11,4,3,11,5,4,11,8,5,11,9,8,11,10,9,11,2,1,3,6,5,7,7,5,8,21,11,0,19,11,21,18,11,19,17,11,18,14,11,17,13,11,14,12,11,13,20,19,21,15,14,17,16,15,17]

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

    draw(camera: Camera, ship: Transform) {
        const gl = this.gl;
        const shader = getShaders(gl).ship;

        gl.useProgram(shader);

        const mvp = Transform.toMatrix(ship, mat4.create());
        const mx = Camera.getViewMatrix(camera, mat4.create());
        mat4.mul(mvp, mx, mvp);
        Camera.getProjectionMatrix(camera, mx);
        mat4.mul(mvp, mx, mvp);
        
        gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'u_mvp'), false, mvp);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const posLoc = gl.getAttribLocation(shader, "i_position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, tris.length, gl.UNSIGNED_SHORT, 0);
    }
}
