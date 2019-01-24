import { Vec2 } from './math';

export const triangulate = (points: Vec2[]): number[] => {
    const indices: number[] = [];
    const n = points.length;
    if (n < 3) return indices;

    const V: number[] = new Array(n);
    if (area(points) > 0) {
        for (let v = 0; v < n; v++) V[v] = v;
    } else {
        for (let v = 0; v < n; v++) V[v] = (n - 1) - v;
    }

    let nv = n;
    let count = 2 * nv;
    for (let v = nv - 1; nv > 2; ) {
        if ((count--) <= 0) return indices;

        let u = v;
        if (nv <= u) u = 0;
        v = u + 1;
        if (nv <= v) v = 0;
        let w = v + 1;
        if (nv <= w) w = 0;

        if (snip(points, u, v, w, nv, V)) {
            indices.push(V[u]);
            indices.push(V[v]);
            indices.push(V[w]);
            for (let s = v, t = v + 1; t < nv; s++, t++) V[s] = V[t];
            nv--;
            count = 2 * nv;
        }
    }

    return indices;
};

const area = (points: Vec2[]): number => {
    let A = 0;
    for (let p = points.length - 1, q = 0; q < points.length; p = q++) {
        A += points[p].x * points[q].y - points[q].x * points[p].y;
    }
    return A / 2;
};

const inside_triangle = (A: Vec2, B: Vec2, C: Vec2, P: Vec2): boolean => {
    const ax = C.x - B.x, ay = C.y - B.y;
    const bx = A.x - C.x, by = A.y - C.y;
    const cx = B.x - A.x, cy = B.y - A.y;
    const apx = P.x - A.x, apy = P.y - A.y;
    const bpx = P.x - B.x, bpy = P.y - B.y;
    const cpx = P.x - C.x, cpy = P.y - C.y;

    const aCROSSbp = ax * bpy - ay * bpx;
    const cCROSSap = cx * apy - cy * apx;
    const bCROSScp = bx * cpy - by * cpx;

    return aCROSSbp >= 0 && bCROSScp >= 0 && cCROSSap >= 0;
};

const snip = (points: Vec2[], u: number, v: number, w: number, n: number, V: number[]): boolean => {
    const A = points[V[u]];
    const B = points[V[v]];
    const C = points[V[w]];

    const pdiff = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
    if (pdiff < 1e-7) return false;

    for (let p = 0; p < n; p++) {
        if ((p == u) || (p == v) || (p == w)) continue;
        const P = points[V[p]];
        if (inside_triangle(A, B, C, P)) return false;
    }

    return true;
};