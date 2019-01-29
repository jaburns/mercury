export class FrameBufferTexture {
    private readonly gl: WebGL2RenderingContext;
    private readonly _framebuffer: WebGLFramebuffer;
    private readonly _texture: WebGLTexture;

    constructor(gl: WebGL2RenderingContext, width: number, height: number) {
        this.gl = gl;

        this._framebuffer = gl.createFramebuffer() as WebGLFramebuffer;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
        
        this._texture = gl.createTexture() as WebGLTexture;
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); 
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture, 0); 
    }

    get texture() :WebGLTexture {
        return this._texture;
    }

    get framebuffer(): WebGLFramebuffer {
        return this._framebuffer;
    }

    delete() {
        const gl = this.gl;

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.deleteTexture(this._texture);
        gl.deleteFramebuffer(this._framebuffer);
    }
}
