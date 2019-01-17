// https://en.wikipedia.org/wiki/Linear_congruential_generator

const M = 4294967296;
const A = 1664525;
const C = 1013904223;

export const nextRandom01 = (prevRandom01: number): number => 
    ((A * Math.floor(prevRandom01 * M) + C) % M) / M;