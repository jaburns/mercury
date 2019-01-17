export interface Vec3 {
    x: number,
    y: number,
    z: number,
}

export const smallestDifferenceRadians = (a: number, b: number): number => {
    a %= 2 * Math.PI;
    b %= 2 * Math.PI;

    if (Math.abs(a - b) > Math.PI) {
        if (a > 0) a -= 2 * Math.PI;
        else a += 2 * Math.PI;
    }

    return a - b;
}