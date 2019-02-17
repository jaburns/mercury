
export interface NetConnection<Send, Receive> {
    readonly id: string;
    receivePackets(): Receive[];
    sendPacket(packet: Send): void;
}

export interface SerDe<T> {
    serialize(x: T): string;
    deserialize(x: string): T;
}

export const createSimpleSerializer = <T>(): SerDe<T> => ({
    serialize: x => JSON.stringify(x),
    deserialize: x => JSON.parse(x),
});

export class MachineLocalNetwork<FromServer, FromClient> {
    constructor(fromServerSerDe: SerDe<FromServer>, fromClientSerDe: SerDe<FromClient>) {

    }

    getServer(): NetConnection<FromServer, FromClient> {
        return {
            id: Math.random().toString(36).substr(2),
            receivePackets: () => [],
            sendPacket: x => {},
        };
    }

    createClient(): NetConnection<FromClient, FromServer> {
        return {
            id: Math.random().toString(36).substr(2),
            receivePackets: () => [],
            sendPacket: x => {},
        };
    }
}