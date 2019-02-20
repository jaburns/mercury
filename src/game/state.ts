import { createSimpleSerializer } from "networking";
import { vec2 } from "gl-matrix";
import { lerpRadians } from "utils/math";

const v2a = vec2.create();

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
    create: (): GameState => 
        GameState.clone(GameState.zero),

    // TODO: don't need this, just use create()
    zero: {
        shipPos: vec2.create(),
    } as Readonly<GameState>,

    clone: (a: GameState): GameState => {
        return JSON.parse(JSON.stringify(a));
    },

    lerp: (out: GameState, a: GameState, b: GameState, t: number): GameState => {
        vec2.lerp(out.shipPos, a.shipPos, b.shipPos, t);
        out.shipAngle = lerpRadians(a.shipAngle, b.shipAngle, t);
        return out;
    },

    step: (out: GameState, cur: GameState, inputs: PlayerInputs): GameState => {
        vec2.sub(v2a, inputs.mouseWorldPos, cur.shipPos);
        out.shipAngle = Math.atan2(v2a[1], v2a[0]);

        if (inputs.pressing) {
            vec2.normalize(v2a, v2a);
            vec2.scale(v2a, v2a, 0.1);
            vec2.add(out.shipPos, cur.shipPos, v2a);
        } else {
            vec2.copy(out.shipPos, cur.shipPos);
        }

        return out;
    },
};