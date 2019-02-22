import { Transform } from "./transform";
import { mat4, vec2, vec3, vec4 } from "gl-matrix";
import { Const, unconst } from "utils/lang";

const m4x = mat4.create();
const v4x = vec4.create();
const v3x = vec3.create();
const v3y = vec3.create();
const v3z = vec3.create();

export type Camera = {
    transform: Transform,
    aspectRatio: number,
    fov: number,
    near: number,
    far: number,
};

export const Camera = {
    create: (): Camera => ({
        transform: Transform.create(),
        aspectRatio: 1,
        fov: Math.PI / 2,
        near: 0.01,
        far: 100,
    }),

    getViewMatrix: (self: Const<Camera>, out: mat4): mat4 => {
        Transform.toMatrix(self.transform, out);
        return mat4.invert(out, out) as mat4;
    },

    getProjectionMatrix: (self: Const<Camera>, out: mat4): mat4 => {
        return mat4.perspective(out, self.fov, self.aspectRatio, self.near, self.far);
    },

    updateAspectRatio: (self: Camera, screenWidth: number, screenHeight: number) => {
        self.aspectRatio = screenWidth / screenHeight;
    },

    screenPointToWorldXYPlanePoint: (self: Const<Camera>, screenPoint: vec2, out: vec3): vec3 => {
        vec4.set(v4x, 2 * screenPoint[0] - 1, 2 * screenPoint[1] - 1, -1, 1);

        // v4x <- ray in view space 
        Camera.getProjectionMatrix(self, m4x);
        mat4.invert(m4x, m4x);
        vec4.transformMat4(v4x, v4x, m4x);
        v4x[2] = -1;
        v4x[3] =  0;

        // v3x <- mouse ray in world space
        Transform.toMatrix(self.transform, m4x);
        vec4.transformMat4(v4x, v4x, m4x);
        vec3.set(v3x, v4x[0], v4x[1], v4x[2]);

        // v3y <- target plane normal
        // v3z <- target plane intersect point
        vec3.set(v3y, 0, 0, -1);
        vec3.set(v3z, 0, 0,  0);

        const t = (vec3.dot(v3y, v3z) - vec3.dot(v3y, unconst(self.transform.position))) / vec3.dot(v3y, v3x);
        return vec3.scaleAndAdd(out, unconst(self.transform.position), v3x, t);
    }
};
