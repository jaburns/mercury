import { generateCave } from "caveGenerator";
import { CaveRenderer } from "webgl/caveRenderer";
import { loadTexture } from "webgl/textureLoader";
import { ShipRenderer } from "webgl/shipRenderer";
import { PRNG } from "utils/prng";
import { Camera } from "webgl/camera";
import { Transform } from "webgl/transform";

export const initGame = (): void => {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;

    gl.clearColor(0, 0, 0, 1);

    loadTexture(gl, "caveWalls.png", gl.REPEAT)
    .then(normTex => {
        const cave = generateCave(1338);
        const caveRenderer = new CaveRenderer(gl, cave, normTex);
        const shipRenderer = new ShipRenderer(gl);
        const camera = new Camera();
        const shipTransform = Transform.create();

        camera.transform.position[2] = 5;
        camera.updateViewMatrix();

        const update = () => {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            caveRenderer.draw(camera, shipTransform.position);
            shipRenderer.draw(camera, shipTransform);

            shipTransform.position[0] -= 0.01;
            shipTransform.position[1] += 0.01;

            camera.transform.position[1] += 0.01;
            camera.updateViewMatrix();

            requestAnimationFrame(update);
        };

        window.onresize = () => {
            gl.canvas.width = window.innerWidth;
            gl.canvas.height = window.innerHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            camera.updateProjectionMatrix(gl.canvas.width, gl.canvas.height);
        };

        (window.onresize as any)();
        requestAnimationFrame(update);
    });
};