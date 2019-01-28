import { loadShader } from "webgl/shaderLoader";

export const initPost = () :void => {
    const canvas = document.getElementById('first-canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2') as WebGLRenderingContext;
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.cullFace(gl.BACK);

    Promise.all([
        loadShader(gl, '/shaders/purple.glsl'),
        loadShader(gl, '/shaders/bufferCopy.glsl')
    ])
    .then(([prog0, prog1]) => {
        if (typeof prog0 === 'string' || typeof prog1 === 'string') {
            console.log('Shader error: ' + prog0 + prog1);
            return;
        }

        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, canvas.width, canvas.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); 
        
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
    });
};