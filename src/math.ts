export interface Vec2 {
    x: number,
    y: number,
}

export const V2 = {
    add: (a: Vec2, b: Vec2): void => {
        a.x += b.x;
        a.y += b.y;
    },

    plus: (a: Vec2, b: Vec2): Vec2 => ({
        x: a.x + b.x,
        y: a.y + b.y,
    }),

    minus: (a: Vec2, b: Vec2): Vec2 => ({
        x: a.x - b.x,
        y: a.y - b.y,
    }),

    length: (a: Vec2): number =>
        Math.sqrt(a.x*a.x + a.y*a.y),
    
    scaled: (a: Vec2, s: number): Vec2 => ({
        x: s * a.x,
        y: s * a.y,
    }),
};

export const smallestDifferenceRadians = (a: number, b: number): number => {
    a %= 2 * Math.PI;
    b %= 2 * Math.PI;

    if (Math.abs(a - b) > Math.PI) {
        if (a > 0) a -= 2 * Math.PI;
        else a += 2 * Math.PI;
    }

    return a - b;
}