import { loadShader } from "./shaderLoader";

export class BufferRenderer {
    private readonly gl: WebGL2RenderingContext;
    private readonly vao: WebGLVertexArrayObject;
    private readonly vertexBuffer: WebGLBuffer;
    private readonly shader: WebGLProgram;

    static create(gl: WebGL2RenderingContext, shaderPath: string, ): Promise<BufferRenderer> {
        return loadShader(gl, shaderPath)
            .then(shader => new BufferRenderer(gl, shader));
    }

    private constructor(gl: WebGL2RenderingContext, shader: WebGLProgram) {
        this.gl = gl;
        this.shader = shader;

        this.vao = gl.createVertexArray() as WebGLVertexArrayObject;
        gl.bindVertexArray(this.vao);

        this.vertexBuffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1,1,-1,-1,1,-1,1,-1,1,1,-1,1 ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    }

    draw(texture: WebGLTexture, onPreDraw?: (gl: WebGL2RenderingContext, shader: WebGLProgram) => void) {
        const gl = this.gl;

        gl.bindVertexArray(this.vao);
        gl.useProgram(this.shader);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const loc_tex = gl.getUniformLocation(this.shader, "u_tex");
        gl.uniform1i(loc_tex, 0);

        if (onPreDraw) onPreDraw(gl, this.shader);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    release() {
        const gl = this.gl;

        gl.useProgram(null);
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.deleteProgram(this.shader);
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteVertexArray(this.vao);
    }
}