import { Cave } from 'caveGenerator';
import { CaveRenderer } from './caveRenderer';
import { ShipRenderer } from './shipRenderer';
import { Camera } from 'graphics/camera';
import { vec3 } from 'gl-matrix';

export class GameRenderer {
    private readonly gl: WebGLRenderingContext;
    private readonly caveRenderer: CaveRenderer;
    private readonly shipRenderer: ShipRenderer;
    private readonly camera: Camera;

    constructor(gl: WebGLRenderingContext, cave: Cave, normalsTexture: WebGLTexture | null) {
        this.caveRenderer = new CaveRenderer(gl, cave, normalsTexture);
        this.shipRenderer = new ShipRenderer(gl);
        this.camera = Camera.create();

        gl.clearColor(0, 0, 0, 1);
    }

    draw() {
        const gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //  const mouseWorldPos = Camera.screenPointToWorldXYPlanePoint(this.camera, inputs.mouseScreenPoint, v3a);
    //  vec3.sub(v3a, mouseWorldPos, shipTransform.position);
    //  quat.fromEuler(shipTransform.rotation, 0, 0, 180 / Math.PI * Math.atan2(v3a[1], v3a[0]));

        this.caveRenderer.draw(this.camera, shipTransform.position);
        this.shipRenderer.draw(this.camera, shipTransform);
    }
}