import { Transform } from "./transform";
import { mat4, vec2, vec3, vec4 } from "gl-matrix";

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

    getViewMatrix: (self: Readonly<Camera>, out: mat4): mat4 => {
        Transform.toMatrix(self.transform, out);
        return mat4.invert(out, out) as mat4;
    },

    getProjectionMatrix: (self: Readonly<Camera>, out: mat4): mat4 => {
        return mat4.perspective(out, self.fov, self.aspectRatio, self.near, self.far);
    },

    updateAspectRatio: (self: Camera, screenWidth: number, screenHeight: number) => {
        self.aspectRatio = screenWidth / screenHeight;
    },

    screenPointToRay: (self: Readonly<Camera>, screenPoint: vec2, out: vec3): vec3 => {
        const rayClip = vec4.fromValues(2 * screenPoint[0] - 1, 2 * screenPoint[1] - 1, -1, 1);

        const invProjMx = Camera.getProjectionMatrix(self, mat4.create());
        mat4.invert(invProjMx, invProjMx);
        const rayEye = vec4.transformMat4(vec4.create(), rayClip, invProjMx);
        rayEye[2] = -1;
        rayEye[3] =  0;

        const invViewMx = Transform.toMatrix(self.transform, mat4.create());
        const rayWorld = vec4.transformMat4(vec4.create(), rayEye, invViewMx);
        rayWorld[3] = 0;

        const mouseRay = vec3.fromValues(rayWorld[0], rayWorld[1], rayWorld[2]);

        // actually.... this isn't screen point to ray it also intersects the ray with the xy plane
        // https://github.com/jaburns/galaxyriders/blob/master/src/client/core.cpp#L41

        const planeNormal = vec3.fromValues(0, 0, -1);
        const planeCoord = vec3.create();
        const t = (vec3.dot(planeNormal, planeCoord) - vec3.dot(planeNormal, self.transform.position)) / vec3.dot(planeNormal, mouseRay);

        return vec3.scaleAndAdd(out, self.transform.position, mouseRay, t);
    }
};
