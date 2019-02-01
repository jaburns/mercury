import { generateCave, Cave } from 'caveGenerator';
import { CaveRenderer } from "webgl/caveRenderer";
import { FrameBufferTexture } from "webgl/frameBufferTexture";
import { BufferRenderer } from 'webgl/bufferRenderer';
import { GaussianBlur } from 'webgl/gaussianBlur';


interface SurfaceInfoBuffers {
    readonly depth: WebGLTexture,
    readonly normal: WebGLTexture,
}

const buildSurfaceInfoBuffers = (gl: WebGLRenderingContext, size: number, cave: Cave): Promise<SurfaceInfoBuffers> =>
    Promise.all([
        CaveRenderer.create(gl, 'shaders/flatWhite.glsl', cave),
        BufferRenderer.create(gl, 'shaders/normals.glsl'),
        GaussianBlur.create(gl, size, size),
        GaussianBlur.create(gl, size, size)
    ])
    .then(([caveRenderer, normalsBlit, gaussBlur0, gaussBlur1]) => {
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
    });


const drawBasicCaveDemo = (cave: Cave, gl: WebGLRenderingContext): void => {
    Promise.all([
        CaveRenderer.create(gl, 'shaders/flatWhite.glsl', cave),
    ])
    .then(([caveRenderer]) => {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        caveRenderer.draw();

        caveRenderer.release();
    });
};

const drawInfoBufferDemo = (cave: Cave, kind: 'depth'|'normal', gl: WebGLRenderingContext): void => {
    Promise.all([
        BufferRenderer.create(gl, 'shaders/bufferCopy.glsl'),
        buildSurfaceInfoBuffers(gl, 1024, cave)
    ])
    .then(([copyBlit, infoBuffers]) => {
        copyBlit.draw(kind === 'depth' ? infoBuffers.depth : infoBuffers.normal);

        copyBlit.release();
        gl.deleteTexture(infoBuffers.depth);
        gl.deleteTexture(infoBuffers.normal);
    });
};

export const initPost = () :void => {
    const seed = 0.1248;
    const cave = generateCave({ seed, curveBend: 0.75, curveQuality: 10, edgePointDist: 2 });

    const gl = [0,1,2].map(x => (document.getElementById('canvas'+x) as HTMLCanvasElement).getContext('webgl') as WebGLRenderingContext);

    drawBasicCaveDemo(cave, gl[0]);
    drawInfoBufferDemo(cave, 'depth', gl[1]);
    drawInfoBufferDemo(cave, 'normal', gl[2]);
};