import { DeepReadonly } from "ts-essentials";

export type Const<T> = DeepReadonly<T>;
export const unconst = <T>(x: DeepReadonly<T>): T => x as T;
