import { LocalNetwork } from "networking";
import { GameServer } from "game/server";
import { GameClient } from "game/client";
import { ServerPacket, ClientPacket, serverPacketSerializer, clientPacketSerializer } from "game/state";

export const initGame = (): void => {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const network = new LocalNetwork<ServerPacket, ClientPacket>(serverPacketSerializer, clientPacketSerializer);

    const server = new GameServer(network.server);
    const client = new GameClient(canvas, network.client, 1338);

    const onResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        client.notifyCanvasResize();
    };

    window.addEventListener('resize', onResize);
    onResize();
};
