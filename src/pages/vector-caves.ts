import { generateCaveVerbose, CaveGeneratorConfig, generatePartialAutomatonResult } from 'caveGenerator';
import { GridTool } from 'utils/grid';
import { WalkedStatus } from 'caveGenerator/findContours';
import { vec2 } from 'gl-matrix';

import { Cave } from 'caveGenerator';
import { CaveRenderer } from "webgl/caveRenderer";
import { FrameBufferTexture } from "webgl/frameBufferTexture";
import { BufferRenderer } from 'webgl/bufferRenderer';
import { GaussianBlur } from 'webgl/gaussianBlur';


interface SurfaceInfoBuffers {
    readonly depth: WebGLTexture,
    readonly normal: WebGLTexture,
}

const buildSurfaceInfoBuffers = (gl: WebGLRenderingContext, size: number, cave: Cave): Promise<SurfaceInfoBuffers> =>
    Promise.all([
        CaveRenderer.create(gl, 'shaders/flatWhite.glsl', cave),
        BufferRenderer.create(gl, 'shaders/normals.glsl'),
        GaussianBlur.create(gl, size, size),
        GaussianBlur.create(gl, size, size)
    ])
    .then(([caveRenderer, normalsBlit, gaussBlur0, gaussBlur1]) => {
        const frameBufferTex = new FrameBufferTexture(gl, size, size);

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferTex.framebuffer);
        gl.viewport(0, 0, size, size);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        caveRenderer.draw();

        gaussBlur0.run(frameBufferTex.texture, 30);

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferTex.framebuffer);
        gl.viewport(0, 0, size, size);

        normalsBlit.draw(gaussBlur0.resultTexture, (gl, shader) => {
            gl.uniform2f(gl.getUniformLocation(shader, "u_resolution"), size, size);
        });

        gaussBlur1.run(frameBufferTex.texture, 2);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        caveRenderer.release();
        normalsBlit.release();
        const depth = gaussBlur0.releaseTexture();
        const normal = gaussBlur1.releaseTexture();

        return { depth, normal };
    });


const drawInfoBufferDemo = (cave: Cave, kind: 'depth'|'normal', gl: WebGLRenderingContext): void => {
    Promise.all([
        BufferRenderer.create(gl, 'shaders/bufferCopy.glsl'),
        buildSurfaceInfoBuffers(gl, 1024, cave)
    ])
    .then(([copyBlit, infoBuffers]) => {
        copyBlit.draw(kind === 'depth' ? infoBuffers.depth : infoBuffers.normal);

        copyBlit.release();
        gl.deleteTexture(infoBuffers.depth);
        gl.deleteTexture(infoBuffers.normal);
    });
};

const drawDetailedCaveDemo = (cave: Cave, gl: WebGLRenderingContext): void => {
    const mousePos = {x: 0, y: 0};
    let mouseDown = false;
    let zoomT = 0;

    gl.canvas.onmousemove = e => {
        const rect = gl.canvas.getBoundingClientRect();
        mousePos.x = (e.clientX - rect.left) / gl.canvas.width;
        mousePos.y = 1 - (e.clientY - rect.top)  / gl.canvas.height;
    };

    gl.canvas.onmousedown = _ => mouseDown = true;
    gl.canvas.onmouseleave = 
        gl.canvas.onmouseout =
        gl.canvas.onmouseup = _ => mouseDown = false; 

    Promise.all([
        CaveRenderer.create(gl, 'shaders/cave.glsl', cave),
        buildSurfaceInfoBuffers(gl, 1024, cave)
    ])
    .then(([caveRenderer, infoBuffers]) => {
        const startTime = Date.now();

        const render = (): void => {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            const t = Date.now() - startTime;
            if (mouseDown) zoomT += 0.02;
            const zoom = 0.55 + 0.45 * Math.cos(zoomT);

            caveRenderer.drawNice(infoBuffers.depth, infoBuffers.normal, t, zoom, mousePos.x, mousePos.y);

            requestAnimationFrame(render);
        };

        requestAnimationFrame(render);

        //caveRenderer.release();
    });
};

const randomColorHex = (): string => {
    const randPair = (): string => {
        let ret = Math.floor(Math.random() * 256).toString(16);
        if (ret.length < 2) ret = '0'+ret;
        return ret;
    };

    return '#' + randPair() + randPair() + randPair();
};

const colors = [0,0,0,0,0,0,0,0,0,0].map(_ => randomColorHex());

const gridColorForNumber = (n: number): string => {
    if (n < 0) return '#000';
    return colors[n % colors.length];
};

const gridColorForNormal = (degs: number): string => {
    const x = Math.cos(degs * Math.PI / 180);
    const y = Math.sin(degs * Math.PI / 180);

    const hx = Math.round(15 * (0.5*x + 0.5));
    const hy = Math.round(15 * (0.5*y + 0.5));

    const result = '#' + hx.toString(16) + hy.toString(16) + 'f';

    return result;
};

const multibind = (objs: any[], events: string[], listener: Function): void => {
    objs.forEach(o => {
        events.forEach(e => {
            o[e] = listener;
        });
    });
};

export const initPost = () :void => {
    let seed: number;
    let caveCache: any = null;

    const genSlider = document.getElementById('gen-slider') as HTMLInputElement;

    const ctx0 = (document.getElementById('zeroth-canvas') as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
    const ctx  = (document.getElementById('first-canvas') as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
    const ctx2 = (document.getElementById('second-canvas') as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
    const ctx3 = (document.getElementById('third-canvas') as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
    const ctx4 = (document.getElementById('fourth-canvas') as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
    const ctx5 = (document.getElementById('fifth-canvas') as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
    const ctx6 = (document.getElementById('sixth-canvas') as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
    const ctx7 = (document.getElementById('seventh-canvas') as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
    const ctx9 = (document.getElementById('ninth-canvas') as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;

    const updatePartialAutomatonResult = () :void => {
        const generation =parseFloat(genSlider.value);
        const grid = generatePartialAutomatonResult(seed, generation);

        GridTool.forEach(grid, (x, y, val) => {
            ctx0.fillStyle = val ? '#000' : '#FFF';
            ctx0.fillRect(4*x, 4*y, 4, 4);
        });
    };

    const update = () :void => {
        seed = Math.random();

        updatePartialAutomatonResult();

        const config: CaveGeneratorConfig = {
            seed,
            edgePointDist: 2,
            curveBend: 2 * 35 / 100,
            curveQuality: 10,
        };

        const { cave, details } = generateCaveVerbose(config);
        caveCache = cave;

        GridTool.forEach(details.automatonResult, (x, y, val) => {
            ctx.fillStyle = val ? '#000' : '#FFF';
            ctx.fillRect(4*x, 4*y, 4, 4);
        });

        GridTool.forEach(details.coloredGrid, (x, y, val) => {
            ctx2.fillStyle = gridColorForNumber(val);
            ctx2.fillRect(4*x, 4*y, 4, 4);
        });

        GridTool.forEach(details.filledGrid, (x, y, val) => {
            ctx3.fillStyle = val ? '#000' : '#FFF';
            ctx3.fillRect(4*x, 4*y, 4, 4);
        });

        GridTool.forEach(details.edgeMarkedGrid, (x, y, val) => {
            ctx4.fillStyle = val.kind === 'edge' ? gridColorForNormal(val.normal) : val.kind === 'air' ? '#655' : '#77f';
            ctx4.fillRect(4*x, 4*y, 4, 4);
        });

        const contours = details.findContoursResult;

        GridTool.forEach(contours.walkMap, (x, y, val) => {
            ctx5.fillStyle = val === WalkedStatus.WalkedImportant ? '#fff' : val === WalkedStatus.Walked ? '#333' : '#000';
            ctx5.fillRect(4*x, 4*y, 4, 4);

            ctx6.fillStyle = val === WalkedStatus.WalkedImportant ? '#333' : '#000';
            ctx6.fillRect(9*x, 9*y, 9, 9);
        });

        const BIG_CANVAS_SIZE = 675;

        const curveSpaceToCanvasSpace = (pt: vec2): vec2 => vec2.fromValues(
            (BIG_CANVAS_SIZE / 2) * (1 + pt[0]),
            (BIG_CANVAS_SIZE / 2) * (1 + pt[1])
        );

        // =--------------------------------------------

        contours.contours.forEach((c, i) => {
            ctx6.strokeStyle = i === details.outerMostContourIndex ? '#f00' : '#933';

            ctx6.beginPath();
            const first = curveSpaceToCanvasSpace(c[0]);
            ctx6.moveTo(first[0], first[1]);

            for (let i = 1; i < c.length; ++i) {
                const next = curveSpaceToCanvasSpace(c[i]);
                ctx6.lineTo(next[0], next[1]);
            }

            ctx6.closePath();
            ctx6.stroke();
        });

        // =--------------------------------------------

        ctx7.strokeStyle = '#0f0';
        ctx7.fillStyle = '#000';
        ctx7.fillRect(0, 0, BIG_CANVAS_SIZE, BIG_CANVAS_SIZE);

        cave.edges.forEach((c, i) => {
            ctx7.strokeStyle = i === details.outerMostContourIndex ? '#0f0' : '#393';

            ctx7.beginPath();
            const first = curveSpaceToCanvasSpace(c[0]);
            ctx7.moveTo(first[0], first[1]);

            for (let i = 1; i < c.length; ++i) {
                const next = curveSpaceToCanvasSpace(c[i]);
                ctx7.lineTo(next[0], next[1]);
            }

            ctx7.closePath();
            ctx7.stroke();
        });

        // =--------------------------------------------

        ctx9.fillStyle = '#000';
        ctx9.fillRect(0, 0, BIG_CANVAS_SIZE, BIG_CANVAS_SIZE);

        cave.triangles.forEach((ts,j) => {
            for (let i = 0; i < ts.length - 2; i += 3) {
                ctx9.fillStyle = randomColorHex();
                ctx9.beginPath();

                const first = curveSpaceToCanvasSpace(cave.edges[j][ts[i]]);
                ctx9.moveTo(first[0], first[1]);

                [1, 2, 0].forEach(o => {
                    const a = curveSpaceToCanvasSpace(cave.edges[j][ts[i+o]]);
                    ctx9.lineTo(a[0], a[1]);
                })

                ctx9.fill();
            }
        });
    };

    multibind([genSlider], ['oninput', 'onchange'], updatePartialAutomatonResult);
    (document.getElementById('generate-new') as HTMLButtonElement).onclick = update;
    update();

    // TODO regenerate webgl contexts and contents when "generate-new" is clicked
    const gl = [0,1,2].map(x => (document.getElementById('canvas'+x) as HTMLCanvasElement).getContext('webgl') as WebGLRenderingContext);
    drawInfoBufferDemo(caveCache, 'depth', gl[0]);
    drawInfoBufferDemo(caveCache, 'normal', gl[1]);
    drawDetailedCaveDemo(caveCache, gl[2])
};
