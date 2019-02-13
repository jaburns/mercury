import { Transform } from "./transform";
import { vec3, mat4 } from "gl-matrix";

export class Camera {
    readonly transform: Transform;
    readonly viewMatrix: mat4;
    readonly projectionMatrix: mat4;
    readonly vpMatrix: mat4;
    private aspectRatio: number;

    constructor() {
        this.transform = Transform.create();
        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        this.vpMatrix = mat4.create();
    }

    updateProjectionMatrix(width: number, height: number) {
        const aspectRatio = width / height;
        mat4.perspective(this.projectionMatrix, 3.14159/2, aspectRatio, 0.01, 100);
        mat4.mul(this.vpMatrix, this.projectionMatrix, this.viewMatrix);
    }

    updateViewMatrix() {
        Transform.toMatrix(this.viewMatrix, this.transform);
        mat4.invert(this.viewMatrix, this.viewMatrix);
        mat4.mul(this.vpMatrix, this.projectionMatrix, this.viewMatrix);
    }
}