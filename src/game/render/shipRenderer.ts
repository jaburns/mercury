import { mat4 } from "gl-matrix";
import { getShaders } from "shaders";
import { Transform } from "graphics/transform";
import { Camera } from "graphics/camera";
import { DeepReadonly } from 'ts-essentials';

const m4x = mat4.create();
const m4y = mat4.create();

const verts: ReadonlyArray<number> = [0.2492,0,0.1102,-0.0237,0.1333,-0.081,0.04749999,-0.0506,0.0031,-0.0564,-0.0337,-0.1155,-0.003200002,-0.1747,-0.09190001,-0.149,-0.1102,-0.084,-0.158,-0.0931,-0.158,-0.0332,-0.1347,0,-0.158,0.0332,-0.158,0.0931,-0.1102,0.084,-0.09190001,0.149,-0.003200002,0.1747,-0.0337,0.1155,0.0031,0.0564,0.04749999,0.0506,0.1333,0.081,0.1102,0.0237];
const tris:  ReadonlyArray<number> = [1,0,11,3,1,11,4,3,11,5,4,11,8,5,11,9,8,11,10,9,11,2,1,3,6,5,7,7,5,8,21,11,0,19,11,21,18,11,19,17,11,18,14,11,17,13,11,14,12,11,13,20,19,21,15,14,17,16,15,17];

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

    draw(camera: DeepReadonly<Camera>, ship: DeepReadonly<Transform>) {
        const gl = this.gl;
        const shader = getShaders(gl).ship;

        gl.useProgram(shader);

        Transform.toMatrix(ship, m4x);
        Camera.getViewMatrix(camera, m4y);
        mat4.mul(m4x, m4y, m4x);
        Camera.getProjectionMatrix(camera, m4y);
        mat4.mul(m4x, m4y, m4x);
        gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'u_mvp'), false, m4x);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const posLoc = gl.getAttribLocation(shader, "i_position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, tris.length, gl.UNSIGNED_SHORT, 0);
    }

    release() {
        const gl = this.gl;

        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
}
