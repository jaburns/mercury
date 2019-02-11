import { getShaders } from "shaders";
import { CaveRenderer } from "./caveRenderer";
import { BufferRenderer } from "./bufferRenderer";
import { GaussianBlur } from "./gaussianBlur";
import { FrameBufferTexture } from "./frameBufferTexture";
import { Cave } from "caveGenerator";

export interface SurfaceInfoBuffers {
    readonly depth: WebGLTexture,
    readonly normal: WebGLTexture,
}

export const buildSurfaceInfoBuffers = (gl: WebGLRenderingContext, size: number, cave: Cave): SurfaceInfoBuffers => {
    const caveRenderer = new CaveRenderer(gl, cave, getShaders(gl).flatWhite);
    const normalsBlit = new BufferRenderer(gl, getShaders(gl).normals);
    const gaussBlur0 = new GaussianBlur(gl, size, size);
    const gaussBlur1 = new GaussianBlur(gl, size, size);

    const frameBufferTex = new FrameBufferTexture(gl, size, size);

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferTex.framebuffer);
    gl.viewport(0, 0, size, size);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    caveRenderer.draw();

    gaussBlur0.run(frameBufferTex.texture, 30);

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferTex.framebuffer);
    gl.viewport(0, 0, size, size);

    normalsBlit.draw(gaussBlur0.resultTexture, (gl, shader) => {
        gl.uniform2f(gl.getUniformLocation(shader, "u_resolution"), size, size);
    });

    gaussBlur1.run(frameBufferTex.texture, 2);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    caveRenderer.release();
    normalsBlit.release();
    const depth = gaussBlur0.releaseTexture();
    const normal = gaussBlur1.releaseTexture();

    return { depth, normal };
};
