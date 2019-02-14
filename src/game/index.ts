import { GameRenderer } from "./render/gameRenderer";
import { Cave, generateCave } from "caveGenerator";
import { loadTexture } from "graphics/textureLoader";
import { InputGrabber } from "utils/inputGrabber";
import { vec3 } from "gl-matrix";

const v3a = vec3.create();

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

export class Game {
    private readonly gl: WebGLRenderingContext;
    private readonly cave: Cave;
    private readonly inputs: InputGrabber;
    private gameRenderer: GameRenderer;
    private running: boolean;
    private onStoppedRunningCallback?: () => void;

    constructor(gl: WebGLRenderingContext, seed: number) {
        this.gl = gl;
        this.cave = generateCave(seed);
        this.inputs = new InputGrabber(gl.canvas);
        this.running = false;

        loadResources(gl).then(resources => {
            this.gameRenderer = new GameRenderer(gl, this.cave, resources.caveTexture);
            this.runUpdateLoop();
        });
    }

    private runUpdateLoop() {
        this.running = true;

        const onAnimationFrame = () => {
            this.update();

            if (this.running) {
                requestAnimationFrame(onAnimationFrame);
            } else {
                this.stoppedRunning();
            }
        };

        onAnimationFrame();
    }

    private update() {
        this.gameRenderer.draw(this.inputs.mouseScreenPoint);
    }

    private stoppedRunning() {
        this.gameRenderer.release();
        this.inputs.release();

        if (this.onStoppedRunningCallback) {
            this.onStoppedRunningCallback();
        }
    }

    notifyCanvasResize() {
        if (this.gameRenderer) {
            this.gameRenderer.notifyCanvasResize();
        }
    }

    release(stoppedCallback?: () => void) {
        this.onStoppedRunningCallback = stoppedCallback;
        this.running = false;
    }
}