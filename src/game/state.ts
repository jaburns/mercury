import { createSimpleSerializer } from "networking";
import { vec2 } from "gl-matrix";
import { lerpRadians } from "utils/math";
import { Const, unconst } from 'utils/lang';

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

    clone: (a: Const<GameState>): GameState => ({
        shipPos: vec2.clone(unconst(a.shipPos)),
        shipAngle: a.shipAngle,
    }),

    lerp: (out: GameState, a: Const<GameState>, b: Const<GameState>, t: number): GameState => {
        vec2.lerp(out.shipPos, unconst(a.shipPos), unconst(b.shipPos), t);
        out.shipAngle = lerpRadians(a.shipAngle, b.shipAngle, t);
        return out;
    },

    step: (out: GameState, cur: Const<GameState>, inputs: Const<PlayerInputs>): GameState => {
        vec2.sub(v2x, unconst(inputs.mouseWorldPos), unconst(cur.shipPos));
        out.shipAngle = Math.atan2(v2x[1], v2x[0]);

        if (inputs.pressing) {
            vec2.normalize(v2x, v2x);
            vec2.scale(v2x, v2x, 0.1);
            vec2.add(out.shipPos, unconst(cur.shipPos), v2x);
        } else {
            vec2.copy(out.shipPos, unconst(cur.shipPos));
        }

        return out;
    },
};