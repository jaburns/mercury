import { NetConnection, TICK_LENGTH_MS } from "networking";
import { ClientPacket, ServerPacket, GameState, PlayerInputs } from "./state";
import { GameRenderer } from "./render/gameRenderer";
import { Cave, generateCave } from "caveGenerator";
import { loadTexture } from "graphics/textureLoader";
import { InputGrabber } from "utils/inputGrabber";
import { vec2, vec3 } from "gl-matrix";
import { Camera } from "graphics/camera";

const gsx = GameState.create();
const v3x = vec3.create();

type LazyResources = {
    readonly caveTexture: WebGLTexture,
};

const loadResources = (gl: WebGLRenderingContext): Promise<LazyResources> =>
    Promise.all([
        loadTexture(gl, "caveWalls.png", gl.REPEAT)
    ])
    .then(([caveTexture]) => ({
        caveTexture
    }));

export class GameClient {
    private readonly gl: WebGLRenderingContext;
    private readonly net: NetConnection<ClientPacket, ServerPacket>;
    private readonly cave: Cave;
    private readonly inputs: InputGrabber;

    private gameRenderer: GameRenderer;
    private running: boolean;
    private onStoppedRunningCallback?: () => void;

    private prevState: GameState;
    private curState: GameState;

    private lastUpdateTime: number;
    private tickAccumulator: number;

    constructor(canvas: HTMLCanvasElement, net: NetConnection<ClientPacket, ServerPacket>, seed: number) {
        const gl = canvas.getContext('webgl') as WebGLRenderingContext;

        this.gl = gl;
        this.net = net;
        this.cave = generateCave(seed);
        this.inputs = new InputGrabber(canvas);
        this.running = false;

        this.prevState = GameState.create();
        this.curState = GameState.create();

        loadResources(gl).then(resources => {
            this.gameRenderer = new GameRenderer(gl, this.cave, resources.caveTexture);
            this.runUpdateLoop();
        });
    }

    private runUpdateLoop() {
        this.running = true;

        const onAnimationFrame = () => {
            this.mainLoop();

            if (this.running) {
                requestAnimationFrame(onAnimationFrame);
            } else {
                this.stoppedRunning();
            }
        };

        this.lastUpdateTime = Date.now();
        this.tickAccumulator = 0;

        onAnimationFrame();
    }

    private mainLoop() {
        const newTime = Date.now();
        const dt = newTime - this.lastUpdateTime;
        this.lastUpdateTime = newTime;
        this.tickAccumulator += dt;

        const latestInputs = this.readInputs();

        while (this.tickAccumulator >= TICK_LENGTH_MS) {
            const maybeNewPacket = this.net.receivePacket();

            if (maybeNewPacket) {
                this.prevState = this.curState;
                this.curState = maybeNewPacket.packet;
            }

            this.net.sendPacket(latestInputs);

            this.tickAccumulator -= TICK_LENGTH_MS;
        }

        GameState.lerp(gsx, this.prevState, this.curState, this.tickAccumulator / TICK_LENGTH_MS);
        this.gameRenderer.draw(gsx, this.net.id);
    }

    private readInputs(): PlayerInputs {
        Camera.screenPointToWorldXYPlanePoint(this.gameRenderer.camera, this.inputs.mouseScreenPoint, v3x);

        return {
            pressing: this.inputs.mouseDown,
            mouseWorldPos: vec2.fromValues(v3x[0], v3x[1]),
        };
    }

    private stoppedRunning() {
        this.gameRenderer.release();
        this.inputs.release();
        (this.gl.getExtension('WEBGL_lose_context') as WEBGL_lose_context).loseContext();

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