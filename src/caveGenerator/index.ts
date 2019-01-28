import { WriteGrid, GridTool, safeOutOfBounds } from 'utils/grid';
import { runCellularAutomaton } from './automaton';
import { markEdges, findContours, WalkedStatus } from './findContours';
import { smoothCurve } from './smoothCurve';
import { Vec2, findBounds, RectTool } from 'utils/math';
import { triangulate } from './triangulate';

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

const randomColorHex = (): string => {
    const randPair = (): string => {
        let ret = Math.floor(Math.random() * 256).toString(16);
        if (ret.length < 2) ret = '0'+ret;
        return ret;
    };

    return '#' + randPair() + randPair() + randPair();
};

const colors = [0,0,0,0,0,0,0,0,0,0].map(_ => randomColorHex());


const gridColorForNumber = (n: number): string => {
    if (n < 0) return '#000';
    return colors[n % colors.length];
};

const gridColorForNormal = (degs: number): string => {
    const x = Math.cos(degs * Math.PI / 180);
    const y = Math.sin(degs * Math.PI / 180);

    const hx = Math.round(15 * (0.5*x + 0.5));
    const hy = Math.round(15 * (0.5*y + 0.5));

    const result = '#' + hx.toString(16) + hy.toString(16) + 'f';

    return result;
};

const multibind = (objs: any[], events: string[], listener: Function): void => {
    objs.forEach(o => {
        events.forEach(e => {
            o[e] = listener;
        });
    });
};

export const initPost = () :void => {
    const firstCanvas = document.getElementById('first-canvas') as HTMLCanvasElement;
    const ctx = firstCanvas.getContext('2d') as CanvasRenderingContext2D;

    const seedSlider = document.getElementById('seed-slider') as HTMLInputElement;
    const popSlider = document.getElementById('pop-slider') as HTMLInputElement;
    const genSlider = document.getElementById('gen-slider') as HTMLInputElement;
    const insuranceSlider = document.getElementById('insurance-slider') as HTMLInputElement;
    const curvinessSlider = document.getElementById('curviness-slider') as HTMLInputElement;
    const qualitySlider = document.getElementById('quality-slider') as HTMLInputElement;

    const secondCanvas = document.getElementById('second-canvas') as HTMLCanvasElement;
    const ctx2 = secondCanvas.getContext('2d') as CanvasRenderingContext2D;

    const thirdCanvas = document.getElementById('third-canvas') as HTMLCanvasElement;
    const ctx3 = thirdCanvas.getContext('2d') as CanvasRenderingContext2D;

    const fourthCanvas = document.getElementById('fourth-canvas') as HTMLCanvasElement;
    const ctx4 = fourthCanvas.getContext('2d') as CanvasRenderingContext2D;

    const fifthCanvas = document.getElementById('fifth-canvas') as HTMLCanvasElement;
    const ctx5 = fifthCanvas.getContext('2d') as CanvasRenderingContext2D;

    const sixthCanvas = document.getElementById('sixth-canvas') as HTMLCanvasElement;
    const ctx6 = sixthCanvas.getContext('2d') as CanvasRenderingContext2D;

    const seventhCanvas = document.getElementById('seventh-canvas') as HTMLCanvasElement;
    const ctx7 = seventhCanvas.getContext('2d') as CanvasRenderingContext2D;

    const eighthCanvas = document.getElementById('eighth-canvas') as HTMLCanvasElement;
    const ctx8 = eighthCanvas.getContext('2d') as CanvasRenderingContext2D;

    const ninthCanvas = document.getElementById('ninth-canvas') as HTMLCanvasElement;
    const ctx9 = ninthCanvas.getContext('2d') as CanvasRenderingContext2D;

    const update = () :void => {
        const grid = runCellularAutomaton(
            75, 75,
            parseInt(seedSlider.value),
            parseFloat(popSlider.value),
            5, 4,
            parseInt(genSlider.value)
        );

        GridTool.forEach(grid, (x, y, val) => {
            ctx.fillStyle = val ? '#000' : '#FFF';
            ctx.fillRect(4*x, 4*y, 4, 4);
        });

        const coloredGrid = GridTool.map(grid, (x, y, val) => val ? -1 : 0);
        const bigColor = colorGridRegions(coloredGrid);

        GridTool.forEach(coloredGrid, (x, y, val) => {
            ctx2.fillStyle = gridColorForNumber(val);
            ctx2.fillRect(4*x, 4*y, 4, 4);
        });

        const filledMap = GridTool.map(coloredGrid, (x, y, val) => val !== bigColor);

        fixSingleTileBridges(filledMap);

        GridTool.forEach(filledMap, (x, y, val) => {
            ctx3.fillStyle = val ? '#000' : '#FFF';
            ctx3.fillRect(4*x, 4*y, 4, 4);
        });

        const edgeMarkedMap = markEdges(filledMap);

        GridTool.forEach(edgeMarkedMap, (x, y, val) => {
            ctx4.fillStyle = val.kind === 'edge' ? gridColorForNormal(val.normal) : val.kind === 'air' ? '#655' : '#77f';
            ctx4.fillRect(4*x, 4*y, 4, 4);
        });

        const contours = findContours(edgeMarkedMap, parseInt(insuranceSlider.value) as any);

        GridTool.forEach(contours.walkMap, (x, y, val) => {
            ctx5.fillStyle = val === WalkedStatus.WalkedImportant ? '#fff' : val === WalkedStatus.Walked ? '#333' : '#000';
            ctx5.fillRect(4*x, 4*y, 4, 4);

            ctx6.fillStyle = val === WalkedStatus.WalkedImportant ? '#333' : '#000';
            ctx6.fillRect(9*x, 9*y, 9, 9);
        });

        const outerIndex = contours.contours
            .map((c, i) => ({ i, area: RectTool.area(findBounds(c)) }))
            .sort((a, b) => b.area - a.area)
            [0].i;

        contours.contours.forEach((c, i) => {
            ctx6.strokeStyle = i === outerIndex ? '#f00' : '#933';

            for (let i = 0; i < c.length; ++i) {
                const j = (i + 1) % c.length;
                const a = { x: 9 * contours.walkMap.width * c[i].x, y: 9 * contours.walkMap.height * c[i].y };
                const b = { x: 9 * contours.walkMap.width * c[j].x, y: 9 * contours.walkMap.height * c[j].y };
                
                ctx6.beginPath();
                ctx6.moveTo(9 * contours.walkMap.width / 2 + a.x, 9 * contours.walkMap.height / 2 + a.y);
                ctx6.lineTo(9 * contours.walkMap.width / 2 + b.x, 9 * contours.walkMap.height / 2 + b.y);
                // TODO closePath
                ctx6.stroke();
            }
        });

        const smoothContours = contours.contours.map(x => smoothCurve(x, parseFloat(qualitySlider.value), 2 * parseFloat(curvinessSlider.value) / 100));

        ctx7.strokeStyle = '#0f0';
        ctx7.fillStyle = '#000';
        ctx7.fillRect(0, 0, 675, 675);

        smoothContours.forEach((c, i) => {
            ctx7.strokeStyle = i === outerIndex ? '#0f0' : '#393';

            for (let i = 0; i < c.length; ++i) {
                const j = (i + 1) % c.length;
                const a = { x: 9 * contours.walkMap.width * c[i].x, y: 9 * contours.walkMap.height * c[i].y };
                const b = { x: 9 * contours.walkMap.width * c[j].x, y: 9 * contours.walkMap.height * c[j].y };
                
                ctx7.beginPath();
                ctx7.moveTo(9 * contours.walkMap.width / 2 + a.x, 9 * contours.walkMap.height / 2 + a.y);
                ctx7.lineTo(9 * contours.walkMap.width / 2 + b.x, 9 * contours.walkMap.height / 2 + b.y);
                // TODO closePath
                ctx7.stroke();
            }
        });

        // TODO find closest point to the actual OOB point we're making the seam to.
        const mostTopLeft = (pts: Vec2[]): number =>
            pts.map((p, i) => ({ i, len: (p.x+0.5)*(p.x+0.5) + (p.y+0.5)*(p.y+0.5) }))
                .sort((a, b) => a.len - b.len)
                [0].i;

        const topLeftPtI = mostTopLeft(smoothContours[outerIndex]);
        const topLeftPt = smoothContours[outerIndex][topLeftPtI];
        const topLeftPrevPt = smoothContours[outerIndex][topLeftPtI === 0 ? smoothContours[outerIndex].length - 1 : topLeftPtI - 1];

        ctx7.strokeStyle = '#0f0';
        ctx7.beginPath();
        ctx7.moveTo(
            9 * contours.walkMap.width / 2 + 9 * contours.walkMap.width * topLeftPt.x,
            9 * contours.walkMap.height / 2 + 9 * contours.walkMap.height * topLeftPt.y,
        );
        ctx7.lineTo(
            -9 * contours.walkMap.width / 2,
            -9 * contours.walkMap.height / 2
        );
        ctx7.stroke();

        ctx7.strokeStyle = '#9f9';
        ctx7.beginPath();
        ctx7.arc(
            9 * contours.walkMap.width / 2 + 9 * contours.walkMap.width * topLeftPt.x,
            9 * contours.walkMap.height / 2 + 9 * contours.walkMap.height * topLeftPt.y,
            5, 0, 2*Math.PI);
        ctx7.stroke();

        // =--------------------------------------------

        const OUT = 0.51;
        const bumpDownAmount = Math.abs(topLeftPt.y - topLeftPrevPt.y);

        smoothContours[outerIndex].splice(topLeftPtI, 0,
            {x: -OUT, y: -OUT+bumpDownAmount},
            {x: -OUT, y:  OUT},
            {x:  OUT, y:  OUT},
            {x:  OUT, y: -OUT},
            {x: -OUT, y: -OUT},
            {x: (topLeftPt.x + topLeftPrevPt.x) / 2, 
             y: (topLeftPt.y + topLeftPrevPt.y) / 2}
        );

        const tris = smoothContours.map(triangulate);

        smoothContours[outerIndex][topLeftPtI].y -= bumpDownAmount;
        smoothContours[outerIndex][topLeftPtI+5].x = topLeftPrevPt.x;
        smoothContours[outerIndex][topLeftPtI+5].y = topLeftPrevPt.y;

        // =--------------------------------------------

        ctx8.fillStyle = '#000';
        ctx8.fillRect(0, 0, 675, 675);

        smoothContours.forEach((c, i) => {
            ctx8.fillStyle = i === outerIndex ? '#0f0' : '#393';

            ctx8.beginPath();
            const a = { x: 9 * contours.walkMap.width * c[0].x, y: 9 * contours.walkMap.height * c[0].y };
            ctx8.moveTo(9 * contours.walkMap.width / 2 + a.x, 9 * contours.walkMap.height / 2 + a.y);

            for (let j = 1; j < c.length; ++j) {
                const b = { x: 9 * contours.walkMap.width * c[j].x, y: 9 * contours.walkMap.height * c[j].y };
                ctx8.lineTo(9 * contours.walkMap.width / 2 + b.x, 9 * contours.walkMap.height / 2 + b.y);
            }

            ctx8.fill();
        });

        // =--------------------------------------------

        ctx9.fillStyle = '#000';
        ctx9.fillRect(0, 0, 675, 675);

        tris.forEach((ts,j) => {
            for (let i = 0; i < ts.length - 2; i += 3) {
                ctx9.fillStyle = randomColorHex();
                ctx9.beginPath();
                {
                    const c = smoothContours[j][ts[i]];
                    const a = { x: 8 * contours.walkMap.width * c.x, y: 8 * contours.walkMap.height * c.y };
                    ctx9.moveTo(9 * contours.walkMap.width / 2 + a.x, 9 * contours.walkMap.height / 2 + a.y);
                } {
                    const c = smoothContours[j][ts[i+1]];
                    const a = { x: 8 * contours.walkMap.width * c.x, y: 8 * contours.walkMap.height * c.y };
                    ctx9.lineTo(9 * contours.walkMap.width / 2 + a.x, 9 * contours.walkMap.height / 2 + a.y);
                } {
                    const c = smoothContours[j][ts[i+2]];
                    const a = { x: 8 * contours.walkMap.width * c.x, y: 8 * contours.walkMap.height * c.y };
                    ctx9.lineTo(9 * contours.walkMap.width / 2 + a.x, 9 * contours.walkMap.height / 2 + a.y);
                } {
                    const c = smoothContours[j][ts[i]];
                    const a = { x: 8 * contours.walkMap.width * c.x, y: 8 * contours.walkMap.height * c.y };
                    ctx9.lineTo(9 * contours.walkMap.width / 2 + a.x, 9 * contours.walkMap.height / 2 + a.y);
                }
                ctx9.fill();
            }
        });
    };

    multibind(
        [popSlider, genSlider, seedSlider, insuranceSlider, curvinessSlider, qualitySlider],
        ['oninput', 'onchange'],
        update
    );
    update();
};
