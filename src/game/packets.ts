import { createSimpleSerializer } from "networking";

export type GameClientPacket = 'fromClient';
export type GameServerPacket = 'fromServer';

export const fromServerSerDe = createSimpleSerializer<GameServerPacket>();
export const fromClientSerDe = createSimpleSerializer<GameClientPacket>();