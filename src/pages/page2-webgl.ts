import { generateCave } from 'caveGenerator';
import { CaveRenderer } from "webgl/caveRenderer";
import { FrameBufferTexture } from "webgl/frameBufferTexture";
import { FullScreenBlitter } from 'webgl/fullScreenBlitter';
import { GaussianBlur } from 'webgl/gaussianBlur';

export const initPost = () :void => {
    const canvas = document.getElementById('first-canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

    const seed = 0.1247;

    const cave = generateCave({ seed, curveBend: 0.75, curveQuality: 10, edgePointDist: 2 });
    const frameBufferTex = new FrameBufferTexture(gl, 1024, 1024);

    Promise.all([
        CaveRenderer.create(gl, cave),
        FullScreenBlitter.create(gl),
        GaussianBlur.create(gl, 1024, 1024)
    ])
    .then(([caveRenderer, fullScreenBlit, gaussBlur]) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferTex.framebuffer);
        gl.viewport(0, 0, 1024, 1024);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        caveRenderer.draw();

        gaussBlur.run(frameBufferTex.texture, 30);

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferTex.framebuffer);
        gl.viewport(0, 0, 1024, 1024);
        fullScreenBlit.drawWithNormals(gaussBlur.resultTexture);

        gaussBlur.run(frameBufferTex.texture, 2);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        fullScreenBlit.draw(gaussBlur.resultTexture);

        //caveRenderer.draw();
    });
};