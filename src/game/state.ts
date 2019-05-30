import { createSimpleSerializer } from "networking";
import { vec2 } from "gl-matrix";
import { lerpRadians } from "utils/math";
import { Const, unconst } from 'utils/lang';
import cloneDeep = require('lodash/cloneDeep');

const v2x = vec2.create();

export type PlayerId = string;
export type PlayerMap<T> = {[playerId: string]: T};

export type PlayerState = {
    position: vec2,
    angle: number,
    lastInputUID: string,
};

export type GameState = {
    tick: number,
    predictedTick: number,
    players: PlayerMap<PlayerState>,
};

export type PlayerInputs = {
    uid: string,
    tick: number,
    mouseWorldPos: vec2,
    pressing: boolean,
};

export type ClientPacket = PlayerInputs;
export type ServerPacket = GameState;

export const serverPacketSerializer = createSimpleSerializer<ServerPacket>();
export const clientPacketSerializer = createSimpleSerializer<ClientPacket>();

export const PlayerState = {
    create: (): PlayerState => ({
        position: vec2.create(),
        angle: 0,
        lastInputUID: '',
    }),

    clone: (from: Const<PlayerState>): PlayerState => cloneDeep(from) as PlayerState,

    lerp: (a: Const<PlayerState>, b: Const<PlayerState>, t: number): PlayerState => {
        const out = PlayerState.clone(b);

        vec2.lerp(out.position, unconst(a.position), unconst(b.position), t);
        out.angle = lerpRadians(a.angle, b.angle, t);

        return out;
    },
};

const applyInputsToPlayer = (out: PlayerState, cur: Const<PlayerState>, inputs: Const<PlayerInputs>, id: string): PlayerState => {
    vec2.sub(v2x, unconst(inputs.mouseWorldPos), unconst(cur.position));
    out.angle = Math.atan2(v2x[1], v2x[0]);

    if (inputs.pressing) {
        vec2.normalize(v2x, v2x);
        vec2.scale(v2x, v2x, 0.1);
        vec2.add(out.position, unconst(cur.position), v2x);
    } else {
        vec2.copy(out.position, unconst(cur.position));
    }

    out.lastInputUID = inputs.uid;

    return out;
};

export const GameState = {
    create: (): GameState => ({
        tick: 0,
        predictedTick: 0,
        players: {},
    }),

    clone: (from: Const<GameState>): GameState => cloneDeep(from) as GameState,

    lerp: (a: Const<GameState>, b: Const<GameState>, t: number): GameState => {
        const out = GameState.clone(b);

        for (let id in b.players) {
            if (id in a.players) {
                out.players[id] = PlayerState.lerp(a.players[id], b.players[id], t);
            }
        }

        return out;
    },

    step: (cur: Const<GameState>, inputs: Const<PlayerMap<PlayerInputs>>): GameState => {
        const out = GameState.clone(cur);

        out.tick++;
        out.predictedTick = out.tick;

        for (let id in cur.players) {
            if (id in inputs) {
                applyInputsToPlayer(out.players[id], cur.players[id], inputs[id], id);
            }
        }

        return out;
    },

    predict: (cur: Const<GameState>, input: Const<PlayerInputs>, playerId: PlayerId): GameState => {
        const out = GameState.clone(cur);

        out.predictedTick++;

        applyInputsToPlayer(out.players[playerId], cur.players[playerId], input, playerId);

        return out;
    },
};