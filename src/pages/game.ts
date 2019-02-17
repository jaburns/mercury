import { Game } from "game";
import { MachineLocalNetwork } from "networking";
import { GameServerPacket, GameClientPacket, fromServerSerDe, fromClientSerDe } from "game/packets";

export const initGame = (): void => {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;
    const game = new Game(gl, 1338);

    const network = new MachineLocalNetwork<GameServerPacket, GameClientPacket>(fromServerSerDe, fromClientSerDe);
    const server = network.getServer();
    const client = network.createClient();

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