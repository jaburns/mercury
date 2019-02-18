
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

export const TICK_LENGTH_MS = 33;

export class LocalNetwork<FromServer, FromClient> {
    private readonly fromServerSerDe: SerDe<FromServer>;
    private readonly fromClientSerDe: SerDe<FromClient>;

    private readonly fromClientQueue: FromClient[];
    private readonly fromServerQueue: FromServer[];

    readonly server: NetConnection<FromServer, FromClient>;
    readonly client: NetConnection<FromClient, FromServer>;
    // TODO support multiple clients

    constructor(fromServerSerDe: SerDe<FromServer>, fromClientSerDe: SerDe<FromClient>) {
        this.fromServerSerDe = fromServerSerDe;
        this.fromClientSerDe = fromClientSerDe;

        this.fromClientQueue = [];
        this.fromServerQueue = [];

        this.server = {
            id: 'server',

            receivePackets: (): FromClient[] => {
                const result = this.fromClientQueue.slice();
                this.fromClientQueue.length = 0;
                return result;
            },

            sendPacket: (packet: FromServer) => {
                this.fromServerQueue.push(
                    this.fromServerSerDe.deserialize(this.fromServerSerDe.serialize(packet))
                );
            }
        };

        this.client = {
            id: 'client',

            receivePackets: (): FromServer[] => {
                const result = this.fromServerQueue.slice();
                this.fromServerQueue.length = 0;
                return result;
            },

            sendPacket: (packet: FromClient) => {
                this.fromClientQueue.push(
                    this.fromClientSerDe.deserialize(this.fromClientSerDe.serialize(packet))
                );
            }
        };
    }
}