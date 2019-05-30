import { NetConnection, TICK_LENGTH_MS } from "networking";
import { ClientPacket, ServerPacket, GameState, PlayerInputs } from "./state";
import { GameRenderer } from "./render/gameRenderer";
import { Cave, generateCave } from "caveGenerator";
import { loadTexture } from "graphics/textureLoader";
import { InputGrabber } from "utils/inputGrabber";
import { vec2, vec3 } from "gl-matrix";
import { Camera } from "graphics/camera";
import { generateUID } from "utils/uid";

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
    private readonly span: HTMLSpanElement;
    private readonly net: NetConnection<ClientPacket, ServerPacket>;
    private readonly inputGrabber: InputGrabber;

    private gameRenderer: GameRenderer;
    private running: boolean;
    private onStoppedRunningCallback?: () => void;

    private readonly inputStack: PlayerInputs[];

    private prevState: GameState;
    private curState: GameState;
    private lastUpdateTime: number;
    private tickAccumulator: number;
    private renderAccumulator: number;

    constructor(canvas: HTMLCanvasElement, span: HTMLSpanElement, net: NetConnection<ClientPacket, ServerPacket>, seed: number) {
        const gl = canvas.getContext('webgl') as WebGLRenderingContext;
        const cave = generateCave(seed); 

        this.gl = gl;
        this.span = span;
        this.net = net;
        this.inputGrabber = new InputGrabber(canvas);
        this.running = false;

        this.inputStack = [];
        this.prevState = GameState.create();
        this.curState = GameState.create();

        loadResources(gl).then(resources => {
            this.gameRenderer = new GameRenderer(gl, cave, resources.caveTexture);
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
        this.renderAccumulator = 0;

        onAnimationFrame();
    }

    private mainLoop() {
        const newTime = Date.now();
        const dt = newTime - this.lastUpdateTime;
        this.lastUpdateTime = newTime;
        this.tickAccumulator += dt;
        this.renderAccumulator += dt;

        const maybeNewPacket = this.net.receivePacket();
        if (maybeNewPacket) {
            this.receiveStateFromServer(maybeNewPacket.packet);
        }

        if (!this.curState.players[this.net.id]) return;

        while (this.tickAccumulator >= TICK_LENGTH_MS) {
            this.tickAccumulator -= TICK_LENGTH_MS;

            const latestInputs = this.readInputs(this.curState.tick);
            this.prevState = this.curState;
            this.curState = GameState.predict(this.curState, latestInputs, this.net.id);
            this.inputStack.push(latestInputs);
            this.renderAccumulator = 0;

            if (this.inputStack.length > 100) {
                this.inputStack.splice(0, 1);
            }

            this.net.sendPacket(latestInputs);
        }

        this.render();
    }
    
    private render() {
        this.gameRenderer.draw(this.curState, this.net.id);
        const lerpedState = GameState.lerp(this.prevState, this.curState, this.renderAccumulator / TICK_LENGTH_MS);
        this.gameRenderer.draw(lerpedState, this.net.id);
    }

    private receiveStateFromServer(state: GameState) {
        if (!state.players[this.net.id]) return;

        let matchIndex = this.inputStack.length;
        while (--matchIndex >= 0) {
            if (state.players[this.net.id].lastInputUID === this.inputStack[matchIndex].uid) break;
        }

        this.prevState = this.curState;
        this.curState = state;
        this.renderAccumulator = 0;

        if (matchIndex >= 0) {
            for (let i = matchIndex + 1; i < this.inputStack.length; ++i) {
                this.prevState = this.curState;
                this.curState = GameState.predict(this.curState, this.inputStack[i], this.net.id);
            }
        }
    }

    private readInputs(tick: number): PlayerInputs {
        Camera.screenPointToWorldXYPlanePoint(this.gameRenderer.camera, this.inputGrabber.mouseScreenPoint, v3x);

        return {
            tick,
            uid: generateUID(),
            pressing: this.inputGrabber.mouseDown,
            mouseWorldPos: vec2.fromValues(v3x[0], v3x[1]),
        };
    }

    private stoppedRunning() {
        this.gameRenderer.release();
        this.inputGrabber.release();
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