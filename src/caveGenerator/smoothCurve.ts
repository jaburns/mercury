import { Vec2, V2 } from 'utils/math';

interface Pt {
    pt: Vec2,
    controlA: Vec2,
    controlB: Vec2,
}

export const smoothCurve = (input: Vec2[], resolution: number, curviness: number): Vec2[] => {
    const pts: Pt[] = [];

    if (resolution < 1) resolution = 1;

    for (let i = 0; i < input.length; ++i) {
        const prev = input[i == 0 ? input.length-1 : i-1];
        const curr = input[i];
        const next = input[(i + 1) % input.length];

        const lenA = V2.length(V2.minus(prev, curr));
        const lenB = V2.length(V2.minus(curr, next));

        const midA = V2.scaled(V2.plus(prev, curr), 0.5);
        const midB = V2.scaled(V2.plus(curr, next), 0.5);
        const midDiff = V2.scaled(V2.minus(midA, midB), curviness);

        const diffA = V2.scaled(midDiff,  lenA / (lenA + lenB));
        const diffB = V2.scaled(midDiff, -lenB / (lenA + lenB));

        pts.push({
            pt: curr,
            controlA: V2.plus(curr, diffA),
            controlB: V2.plus(curr, diffB),
        });
    }

    const inc = 1 / resolution;

    const result: Vec2[] = [];
    for (let i = 0; i < pts.length; ++i) {
        const curr = pts[i];
        const next = pts[(i + 1) % pts.length];

        for (let t = 0; t < 1 - (inc / 2); t += inc) {
            let newVal: Vec2 = { x: 0, y: 0 };

            V2.add(newVal, V2.scaled(curr.pt       , (1-t)*(1-t)*(1-t)));
            V2.add(newVal, V2.scaled(curr.controlB , 3*(1-t)*(1-t)*t));
            V2.add(newVal, V2.scaled(next.controlA , 3*(1-t)*t*t));
            V2.add(newVal, V2.scaled(next.pt       , t*t*t));

            result.push(newVal);
        }
    }

    return result;
};