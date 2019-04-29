import { NetConnection, TICK_LENGTH_MS } from "networking";
import { ClientPacket, ServerPacket, GameState, PlayerMap, PlayerInputs, PlayerState } from "./state";

export class GameServer {
    private readonly net: NetConnection<ServerPacket, ClientPacket>;
    private readonly tickIntervalID: number;
    private readonly state: GameState;
    private readonly latestPlayerInputs: PlayerMap<PlayerInputs>;

    constructor(net: NetConnection<ServerPacket, ClientPacket>) {
        this.net = net;
        this.tickIntervalID = setInterval(this.tick.bind(this), TICK_LENGTH_MS);
        this.state = GameState.create();
        this.latestPlayerInputs = {};
    }

    private tick() {
        const newPackets = this.net.receivePackets();

        for (let i = 0; i < newPackets.length; ++i) {
            const packet = newPackets[i];
            this.latestPlayerInputs[packet.senderId] = packet.packet;
        }

        GameState.step(this.state, this.state, this.latestPlayerInputs);

        this.net.sendPacket(this.state);
    }

    notifyClientConnect(id: string) {
        this.state.players[id] = PlayerState.create();
    }

    notifyClientDisconnect(id: string) {
        delete this.state.players[id];
    }

    release() {
        clearInterval(this.tickIntervalID);
    }
}
