import { generateCaveVerbose, CaveGeneratorConfig } from 'caveGenerator';
import { GridTool } from 'utils/grid';
import { WalkedStatus } from 'caveGenerator/findContours';

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
        const config: CaveGeneratorConfig = {
            seed: parseInt(seedSlider.value),
            edgePointDist: parseInt(insuranceSlider.value) as any,
            curveBend: 2 * parseFloat(curvinessSlider.value) / 100,
            curveQuality: parseFloat(qualitySlider.value), 
        };

        const { cave, details } = generateCaveVerbose(config);

        GridTool.forEach(details.automatonResult, (x, y, val) => {
            ctx.fillStyle = val ? '#000' : '#FFF';
            ctx.fillRect(4*x, 4*y, 4, 4);
        });

        GridTool.forEach(details.coloredGrid, (x, y, val) => {
            ctx2.fillStyle = gridColorForNumber(val);
            ctx2.fillRect(4*x, 4*y, 4, 4);
        });

        GridTool.forEach(details.filledGrid, (x, y, val) => {
            ctx3.fillStyle = val ? '#000' : '#FFF';
            ctx3.fillRect(4*x, 4*y, 4, 4);
        });

        GridTool.forEach(details.edgeMarkedGrid, (x, y, val) => {
            ctx4.fillStyle = val.kind === 'edge' ? gridColorForNormal(val.normal) : val.kind === 'air' ? '#655' : '#77f';
            ctx4.fillRect(4*x, 4*y, 4, 4);
        });

        const contours = details.findContoursResult;

        GridTool.forEach(contours.walkMap, (x, y, val) => {
            ctx5.fillStyle = val === WalkedStatus.WalkedImportant ? '#fff' : val === WalkedStatus.Walked ? '#333' : '#000';
            ctx5.fillRect(4*x, 4*y, 4, 4);

            ctx6.fillStyle = val === WalkedStatus.WalkedImportant ? '#333' : '#000';
            ctx6.fillRect(9*x, 9*y, 9, 9);
        });

        // =--------------------------------------------

        contours.contours.forEach((c, i) => {
            ctx6.strokeStyle = i === details.outerMostContourIndex ? '#f00' : '#933';

            for (let i = 0; i < c.length; ++i) {
                const j = (i + 1) % c.length;
                const a = { x: 9 * contours.walkMap.width * c[i].x, y: 9 * contours.walkMap.height * c[i].y };
                const b = { x: 9 * contours.walkMap.width * c[j].x, y: 9 * contours.walkMap.height * c[j].y };
                
                ctx6.beginPath();
                ctx6.moveTo(9 * contours.walkMap.width / 2 + a.x, 9 * contours.walkMap.height / 2 + a.y);
                ctx6.lineTo(9 * contours.walkMap.width / 2 + b.x, 9 * contours.walkMap.height / 2 + b.y);
                ctx6.stroke(); // TODO closePath
            }
        });

        // =--------------------------------------------

        ctx7.strokeStyle = '#0f0';
        ctx7.fillStyle = '#000';
        ctx7.fillRect(0, 0, 675, 675);

        cave.edges.forEach((c, i) => {
            ctx7.strokeStyle = i === details.outerMostContourIndex ? '#0f0' : '#393';

            for (let i = 0; i < c.length; ++i) {
                const j = (i + 1) % c.length;
                const a = { x: 9 * contours.walkMap.width * c[i].x, y: 9 * contours.walkMap.height * c[i].y };
                const b = { x: 9 * contours.walkMap.width * c[j].x, y: 9 * contours.walkMap.height * c[j].y };
                
                ctx7.beginPath();
                ctx7.moveTo(9 * contours.walkMap.width / 2 + a.x, 9 * contours.walkMap.height / 2 + a.y);
                ctx7.lineTo(9 * contours.walkMap.width / 2 + b.x, 9 * contours.walkMap.height / 2 + b.y);
                ctx7.stroke(); // TODO closePath
            }
        });

        const topLeftPt = cave.edges[details.outerMostContourIndex][details.topLeftMostVertexIndex];

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

        ctx8.fillStyle = '#000';
        ctx8.fillRect(0, 0, 675, 675);

        cave.edges.forEach((c, i) => {
            ctx8.fillStyle = i === details.outerMostContourIndex ? '#0f0' : '#393';

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

        cave.triangles.forEach((ts,j) => {
            for (let i = 0; i < ts.length - 2; i += 3) {
                ctx9.fillStyle = randomColorHex();
                ctx9.beginPath();
                {
                    const c = cave.edges[j][ts[i]];
                    const a = { x: 8 * contours.walkMap.width * c.x, y: 8 * contours.walkMap.height * c.y };
                    ctx9.moveTo(9 * contours.walkMap.width / 2 + a.x, 9 * contours.walkMap.height / 2 + a.y);
                } {
                    const c = cave.edges[j][ts[i+1]];
                    const a = { x: 8 * contours.walkMap.width * c.x, y: 8 * contours.walkMap.height * c.y };
                    ctx9.lineTo(9 * contours.walkMap.width / 2 + a.x, 9 * contours.walkMap.height / 2 + a.y);
                } {
                    const c = cave.edges[j][ts[i+2]];
                    const a = { x: 8 * contours.walkMap.width * c.x, y: 8 * contours.walkMap.height * c.y };
                    ctx9.lineTo(9 * contours.walkMap.width / 2 + a.x, 9 * contours.walkMap.height / 2 + a.y);
                } {
                    const c = cave.edges[j][ts[i]];
                    const a = { x: 8 * contours.walkMap.width * c.x, y: 8 * contours.walkMap.height * c.y };
                    ctx9.lineTo(9 * contours.walkMap.width / 2 + a.x, 9 * contours.walkMap.height / 2 + a.y);
                }
                ctx9.fill();
            }
        });
    };

    multibind(
        [seedSlider, insuranceSlider, curvinessSlider, qualitySlider],
        ['oninput', 'onchange'],
        update
    );
    update();
};
