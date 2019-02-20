import { NetConnection, TICK_LENGTH_MS } from "networking";
import { ClientPacket, ServerPacket, GameState } from "./state";

export class GameServer {
    private readonly net: NetConnection<ServerPacket, ClientPacket>;
    private readonly tickIntervalID: number;
    private readonly state: GameState;

    constructor(net: NetConnection<ServerPacket, ClientPacket>) {
        this.net = net;
        this.tickIntervalID = setInterval(this.tick.bind(this), TICK_LENGTH_MS);
        this.state = GameState.create();
    }

    private tick() {
        const newPackets = this.net.receivePackets();

        if (newPackets.length > 0) {
            const latestInputPacket = newPackets[newPackets.length - 1];
            GameState.step(this.state, this.state, latestInputPacket);
        }

        this.net.sendPacket(this.state);
    }

    release() {
        clearInterval(this.tickIntervalID);
    }
}
