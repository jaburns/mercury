import { Game } from "game";

export const initGame = (): void => {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;
    const game = new Game(gl, 1338);

    const onResize = () => {
        gl.canvas.width = window.innerWidth;
        gl.canvas.height = window.innerHeight;
        game.notifyCanvasResize();
    };

    window.addEventListener('resize', onResize);
    onResize();

    // on destroy {
    //    game.release();
    //    (gl.getExtension('WEBGL_lose_context') as WEBGL_lose_context).loseContext();
    //    game = null;
    //    gl = null;
    // }
};