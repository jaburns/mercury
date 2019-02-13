import { vec3, quat, mat4 } from "gl-matrix";

export interface Transform {
    position: vec3;
    rotation: quat;
    scale: vec3;
}

interface TransformStatic {
    create: () => Transform;
    toMatrix: (out: mat4, t: Transform) => mat4;
};

export const Transform: TransformStatic = {
    create: () => ({
        position: vec3.create(),
        rotation: quat.create(),
        scale: vec3.fromValues(1, 1, 1),
    }),

    toMatrix: (out, t) => mat4.fromRotationTranslationScale(out, t.rotation, t.position, t.scale),
};