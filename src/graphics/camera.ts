import { Transform } from "./transform";
import { mat4, vec2, vec3, vec4 } from "gl-matrix";
import { DeepReadonly } from "ts-essentials";

const mxa = mat4.create();
const v4a = vec4.create();
const v3a = vec3.create();
const v3b = vec3.create();
const v3c = vec3.create();

export interface Camera {
    transform: Transform;
    aspectRatio: number;
    fov: number;
    near: number;
    far: number;
}

export const Camera = {
    create: (): Camera => ({
        transform: Transform.create(),
        aspectRatio: 1,
        fov: Math.PI / 2,
        near: 0.01,
        far: 100,
    }),

    getViewMatrix: (self: DeepReadonly<Camera>, out: mat4): mat4 => {
        Transform.toMatrix(self.transform, out);
        return mat4.invert(out, out) as mat4;
    },

    getProjectionMatrix: (self: DeepReadonly<Camera>, out: mat4): mat4 => {
        return mat4.perspective(out, self.fov, self.aspectRatio, self.near, self.far);
    },

    updateAspectRatio: (self: Camera, screenWidth: number, screenHeight: number) => {
        self.aspectRatio = screenWidth / screenHeight;
    },

    screenPointToWorldXYPlanePoint: (self: DeepReadonly<Camera>, screenPoint: vec2, out: vec3): vec3 => {
        vec4.set(v4a, 2 * screenPoint[0] - 1, 2 * screenPoint[1] - 1, -1, 1);

        // v4a <- ray in view space 
        Camera.getProjectionMatrix(self, mxa);
        mat4.invert(mxa, mxa);
        vec4.transformMat4(v4a, v4a, mxa);
        v4a[2] = -1;
        v4a[3] =  0;

        // v3a <- mouse ray in world space
        Transform.toMatrix(self.transform, mxa);
        vec4.transformMat4(v4a, v4a, mxa);
        vec3.set(v3a, v4a[0], v4a[1], v4a[2]);

        // v3b <- target plane normal
        // v3c <- target plane intersect point
        vec3.set(v3b, 0, 0, -1);
        vec3.set(v3c, 0, 0,  0);

        const t = (vec3.dot(v3b, v3c) - vec3.dot(v3b, self.transform.position as vec3)) / vec3.dot(v3b, v3a);
        return vec3.scaleAndAdd(out, self.transform.position as vec3, v3a, t);
    }
};
