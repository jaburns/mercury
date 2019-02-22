import { Cave } from 'caveGenerator';
import { CaveRenderer } from './caveRenderer';
import { ShipRenderer } from './shipRenderer';
import { Camera } from 'graphics/camera';
import { Transform } from 'graphics/transform';
import { quat } from 'gl-matrix';
import { GameState } from 'game/state';
import { Const } from 'utils/lang';

const trx = Transform.create();

export class GameRenderer {
    private readonly gl: WebGLRenderingContext;
    private readonly caveRenderer: CaveRenderer;
    private readonly shipRenderer: ShipRenderer;
    private readonly _camera: Camera;

    get camera(): Const<Camera> {
        return this._camera;
    }

    constructor(gl: WebGLRenderingContext, cave: Const<Cave>, normalsTexture: WebGLTexture | null) {
        this.gl = gl;
        this.caveRenderer = new CaveRenderer(gl, cave, normalsTexture);
        this.shipRenderer = new ShipRenderer(gl);
        this._camera = Camera.create();

        this._camera.transform.position[2] = 5;

        gl.clearColor(0, 0, 0, 1);
        this.notifyCanvasResize();
    }

    draw(state: Const<GameState>) {
        const gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        trx.position

        trx.position[0] = state.shipPos[0];
        trx.position[1] = state.shipPos[1];

        quat.fromEuler(trx.rotation, 0, 0, 180 / Math.PI * state.shipAngle);

        this.caveRenderer.draw(this._camera, trx.position);
        this.shipRenderer.draw(this._camera, trx);

        trx.position[0] = 0;
        trx.position[1] = 0;

        this.shipRenderer.draw(this._camera, trx);
    }

    notifyCanvasResize() {
        const gl = this.gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        Camera.updateAspectRatio(this._camera, gl.canvas.width, gl.canvas.height);
    }

    release() {
        this.caveRenderer.release();
        this.shipRenderer.release();
    }
}