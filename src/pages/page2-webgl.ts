import { generateCave } from 'caveGenerator';
import { CaveRenderer } from "webgl/caveRenderer";
import { FrameBufferTexture } from "webgl/frameBufferTexture";
import { FullScreenBlitter } from 'webgl/fullScreenBlitter';
import { GaussianBlur } from 'webgl/gaussianBlur';

export const initPost = () :void => {
    const canvas = document.getElementById('first-canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

    gl.viewport(0,0,canvas.width,canvas.height);
    gl.cullFace(gl.BACK);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const cave = generateCave({ seed: Math.random(), curveBend: 0.75, curveQuality: 10, edgePointDist: 2 });
    const frameBufferTex = new FrameBufferTexture(gl, 600, 600);

    Promise.all([
        CaveRenderer.create(gl, cave),
        FullScreenBlitter.create(gl),
        GaussianBlur.create(gl, 600, 600)
    ])
    .then(([caveRenderer, fullScreenBlit, gaussBlur]) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferTex.framebuffer);
        caveRenderer.draw();

        gaussBlur.run(frameBufferTex.texture, 10);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        fullScreenBlit.draw(gaussBlur.resultTexture);
    });
};