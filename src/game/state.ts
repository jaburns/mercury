import { createSimpleSerializer } from "networking";
import { vec2 } from "gl-matrix";

export interface GameState {
    shipPos: vec2;
    shipAngle: number;
}

export interface PlayerInputs {
    mouseWorldPos: vec2;
    pressing: boolean;
}

export type ClientPacket = PlayerInputs;
export type ServerPacket = GameState;

export const serverPacketSerializer = createSimpleSerializer<ServerPacket>();
export const clientPacketSerializer = createSimpleSerializer<ClientPacket>();

export const GameState = {
    zero: {
        shipPos: vec2.create(),
    } as Readonly<GameState>,

    lerp: (a: GameState, b: GameState, t: number): GameState => {
        return {
            shipPos: vec2.lerp(vec2.create(), a.shipPos, b.shipPos, t),
            shipAngle: a.shipAngle + t * (b.shipAngle - a.shipAngle), // TODO lerp through closest angle to fix snapping at 180
        };
    },

    clone: (a: GameState): GameState => {
        return JSON.parse(JSON.stringify(a));
    },
};