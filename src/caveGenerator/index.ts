import { Grid, WriteGrid, GridTool, safeOutOfBounds } from 'utils/grid';
import { runCellularAutomaton } from './automaton';
import { markEdges, findContours, EdgeMarkedMapTile, FindContoursResult } from './findContours';
import { smoothCurve } from './smoothCurve';
import { Vec2, findBounds, RectTool } from 'utils/math';
import { triangulate } from './triangulate';

export interface CaveGeneratorConfig {
    seed: number,
    edgePointDist: 0 | 1 | 2,
    curveQuality: number,
    curveBend: number,
}

export interface Cave {
    edges: Vec2[][],
    triangles: number[][],
}

export interface CaveBuildDetails {
    automatonResult: Grid<boolean>;
    coloredGrid: Grid<number>;
    filledGrid: Grid<boolean>;
    edgeMarkedGrid: Grid<EdgeMarkedMapTile>;
    findContoursResult: FindContoursResult;
    outerMostContourIndex: number;
    topLeftMostVertexIndex: number;
}

const floodFill = (grid: WriteGrid<number>, x: number, y: number, replace: number, value: number, count: number): number => {
    if (x < 0 || y < 0) return count;
    if (x >= grid.width || y >= grid.height) return count;

    const tile = grid.at(x, y);

    if (tile === value) return count;
    if (tile !== replace) return count;

    grid.write(x, y, value);
    count++;

    count = floodFill(grid, x - 1, y, replace, value, count);
    count = floodFill(grid, x + 1, y, replace, value, count);
    count = floodFill(grid, x, y - 1, replace, value, count);
    count = floodFill(grid, x, y + 1, replace, value, count);
    return count;
};

const colorGridRegions = (grid: WriteGrid<number>): number => {
    let color = 1;
    let largestColor = -1;
    let largestRegion = 0;

    while (true) {
        const pos = GridTool.find(grid, (x, y, val) => val === 0);
        if (pos === null) return largestColor;

        const size = floodFill(grid, pos.x, pos.y, 0, color, 0);

        if (size > largestRegion) {
            largestRegion = size;
            largestColor = color;
        }

        color++;
    }
};

const fixSingleTileBridges = (grid: WriteGrid<boolean>): void => {
    GridTool.forEach(safeOutOfBounds(grid, true), (x, y, val) => {
        if (!val) return;

        if (val && !grid.at(x - 1, y) && !grid.at(x + 1, y)) {
            grid.write(x + 1, y, true);
        }

        if (val && !grid.at(x, y - 1) && !grid.at(x, y + 1)) {
            grid.write(x, y + 1, true);
        }
    });
};

export const generateCave = (config: CaveGeneratorConfig): Cave => 
    generateCaveVerbose(config).cave;

export const generateCaveVerbose = (config: CaveGeneratorConfig): { cave: Cave, details: CaveBuildDetails } => {
    const automatonResult = runCellularAutomaton(75, 75, config.seed, 0.48, 5, 4, 40);

    const coloredGrid = GridTool.map(automatonResult, (x, y, val) => val ? -1 : 0);
    const bigColor = colorGridRegions(coloredGrid);

    const filledGrid = GridTool.map(coloredGrid, (x, y, val) => val !== bigColor);
    fixSingleTileBridges(filledGrid);

    const edgeMarkedGrid = markEdges(filledGrid);

    const findContoursResult = findContours(edgeMarkedGrid, config.edgePointDist);

    const outerMostContourIndex = findContoursResult.contours
        .map((c, i) => ({ i, area: RectTool.area(findBounds(c)) }))
        .sort((a, b) => b.area - a.area)
        [0].i;

    const smoothContours = findContoursResult.contours.map(x => smoothCurve(x, config.curveQuality, config.curveBend));

    const BOUNDS = 1.0;

    const mostTopLeft = (pts: Vec2[]): number =>
        pts.map((p, i) => ({ i, len: (p.x+BOUNDS)*(p.x+BOUNDS) + (p.y+BOUNDS)*(p.y+BOUNDS) }))
            .sort((a, b) => a.len - b.len)
            [0].i;

    const topLeftPtI = mostTopLeft(smoothContours[outerMostContourIndex]);
    const topLeftPt = smoothContours[outerMostContourIndex][topLeftPtI];
    const topLeftPrevPt = smoothContours[outerMostContourIndex][topLeftPtI === 0 ? smoothContours[outerMostContourIndex].length - 1 : topLeftPtI - 1];

    const bumpDownAmount = Math.abs(topLeftPt.y - topLeftPrevPt.y);

    smoothContours[outerMostContourIndex].splice(topLeftPtI, 0,
        {x: -BOUNDS, y: -BOUNDS+bumpDownAmount},
        {x: -BOUNDS, y:  BOUNDS},
        {x:  BOUNDS, y:  BOUNDS},
        {x:  BOUNDS, y: -BOUNDS},
        {x: -BOUNDS, y: -BOUNDS},
        {x: (topLeftPt.x + topLeftPrevPt.x) / 2, 
         y: (topLeftPt.y + topLeftPrevPt.y) / 2}
    );

    const triangles = smoothContours.map(triangulate);

    smoothContours[outerMostContourIndex][topLeftPtI].y -= bumpDownAmount;
    smoothContours[outerMostContourIndex][topLeftPtI+5].x = topLeftPrevPt.x;
    smoothContours[outerMostContourIndex][topLeftPtI+5].y = topLeftPrevPt.y;

    return {
        cave: {
            edges: smoothContours,
            triangles
        },
        details: {
            automatonResult,
            coloredGrid,
            filledGrid,
            edgeMarkedGrid,
            findContoursResult,
            outerMostContourIndex,
            topLeftMostVertexIndex: topLeftPtI
        }
    };
};
