import { loadShader } from "webgl/shaderLoader";
import { Cave, generateCave } from 'caveGenerator';

const flatten = <T>(arrays: T[][]): T[] => {
    let result: T[] = [];
    arrays.forEach(a => result = result.concat(a));
    return result;
};

const getFlatVerts = (cave: Cave): number[] =>
    flatten(flatten(cave.edges).map(v => [v.x, v.y]));

const getFlatIndices = (cave: Cave): number[] => {
    let baseCount = 0;
    let result: number[] = [];

    cave.triangles.forEach((tris, index) => {
        result = result.concat(tris.map(x => x + baseCount));
        baseCount += cave.edges[index].length;
    });

    return result;
};

class CaveRenderer {
    private readonly gl: WebGL2RenderingContext;
    private readonly shader: WebGLProgram;

    private readonly vao: WebGLVertexArrayObject;
    private readonly vertexBuffer: WebGLBuffer;
    private readonly indexBuffer: WebGLBuffer;

    private readonly indexBufferLen: number;

    constructor(gl: WebGL2RenderingContext, cave: Cave, shader: WebGLProgram) {
        this.gl = gl;
        this.shader = shader;

        this.vao = gl.createVertexArray() as WebGLVertexArrayObject;
        gl.bindVertexArray(this.vao);

        this.vertexBuffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getFlatVerts(cave)), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        const indexBufferData = getFlatIndices(cave);
        this.indexBufferLen = indexBufferData.length;

        this.indexBuffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBufferData), gl.STATIC_DRAW);
    }

    draw() {
        const gl = this.gl;

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.useProgram(this.shader);

        gl.drawElements(gl.TRIANGLES, this.indexBufferLen, gl.UNSIGNED_SHORT, 0);
    }

    delete() {
        const gl = this.gl;

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.indexBuffer);
        gl.deleteVertexArray(this.vao);
    }
}

export const initPost = () :void => {
    const canvas = document.getElementById('first-canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

    gl.viewport(0,0,canvas.width,canvas.height);
    gl.cullFace(gl.BACK);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    Promise.all([
        loadShader(gl, '/shaders/purple.glsl'),
        loadShader(gl, '/shaders/bufferCopy.glsl')
    ])
    .then(([prog0, prog1]) => {
        if (typeof prog0 === 'string' || typeof prog1 === 'string') {
            console.log('Shader error: ' + prog0 + prog1);
            return;
        }
        
        const cave = generateCave({ seed: Math.random(), curveBend: 0.75, curveQuality: 10, edgePointDist: 2 });

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const caveRenderer = new CaveRenderer(gl, cave, prog0);
        caveRenderer.draw();
    });
};



        /*
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, canvas.width, canvas.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); 
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0); 

        {
          gl.clearColor(0, 1, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);

          const vertexBuf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -0.95,0.95,0.0,  
            -0.95,-0.95,0.0, 
            0.95,-0.95,0.0,
            0.9,0,0.0,
            0.9,0.9,0.0,
            0,0.9,0.0,
          ]), gl.STATIC_DRAW);

          gl.useProgram(prog0);

          const coord = gl.getAttribLocation(prog0, "c");
          gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(coord);

          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        {    
          const vertexBuf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ 
            -1,1,0.0,  
            -1,-1,0.0, 
            1,-1,0.0,
            1,-1,0.0,
            1,1,0.0,
            -1,1,0.0,
          ]), gl.STATIC_DRAW);

          gl.useProgram(prog1);

          const coord = gl.getAttribLocation(prog1, "c");
          gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(coord);

          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
        */
