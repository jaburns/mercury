import { vec3, quat, mat4 } from "gl-matrix";
import { DeepReadonly } from "ts-essentials";

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

    toMatrix: (self: DeepReadonly<Transform>, out: mat4): mat4 =>
        mat4.fromRotationTranslationScale(out, (self.rotation as quat), (self.position as vec3), (self.scale as vec3)),
};