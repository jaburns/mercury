import { generateCave } from "caveGenerator";
import { CaveRenderer } from "game/render/caveRenderer";
import { loadTexture } from "graphics/textureLoader";
import { ShipRenderer } from "game/render/shipRenderer";
import { Camera } from "graphics/camera";
import { Transform } from "graphics/transform";
import { vec2, quat, vec3 } from "gl-matrix";
import { InputGrabber } from "utils/inputGrabber";

interface LazyResources {
    readonly caveTexture: WebGLTexture;
}

const loadResources = (gl: WebGLRenderingContext): Promise<LazyResources> =>
    Promise.all([
        loadTexture(gl, "caveWalls.png", gl.REPEAT)
    ])
    .then(([caveTexture]) => ({
        caveTexture
    }));

const v3a = vec3.create();

export const initGame = (): void => {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;

    gl.clearColor(0, 0, 0, 1);

    loadResources(gl).then(resources => {
        const cave = generateCave(1338);
        const inputs = new InputGrabber(canvas);
        const caveRenderer = new CaveRenderer(gl, cave, resources.caveTexture);
        const shipRenderer = new ShipRenderer(gl);
        const camera = Camera.create();
        const shipTransform = Transform.create();

        camera.transform.position[2] = 5;

        const update = () => {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            const mouseWorldPos = Camera.screenPointToWorldXYPlanePoint(camera, inputs.mouseScreenPoint, v3a);
            vec3.sub(v3a, mouseWorldPos, shipTransform.position);
            quat.fromEuler(shipTransform.rotation, 0, 0, 180 / Math.PI * Math.atan2(v3a[1], v3a[0]));

            caveRenderer.draw(camera, shipTransform.position);
            shipRenderer.draw(camera, shipTransform);

            requestAnimationFrame(update);
        };

        const onResize = () => {
            gl.canvas.width = window.innerWidth;
            gl.canvas.height = window.innerHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            Camera.updateAspectRatio(camera, gl.canvas.width, gl.canvas.height);
        };

        window.addEventListener('resize', onResize);
        onResize();
        update();
    });
};