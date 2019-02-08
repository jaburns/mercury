import { generateCave } from "caveGenerator";

export const initGame = (): void => {
    //@ts-ignore
    const cave = generateCave(Math.random());
    console.log('Hello world');
};