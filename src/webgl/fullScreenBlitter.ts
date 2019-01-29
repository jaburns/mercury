import { loadShader } from "./shaderLoader";

export class FullScreenBlitter {
    private readonly gl: WebGL2RenderingContext;
    private readonly shader: WebGLProgram;

    private readonly vao: WebGLVertexArrayObject;
    private readonly vertexBuffer: WebGLBuffer;

    static create(gl: WebGL2RenderingContext): Promise<FullScreenBlitter> {
        return loadShader(gl, 'shaders/fullScreenBlit.glsl')
            .then(shader => new FullScreenBlitter(gl, shader));
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

    draw(texture: WebGLTexture) {
        const gl = this.gl;

        gl.bindVertexArray(this.vao);
        gl.useProgram(this.shader);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const loc_tex = gl.getUniformLocation(this.shader, "u_tex");
        gl.uniform1i(loc_tex, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}