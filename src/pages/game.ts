import { LocalNetwork } from "networking";
import { GameServer } from "game/server";
import { GameClient } from "game/client";
import { ServerPacket, ClientPacket, serverPacketSerializer, clientPacketSerializer } from "game/state";

export const initGame = (): void => {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const network = new LocalNetwork<ServerPacket, ClientPacket>(serverPacketSerializer, clientPacketSerializer);

    const netClient = network.createClient();

    const server = new GameServer(network.server);
    const client = new GameClient(canvas, netClient, 1338);

    server.notifyClientConnect(netClient.id);

    const onResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        client.notifyCanvasResize();
    };

    window.addEventListener('resize', onResize);
    onResize();
};

export const initLocalMultiGame = (): void => {
    const canvas0 = document.getElementById('canvas-0') as HTMLCanvasElement;
    const canvas1 = document.getElementById('canvas-1') as HTMLCanvasElement;
    const network = new LocalNetwork<ServerPacket, ClientPacket>(serverPacketSerializer, clientPacketSerializer);

    const client0 = network.createClient();
    const client1 = network.createClient();

    const server = new GameServer(network.server);
    const game0 = new GameClient(canvas0, client0, 1338);
    const game1 = new GameClient(canvas1, client1, 1338);

    server.notifyClientConnect(client0.id);
    server.notifyClientConnect(client1.id);
};
