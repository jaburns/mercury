import { createSimpleSerializer } from "networking";
import { vec2 } from "gl-matrix";
import { lerpRadians } from "utils/math";
import { Const, unconst } from 'utils/lang';

const v2x = vec2.create();

export type PlayerId = string;
export type PlayerMap<T> = {[playerId: string]: T};

export type PlayerState = {
    position: vec2,
    angle: number,
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
    }),

    lerp: (out: PlayerState, a: Const<PlayerState>, b: Const<PlayerState>, t: number): PlayerState => {
        vec2.lerp(out.position, unconst(a.position), unconst(b.position), t);
        out.angle = lerpRadians(a.angle, b.angle, t);
        return out;
    },

    copy: (out: PlayerState, a: Const<PlayerState>): PlayerState => {
        vec2.copy(out.position, unconst(a.position));
        out.angle = a.angle;
        return out;
    },
};

const matchPlayerCount = (out: GameState, from: Const<GameState>): GameState => {
    for (let id in out.players) {
        if (!(id in from.players)) {
            delete out.players[id];
        }
    }

    for (let id in from.players) {
        if (!(id in out.players)) {
            out.players[id] = PlayerState.create();
        }
    }

    return out;
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

    return out;
};

export const GameState = {
    create: (): GameState => ({
        tick: 0,
        predictedTick: 0,
        players: {},
    }),

    lerp: (out: GameState, a: Const<GameState>, b: Const<GameState>, t: number): GameState => {
        matchPlayerCount(out, b);

        out.tick = b.tick;
        out.predictedTick = b.predictedTick;

        for (let id in b.players) {
            if (id in a.players) {
                PlayerState.lerp(out.players[id], a.players[id], b.players[id], t);
            }
            else {
                PlayerState.copy(out.players[id], b.players[id]);
            }
        }

        return out;
    },

    step: (out: GameState, cur: Const<GameState>, inputs: Const<PlayerMap<PlayerInputs>>): GameState => {
        matchPlayerCount(out, cur);

        out.tick = cur.tick + 1;
        out.predictedTick = out.tick;

        for (let id in cur.players) {
            if (id in inputs) {
                applyInputsToPlayer(out.players[id], cur.players[id], inputs[id], id);
            }
        }

        return out;
    },

    predict: (out: GameState, cur: Const<GameState>, input: PlayerInputs, playerId: PlayerId): GameState => {
        return out;
    },
};