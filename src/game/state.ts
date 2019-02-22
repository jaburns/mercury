import { createSimpleSerializer } from "networking";
import { vec2 } from "gl-matrix";
import { lerpRadians } from "utils/math";

const v2x = vec2.create();

export type GameState = {
    shipPos: vec2,
    shipAngle: number,
};

export type PlayerInputs = {
    mouseWorldPos: vec2,
    pressing: boolean,
};

export type ClientPacket = PlayerInputs;
export type ServerPacket = GameState;

export const serverPacketSerializer = createSimpleSerializer<ServerPacket>();
export const clientPacketSerializer = createSimpleSerializer<ClientPacket>();

export const GameState = {
    create: (): GameState => ({
        shipPos: vec2.create(),
        shipAngle: 0,
    }),

    clone: (a: GameState): GameState => ({
        shipPos: vec2.clone(a.shipPos),
        shipAngle: a.shipAngle,
    }),

    lerp: (out: GameState, a: GameState, b: GameState, t: number): GameState => {
        vec2.lerp(out.shipPos, a.shipPos, b.shipPos, t);
        out.shipAngle = lerpRadians(a.shipAngle, b.shipAngle, t);
        return out;
    },

    step: (out: GameState, cur: GameState, inputs: PlayerInputs): GameState => {
        vec2.sub(v2x, inputs.mouseWorldPos, cur.shipPos);
        out.shipAngle = Math.atan2(v2x[1], v2x[0]);

        if (inputs.pressing) {
            vec2.normalize(v2x, v2x);
            vec2.scale(v2x, v2x, 0.1);
            vec2.add(out.shipPos, cur.shipPos, v2x);
        } else {
            vec2.copy(out.shipPos, cur.shipPos);
        }

        return out;
    },
};