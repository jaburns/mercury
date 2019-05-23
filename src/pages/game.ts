import { LocalNetwork } from "networking";
import { GameServer } from "game/server";
import { GameClient } from "game/client";
import { ServerPacket, ClientPacket, serverPacketSerializer, clientPacketSerializer } from "game/state";

export const initGame = (): void => {
    if (typeof (window as any).io === 'undefined') {
        console.log('Socket.io not available.');
    } else {
        console.log('Socket.io found!');
        //const socket = io();
    }

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

    const server = new GameServer(network.server);

    const waitAndAddClient = (canvas: HTMLCanvasElement, millis: number) => 
        setTimeout(
            () => { 
                const client = network.createClient();
                new GameClient(canvas, client, 1338);
                server.notifyClientConnect(client.id);
            },
            millis
        );

    waitAndAddClient(canvas0,  500);
    waitAndAddClient(canvas1, 1000);
};
