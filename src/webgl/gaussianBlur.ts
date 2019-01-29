import { loadShader } from "./shaderLoader";
import { FrameBufferTexture } from "./frameBufferTexture";

export class GaussianBlur {
    private readonly gl: WebGL2RenderingContext;
    private readonly shader: WebGLProgram;

    private readonly vao: WebGLVertexArrayObject;
    private readonly vertexBuffer: WebGLBuffer;

    private readonly width: number;
    private readonly height: number;

    private readonly frameTex0: FrameBufferTexture;
    private readonly frameTex1: FrameBufferTexture;

    static create(gl: WebGL2RenderingContext, width: number, height: number): Promise<GaussianBlur> {
        return loadShader(gl, 'shaders/gaussianBlur.glsl')
            .then(shader => new GaussianBlur(gl, width, height, shader));
    }

    private constructor(gl: WebGL2RenderingContext, width: number, height: number, shader: WebGLProgram) {
        this.gl = gl;
        this.shader = shader;
        this.width = width;
        this.height = height;

        this.vao = gl.createVertexArray() as WebGLVertexArrayObject;
        gl.bindVertexArray(this.vao);

        this.vertexBuffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1,1,-1,-1,1,-1,1,-1,1,1,-1,1 ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        this.frameTex0 = new FrameBufferTexture(gl, width, height);
        this.frameTex1 = new FrameBufferTexture(gl, width, height);
    }

    run(texture: WebGLTexture, iterations: number) {
        const gl = this.gl;

        if (iterations < 1) iterations = 1;

        gl.bindVertexArray(this.vao);
        gl.useProgram(this.shader);

        const loc_tex = gl.getUniformLocation(this.shader, "u_tex");

        for (let i = 0; i < iterations; ++i) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameTex0.framebuffer);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, i === 0 ? texture : this.frameTex1.texture);
            gl.uniform1i(loc_tex, 0);
            gl.uniform2f(gl.getUniformLocation(this.shader, "u_resolution"), this.width, this.height);
            gl.uniform2f(gl.getUniformLocation(this.shader, "u_direction"), 1, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameTex1.framebuffer);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.frameTex0.texture);
            gl.uniform1i(loc_tex, 0);
            gl.uniform2f(gl.getUniformLocation(this.shader, "u_direction"), 0, 1);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    }

    get resultTexture(): WebGLTexture {
        return this.frameTex1.texture;
    }
}