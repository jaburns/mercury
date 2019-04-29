export type PacketWithSender<T> = {
    senderId: string,
    packet: T,
};

export type NetConnection<Send, Receive> = {
    readonly id: string,
    receivePackets(): PacketWithSender<Receive>[],
    sendPacket(packet: Send): void,
};

export type SerDe<T> = {
    serialize(x: T): string,
    deserialize(x: string): T,
};

export const createSimpleSerializer = <T>(): SerDe<T> => ({
    serialize: x => JSON.stringify(x),
    deserialize: x => JSON.parse(x),
});

export const TICK_LENGTH_MS = 33;

export class LocalNetwork<ToClient, ToServer> {
    private readonly toClientSerDe: SerDe<ToClient>;
    private readonly toServerSerDe: SerDe<ToServer>;

    private readonly toServerQueue:  PacketWithSender<ToServer>[];
    private readonly toClientQueues: {[clientId: string]: PacketWithSender<ToClient>[]};

    readonly server: NetConnection<ToClient, ToServer>;
    private readonly clients: {[clientId: string]: NetConnection<ToServer, ToClient>};

    latency: number;

    constructor(toClientSerDe: SerDe<ToClient>, toServerSerDe: SerDe<ToServer>) {
        this.toClientSerDe = toClientSerDe;
        this.toServerSerDe = toServerSerDe;

        this.toServerQueue  = [];
        this.toClientQueues = {};

        this.clients = {};
        this.latency = 0;

        this.server = {
            id: 'server',

            receivePackets: (): PacketWithSender<ToServer>[] => {
                const result = this.toServerQueue.slice();
                this.toServerQueue.length = 0;
                return result;
            },

            sendPacket: (packet: ToClient) => {
                const serialized = this.toClientSerDe.serialize(packet);

                setTimeout(
                    () => {
                        for (let k in this.toClientQueues) {
                            this.toClientQueues[k].push({
                                senderId: 'server',
                                packet: this.toClientSerDe.deserialize(serialized),
                            });
                        }
                    },
                    this.latency
                );
            }
        };
    }

    createClient(): NetConnection<ToServer, ToClient> {
        const id = Math.random().toString(36).substr(2);

        this.toClientQueues[id] = [];

        this.clients[id] = {
            id,

            receivePackets: (): PacketWithSender<ToClient>[] => {
                const result = this.toClientQueues[id].slice();
                this.toClientQueues[id].length = 0;
                return result;
            },

            sendPacket: (packet: ToServer) => {
                setTimeout(
                    () => {
                        this.toServerQueue.push({
                            senderId: id,
                            packet: this.toServerSerDe.deserialize(this.toServerSerDe.serialize(packet))
                        });
                    },
                    this.latency
                );
            }
        };

        return this.clients[id];
    }
}