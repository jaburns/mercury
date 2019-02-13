import { generateCave } from "caveGenerator";
import { CaveRenderer } from "webgl/caveRenderer";
import { loadTexture } from "webgl/textureLoader";
import { ShipRenderer } from "webgl/shipRenderer";
import { PRNG } from "utils/prng";
import { Camera } from "webgl/camera";
import { Transform } from "webgl/transform";
import { vec2, quat, vec3 } from "gl-matrix";

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

class InputGrabber {
    private readonly canvas: HTMLCanvasElement;
    private _mouseDown: boolean;
    readonly mousePos: vec2;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this._mouseDown = false;
        this.mousePos = vec2.create();

        canvas.addEventListener('mousemove',  this.onMouseMove.bind(this));
        canvas.addEventListener('mousedown',  this.onMouseDown.bind(this));
        canvas.addEventListener('mouseup',    this.onMouseButtonNegative.bind(this));
        canvas.addEventListener('mouseout',   this.onMouseButtonNegative.bind(this));
        canvas.addEventListener('mouseleave', this.onMouseButtonNegative.bind(this));
    }

    get mouseDown(): boolean {
        return this._mouseDown;
    }

    private onMouseDown() {
        this._mouseDown = true;
    }

    private onMouseButtonNegative() {
        this._mouseDown = false;
    }

    private onMouseMove(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos[0] = (e.clientX - rect.left) / this.canvas.width;
        this.mousePos[1] = 1 - (e.clientY - rect.top)  / this.canvas.height;
    }
}

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

            quat.fromEuler(shipTransform.rotation, 0, 0, 180 / Math.PI * Math.atan2(inputs.mousePos[1], inputs.mousePos[0]));

            caveRenderer.draw(camera, shipTransform.position);
            shipRenderer.draw(camera, shipTransform);

            console.log(Camera.screenPointToRay(camera, inputs.mousePos, shipTransform.position));

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