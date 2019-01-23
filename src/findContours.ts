import { Grid, WriteGrid, GridTool } from './grid';
import { Vec3 } from './math';

export interface EdgeMarkedMapTile {
    kind: 'air' | 'dirt' | 'edge',
    normal: number,
}

export const markEdges = (grid: Grid<boolean>): WriteGrid<EdgeMarkedMapTile> => {
    const result = GridTool.map(grid, (x, y, val): EdgeMarkedMapTile => 
        ({ kind: val ? 'dirt' : 'air', normal: 0 }));

    for (let x = 0; x < grid.width; x++) {
        for (let y = 0; y < grid.height; y++) {
            if (!grid.at(x, y)) continue;

            const l = x > 0               && !grid.at(x-1, y);
            const r = x < grid.width - 2  && !grid.at(x+1, y);
            const u = y > 0               && !grid.at(x, y-1);
            const d = y < grid.height - 2 && !grid.at(x, y+1);

            if (!l && !r && !u && !d) continue;

            const normal = r && d ? 45 :
                d && l ?  135 :
                l && u ? -135 :
                u && r ?  -45 :
                r ? 0 :
                d ? 90 :
                l ? 180 :
                -90;

            result.write(x, y, { kind: 'edge', normal });
        }
    }

    return result;
};

// @ts-ignore
enum WalkedStatus {
    Unwalked,
    Walked,
    WalkedImportant,
}

// @ts-ignore
interface WalkCandidate {
    dx: number,
    dy: number,
    normal: number,
}

// @ts-ignore
interface GridPoint {
    x: number,
    y: number,
}

export const findContours = (grid: Grid<EdgeMarkedMapTile>, spaceInsurance: 0 | 1 | 2): any => {
    const MAX_ITER = 100;
    const walkMap = new WriteGrid<WalkedStatus>(grid.width, grid.height);
    const contours: Vec3[][] = [];

    let iter = 0;
    let newContour: Vec3[] | null = null;

    do {
        newContour = findOneContour(walkMap, grid, spaceInsurance);
        if (newContour !== null && newContour.length > 2) {
            contours.push(newContour);
        }
    } while (newContour != null && iter++ < MAX_ITER);

    return { contours, walkMap };
}

// @ts-ignore
const findFreshContour = (walkMap: Grid<WalkedStatus>, grid: Grid<EdgeMarkedMapTile>): GridPoint | null => {
    for (let x = 0; x < grid.width; x++) {
        for (let y = 0; y < grid.height; y++) {
            if (grid.at(x, y).kind === 'edge' && walkMap.at(x, y) === WalkedStatus.Unwalked) {
                return { x, y };
            }
        }
    }

    return null;
};

export const findOneContour = (walkMap: WriteGrid<WalkedStatus>, grid: Grid<EdgeMarkedMapTile>, spaceInsurance: 0 | 1 | 2): Vec3[] | null => {
    const MAX_ITER = 5000;

    const freshStart = findFreshContour(walkMap, grid);
    if (freshStart === null) {
        return null;
    }

    /*
    var points = new List<Vector3>();

    var x = freshStart.Value.x;
    var y = freshStart.Value.y;

    var iter = 0;
    var lastCan = new WalkCandidate { dx=0, dy=0, normal=0 };
    var lastStatus = WalkedStatus.Walked;
    var candidates = new List<WalkCandidate>();

    do {
        candidates.Clear();

        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                if (dx == 0 && dy == 0) continue;
                if (map[x+dx,y+dy].kind == PixelKind.Edge
                && walkMap[x+dx,y+dy] == WalkedStatus.Unwalked) {
                    candidates.Add(new WalkCandidate {dx=dx, dy=dy, normal=map[x+dx,y+dy].normal});
                }
            }
        }

        if (candidates.Count > 0) {
            var c = bestCandidate(lastCan, candidates);
            x += c.dx;
            y += c.dy;

            var newStatus = WalkedStatus.Walked;
            if (c.normal != lastCan.normal) {
                bool important;
                if (spaceInsurance <= 0) {
                    important = true;
                } else if (spaceInsurance == 1) {
                    important = c.dx != 0 && c.dy != 0 || lastStatus != WalkedStatus.WalkedImportant;
                } else { // spaceInsurance >= 2
                    important = lastStatus != WalkedStatus.WalkedImportant;
                }
                if (important) {
                    newStatus = WalkedStatus.WalkedImportant;
                }
            }

            if (newStatus == WalkedStatus.WalkedImportant) {
                points.Add(new Vector3((float)x/map.width - .5f, (float)y/map.height - .5f, -1f));
            }

            walkMap[x,y] = newStatus;
            lastStatus = newStatus;
            lastCan = c;
        }
    }
    while (candidates.Count > 0 && iter++ < MAX_ITER);

    return points.ToArray();
    */

    return null;
};

    /*

        // spaceInsurance: increased value spreads out contour control points. 0, 1, or 2
        static WalkCandidate bestCandidate(WalkCandidate prev, IList<WalkCandidate> candidates)
        {
            var minVal = 100f;
            var minI = 0;

            for (int i = 0; i < candidates.Count; ++i) {
                var c = candidates[i];
                var d = Mathf.Abs(Angles.SmallestDifference(
                    c.normal * Mathf.Deg2Rad, prev.normal * Mathf.Deg2Rad
                ));

                if (d < minVal) {
                    minVal = d;
                    minI = i;
                }
            }

            return candidates[minI];
        }
    }

    */