import { GameRenderer } from "./render/gameRenderer";
import { Cave, generateCave } from "caveGenerator";
import { loadTexture } from "graphics/textureLoader";
import { InputGrabber } from "utils/inputGrabber";

interface LazyResources {
    readonly caveTexture: WebGLTexture;
}

const loadResources = (gl: WebGLRenderingContext): Promise<LazyResources> =>
    Promise.all([
        loadTexture(gl, "caveWalls.png", gl.REPEAT)
    ])
    .then(([caveTexture]) => ({
        caveTexture
    }));

export class Game {
    private readonly cave: Cave;
    private gameRenderer: GameRenderer;
    private readonly inputGrabber: InputGrabber;

    constructor(gl: WebGLRenderingContext, seed: number) {
        this.cave = generateCave(seed);
        this.inputGrabber = new InputGrabber(gl.canvas);

        loadResources(gl).then(resources => {
            this.gameRenderer = new GameRenderer(gl, this.cave, resources.caveTexture);
        });
    }

            requestAnimationFrame(update);
        };

        const onResize = () => {
            gl.canvas.width = window.innerWidth;
            gl.canvas.height = window.innerHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            Camera.updateAspectRatio(camera, gl.canvas.width, gl.canvas.height);
        };

        window.addEventListener('resize', onResize);
        onResize();
        update();
    });
};

    }
}