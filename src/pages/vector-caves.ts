import { generateCaveVerbose, CaveGeneratorConfig } from 'caveGenerator';
import { GridTool } from 'utils/grid';
import { WalkedStatus } from 'caveGenerator/findContours';
import { vec2 } from 'gl-matrix';

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

        const BIG_CANVAS_SIZE = 675;

        const curveSpaceToCanvasSpace = (pt: vec2): vec2 => vec2.fromValues(
            (BIG_CANVAS_SIZE / 2) * (1 + pt[0]),
            (BIG_CANVAS_SIZE / 2) * (1 + pt[1])
        );

        // =--------------------------------------------

        contours.contours.forEach((c, i) => {
            ctx6.strokeStyle = i === details.outerMostContourIndex ? '#f00' : '#933';

            ctx6.beginPath();
            const first = curveSpaceToCanvasSpace(c[0]);
            ctx6.moveTo(first[0], first[1]);

            for (let i = 1; i < c.length; ++i) {
                const next = curveSpaceToCanvasSpace(c[i]);
                ctx6.lineTo(next[0], next[1]);
            }

            ctx6.closePath();
            ctx6.stroke();
        });

        // =--------------------------------------------

        ctx7.strokeStyle = '#0f0';
        ctx7.fillStyle = '#000';
        ctx7.fillRect(0, 0, BIG_CANVAS_SIZE, BIG_CANVAS_SIZE);

        cave.edges.forEach((c, i) => {
            ctx7.strokeStyle = i === details.outerMostContourIndex ? '#0f0' : '#393';

            ctx7.beginPath();
            const first = curveSpaceToCanvasSpace(c[0]);
            ctx7.moveTo(first[0], first[1]);

            for (let i = 1; i < c.length; ++i) {
                const next = curveSpaceToCanvasSpace(c[i]);
                ctx7.lineTo(next[0], next[1]);
            }

            ctx7.closePath();
            ctx7.stroke();
        });

        // =--------------------------------------------

        ctx9.fillStyle = '#000';
        ctx9.fillRect(0, 0, BIG_CANVAS_SIZE, BIG_CANVAS_SIZE);

        cave.triangles.forEach((ts,j) => {
            for (let i = 0; i < ts.length - 2; i += 3) {
                ctx9.fillStyle = randomColorHex();
                ctx9.beginPath();

                const first = curveSpaceToCanvasSpace(cave.edges[j][ts[i]]);
                ctx9.moveTo(first[0], first[1]);

                [1, 2, 0].forEach(o => {
                    const a = curveSpaceToCanvasSpace(cave.edges[j][ts[i+o]]);
                    ctx9.lineTo(a[0], a[1]);
                })

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
