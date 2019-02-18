import { NetConnection, TICK_LENGTH_MS } from "networking";
import { ClientPacket, ServerPacket, GameState } from "./state";
import { vec2 } from "gl-matrix";

const v2a = vec2.create();

export class GameServer {
    private readonly net: NetConnection<ServerPacket, ClientPacket>;
    private readonly tickIntervalID: number;
    private readonly state: GameState;

    constructor(net: NetConnection<ServerPacket, ClientPacket>) {
        this.net = net;
        this.tickIntervalID = setInterval(this.tick.bind(this), TICK_LENGTH_MS);
        this.state = GameState.clone(GameState.zero);
    }

    private tick() {
        const newPackets = this.net.receivePackets();

        if (newPackets.length > 0) {
            const latestInputPacket = newPackets[newPackets.length - 1];
            vec2.sub(v2a, latestInputPacket.mouseWorldPos, this.state.shipPos);
            this.state.shipAngle = Math.atan2(v2a[1], v2a[0]);
        }

        this.net.sendPacket(this.state);
    }

    release() {
        clearInterval(this.tickIntervalID);
    }
}
