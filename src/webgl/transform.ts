import { vec3, quat, mat4 } from "gl-matrix";

export interface Transform {
    position: vec3;
    rotation: quat;
    scale: vec3;
}

export const Transform = {
    create: (): Transform => ({
        position: vec3.create(),
        rotation: quat.create(),
        scale: vec3.fromValues(1, 1, 1),
    }),

    toMatrix: (self: Readonly<Transform>, out: mat4): mat4 =>
        mat4.fromRotationTranslationScale(out, self.rotation, self.position, self.scale),
};