export class FrameBufferTexture {
    readonly framebuffer: WebGLFramebuffer;
    readonly texture: WebGLTexture;

    private readonly gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext, width: number, height: number) {
        this.gl = gl;

        this.framebuffer = gl.createFramebuffer() as WebGLFramebuffer;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        
        this.texture = gl.createTexture() as WebGLTexture;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); 
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0); 
    }

    release() {
        const gl = this.gl;

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.deleteTexture(this.texture);
        gl.deleteFramebuffer(this.framebuffer);
    }

    releaseTexture(): WebGLTexture {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.deleteFramebuffer(this.framebuffer);

        return this.texture;
    }
}
