import { NetConnection, TICK_LENGTH_MS } from "networking";
import { ClientPacket, ServerPacket, GameState } from "./state";

export class GameServer {
    private readonly net: NetConnection<ServerPacket, ClientPacket>;
    private readonly tickIntervalID: number;
    private readonly state: GameState;

    private newestClient: string;

    constructor(net: NetConnection<ServerPacket, ClientPacket>) {
        this.net = net;
        this.tickIntervalID = setInterval(this.tick.bind(this), TICK_LENGTH_MS);
        this.state = GameState.create();
        this.newestClient = '';
    }

    private tick() {
        const newPackets = this.net.receivePackets().filter(x => x.senderId === this.newestClient);

        if (newPackets.length > 0) {
            const latestInputPacket = newPackets[newPackets.length - 1];
            GameState.step(this.state, this.state, latestInputPacket.packet);
        }

        this.net.sendPacket(this.state);
    }

    notifyClientConnect(id: string) {
        this.newestClient = id;
    }

    notifyClientDisconnect(id: string) {
        this.newestClient = '';
    }

    release() {
        clearInterval(this.tickIntervalID);
    }
}
