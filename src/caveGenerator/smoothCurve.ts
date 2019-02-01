import { vec2 } from "gl-matrix";

interface Pt {
    pt: vec2,
    controlA: vec2,
    controlB: vec2,
}

export const smoothCurve = (input: vec2[], resolution: number, curviness: number): vec2[] => {
    const pts: Pt[] = [];

    if (resolution < 1) resolution = 1;

    for (let i = 0; i < input.length; ++i) {
        const prev = input[i == 0 ? input.length-1 : i-1];
        const curr = input[i];
        const next = input[(i + 1) % input.length];

        const lenA = vec2.length(vec2.sub(vec2.create(), prev, curr));
        const lenB = vec2.length(vec2.sub(vec2.create(), curr, next));

        /*
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
        */
    }

    const inc = 1 / resolution;

    const result: vec2[] = [];
    for (let i = 0; i < pts.length; ++i) {
        const curr = pts[i];
        const next = pts[(i + 1) % pts.length];

        for (let t = 0; t < 1 - (inc / 2); t += inc) {
            let newVal: vec2 = vec2.fromValues(0, 0);

            vec2.scaleAndAdd(newVal, newVal, curr.pt       , (1-t)*(1-t)*(1-t));
            vec2.scaleAndAdd(newVal, newVal, curr.controlB , 3*(1-t)*(1-t)*t);
            vec2.scaleAndAdd(newVal, newVal, next.controlA , 3*(1-t)*t*t);
            vec2.scaleAndAdd(newVal, newVal, next.pt       , t*t*t);

            result.push(newVal);
        }
    }

    return result;
};