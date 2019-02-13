import { vec2 } from "gl-matrix";

export class InputGrabber {
    private readonly canvas: HTMLCanvasElement;
    readonly mouseScreenPoint: vec2;
    private _mouseDown: boolean;
    private canvasBoundingRect: ClientRect | DOMRect;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this._mouseDown = false;
        this.mouseScreenPoint = vec2.create();

        canvas.addEventListener('mousemove',  this.onMouseMove.bind(this));
        canvas.addEventListener('mousedown',  this.onMouseDown.bind(this));
        canvas.addEventListener('mouseup',    this.onMouseButtonNegative.bind(this));
        canvas.addEventListener('mouseout',   this.onMouseButtonNegative.bind(this));
        canvas.addEventListener('mouseleave', this.onMouseButtonNegative.bind(this));

        window.addEventListener('scroll', this.onWindowChange.bind(this));
        window.addEventListener('resize', this.onWindowChange.bind(this));

        this.onWindowChange();
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

    private onWindowChange() {
        this.canvasBoundingRect = this.canvas.getBoundingClientRect();
    }

    private onMouseMove(e: MouseEvent) {
        this.mouseScreenPoint[0] = (e.clientX - this.canvasBoundingRect.left) / this.canvas.width;
        this.mouseScreenPoint[1] = 1 - (e.clientY - this.canvasBoundingRect.top)  / this.canvas.height;
    }
}