import { vec3, quat, mat4 } from "gl-matrix";
import { Const, unconst } from 'utils/lang';

export type Transform = {
    position: vec3,
    rotation: quat,
    scale: vec3,
};

export const Transform = {
    create: (): Transform => ({
        position: vec3.create(),
        rotation: quat.create(),
        scale: vec3.fromValues(1, 1, 1),
    }),

    toMatrix: (self: Const<Transform>, out: mat4): mat4 =>
        mat4.fromRotationTranslationScale(out, unconst(self.rotation), unconst(self.position), unconst(self.scale)),
};