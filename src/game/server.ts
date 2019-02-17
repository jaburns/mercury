import { NetConnection } from "networking";
import { GameClientPacket, GameServerPacket } from "./packets";

export class GameServer {
    constructor(net: NetConnection<GameServerPacket, GameClientPacket>) {

    }
}