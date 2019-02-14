import { Cave } from 'caveGenerator';
import { CaveRenderer } from './caveRenderer';
import { ShipRenderer } from './shipRenderer';
import { Camera } from 'graphics/camera';
import { Transform } from 'graphics/transform';
import { vec3, quat, vec2 } from 'gl-matrix';

const v3a = vec3.create();

export class GameRenderer {
    private readonly gl: WebGLRenderingContext;
    private readonly caveRenderer: CaveRenderer;
    private readonly shipRenderer: ShipRenderer;
    private readonly shipTransform: Transform;
    private readonly camera: Camera;

    constructor(gl: WebGLRenderingContext, cave: Cave, normalsTexture: WebGLTexture | null) {
        this.gl = gl;
        this.caveRenderer = new CaveRenderer(gl, cave, normalsTexture);
        this.shipRenderer = new ShipRenderer(gl);
        this.shipTransform = Transform.create();
        this.camera = Camera.create();

        this.camera.transform.position[2] = 5;

        gl.clearColor(0, 0, 0, 1);
        this.notifyCanvasResize();
    }

    // TODO need to move camera and ship out of here and in to game state

    draw(mouseScreenPoint: vec2) {
        const gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        Camera.screenPointToWorldXYPlanePoint(this.camera, mouseScreenPoint, v3a);
        vec3.sub(v3a, v3a, this.shipTransform.position);
        quat.fromEuler(this.shipTransform.rotation, 0, 0, 180 / Math.PI * Math.atan2(v3a[1], v3a[0]));

        this.caveRenderer.draw(this.camera, this.shipTransform.position);
        this.shipRenderer.draw(this.camera, this.shipTransform);
    }

    notifyCanvasResize() {
        const gl = this.gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        Camera.updateAspectRatio(this.camera, gl.canvas.width, gl.canvas.height);
    }

    release() {
        this.caveRenderer.release();
        this.shipRenderer.release();
    }
}