import { generateCave } from "caveGenerator";
import { CaveRenderer } from "webgl/caveRenderer";
import { loadTexture } from "webgl/textureLoader";
import { ShipRenderer } from "webgl/shipRenderer";
import { vec3, vec2 } from "gl-matrix";
import { PRNG } from "utils/prng";

export const initGame = (): void => {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;

    gl.clearColor(0, 0, 0, 1);

    loadTexture(gl, "caveWalls.png", gl.REPEAT)
    .then(normTex => {
        const cave = generateCave(PRNG.getRandomSeed());
        const caveRenderer = new CaveRenderer(gl, cave, normTex);
        const shipRenderer = new ShipRenderer(gl);

        const update = () => {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            caveRenderer.drawDemo(0, 1, 0, 0);
            shipRenderer.draw(vec3.fromValues(0, 0, 5), vec2.fromValues(0, 0), 0, gl.canvas.width / gl.canvas.height);

            requestAnimationFrame(update);
        };

        window.onresize = () => {
            gl.canvas.width = window.innerWidth;
            gl.canvas.height = window.innerHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        };

        (window.onresize as any)();
        requestAnimationFrame(update);
    });
};