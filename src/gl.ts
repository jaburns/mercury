const canvas = document.getElementById('triangleCanvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl') as WebGLRenderingContext;
gl.viewport(0,0,canvas.width,canvas.height);

const vertShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
gl.shaderSource(vertShader, 'attribute vec3 c;void main(void){gl_Position=vec4(c, 1.0);}');
gl.compileShader(vertShader);
const fragShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
gl.shaderSource(fragShader, 'void main(void){gl_FragColor=vec4(0,1,1,1);}');
gl.compileShader(fragShader);
const prog = gl.createProgram() as WebGLProgram;
gl.attachShader(prog, vertShader);
gl.attachShader(prog, fragShader);
gl.linkProgram(prog);
gl.useProgram(prog);

gl.clearColor(1, 0, 1, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

const vertexBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -0.5,0.5,0.0,  -0.5,-0.5,0.0,  0.5,-0.5,0.0 ]), gl.STATIC_DRAW);

const coord = gl.getAttribLocation(prog, "c");
gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(coord);

gl.drawArrays(gl.TRIANGLES, 0, 3);