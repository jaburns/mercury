class Rand {
    private static readonly M = 4294967296;
    private static readonly A = 1664525;
    private static readonly C = 1013904223;

    private seed: number;

    constructor(seed?: number) {
        this.seed = typeof seed === 'undefined'
            ? Rand.M * Math.random()
            : seed;
    }

    next(): void {
        this.seed = (Rand.A * this.seed + Rand.C) % Rand.M;
    }

    value(): number {
        return this.seed / Rand.M;
    }
}

interface Grid<T> {
    readonly width: number;
    readonly height: number;
    at(x: number, y: number): T;
}

type GridCallback<T> = (x: number, y: number, val: T) => void;

const iterateGrid = <T>(grid: Grid<T>, fn: GridCallback<T>): void => {
    for (let x = 0; x < grid.width; ++x) {
        for (let y = 0; y < grid.height; ++y) {
            fn(x, y, grid.at(x, y));
        }
    }
};

class WriteGrid<T> implements Grid<T> {
    public readonly width: number;
    public readonly height: number;

    private vals: T[];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.vals = new Array(width * height);
    }

    write(x: number, y: number, val: T): void {
        this.vals[x + y*this.width] = val;
    }

    at(x: number, y: number): T {
        return this.vals[x + y*this.width];
    }

    copyFrom(grid: Grid<T>): void {
        for (let x = 0; x < this.width && x < grid.width; ++x) {
            for (let y = 0; y < this.height && y < grid.height; ++y) {
                this.write(x, y, grid.at(x, y));
            }
        }
    }
}

const getNeighborhood = (map: Grid<boolean>, x: number, y: number): number => {
    let result: number = 0;

    for (let nx = x-1; nx <= x+1; ++nx) {
        for (let ny = y-1; ny <= y+1; ++ny) {
            if (nx == x && ny == y) continue;
            if (nx < 1 || ny < 1 || nx >= map.width-1 || ny >= map.height-1) result++;
            else result += map.at(nx,ny) ? 1 : 0;
        }
    }

    return result;
}

const generate = (width: number, height: number, seed: number, population: number, birth: number, survival: number, iterations: number): Grid<boolean> => {
    const result = new WriteGrid<boolean>(width, height);
    const buffer = new WriteGrid<boolean>(width, height);
    const rand = new Rand(seed);

    for (let x = 0; x < width; ++x) {
        for (let y = 0; y < height; ++y) {
            const fill = x === 0 || y === 0 || x === width-1 || y === height-1 || rand.value() < population;
            result.write(x, y, fill);
            buffer.write(x, y, fill);
            rand.next();
        }
    }

    for (let i = 0; i < iterations; ++i) {
        for (let x = 1; x < width-1; ++x) {
            for (let y = 1; y < height-1; ++y) {
                const neighbors = getNeighborhood(result, x, y);
                buffer.write(x, y, neighbors >= (result.at(x, y) ? survival : birth));
            }
        }
        result.copyFrom(buffer);
    }

    return result;
}

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

    const update = () :void => {
        const grid = generate(
            150, 150,
            parseInt(seedSlider.value),
            parseFloat(popSlider.value),
            5, 4,
            parseInt(genSlider.value)
        );

        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, 300, 300);

        ctx.fillStyle = '#000';

        iterateGrid(grid, (x, y, val) => {
            if (val) ctx.fillRect(2*x, 2*y, 2, 2);
        });
    };

    multibind(
        [popSlider, genSlider, seedSlider],
        ['oninput', 'onchange'],
        update
    );
    update();
};