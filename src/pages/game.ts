import { generateCave } from "caveGenerator";
import { CaveRenderer } from "webgl/caveRenderer";
import { getShaders } from "shaders";
import { buildSurfaceInfoBuffers } from "webgl/caveSurfaceInfo";
import { loadTexture } from "webgl/textureLoader";
import { ShipRenderer } from "webgl/shipRenderer";
import { vec3, vec2 } from "gl-matrix";

export const initGame = (): void => {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;

    const cave = generateCave(Math.random());
    const info = buildSurfaceInfoBuffers(gl, 1024, cave);

    const caveRenderer = new CaveRenderer(gl, cave, getShaders(gl).cave);
    const shipRenderer = new ShipRenderer(gl);

    gl.clearColor(0, 0, 0, 1);

    loadTexture(gl, "caveWalls.png", gl.REPEAT)
    .then(normTex => {

        const update = () => {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            caveRenderer.drawNice(info.depth, info.normal, normTex, 0, 1, 0, 0);
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