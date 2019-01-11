
interface Grid<T> {
    readonly width: number;
    readonly height: number;
    at(x: number, y: number): T;
}

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

    }
}

const generate = (width: number, height: number, seed: number, population: number, birth: number, survival: number, iterations: number): Grid<boolean> => {
    const result = new WriteGrid<boolean>(width, height);
    const buffer = new WriteGrid<boolean>(width, height);

    for (let x = 0; x < width; ++x) {
        for (let y = 0; y < height; ++y) {
            const fill = x === 0 || y === 0 || x === width-1 || y === height-1 || Math.random() < population;
            result.write(x, y, fill);
            buffer.write(x, y, fill);
        }
    }

    for (let i = 0; i < iterations; ++i) {
        for (let x = 1; x < width-1; ++x) {
            for (let y = 1; y < height-1; ++y) {
                var neighbors = getNeighborhood(result, x, y);
                buffer[x,y] = neighbors >= (result[x,y] ? survival : birth);
            }
        }
        result = buffer;
    }


}

const getNeighborhood (bool[,] map, int x, int y)
        {
            int result = 0;

            for (int nx = x-1; nx <= x+1; ++nx) {
                for (int ny = y-1; ny <= y+1; ++ny) {
                    if (nx == x && ny == y) continue;
                    if (nx < 1 || ny < 1 || nx >= map.GetLength(0)-1 || ny >= map.GetLength(1)-1) result++;
                    else result += map[nx,ny] ? 1 : 0;
                }
            }

            return result;
        }


const createGrid =(): Grid<number> => {
    // const result =[];

    return {
        width: 5,
        height: 5,
        at: (x,y) => {
            return x + y;
        }
    };
};

const x = createGrid();

console.log(x.at(1,2));

export const initPost = () :void => {
    const firstCanvas = document.getElementById('first-canvas') as HTMLCanvasElement;
    const ctx = firstCanvas.getContext('2d') as CanvasRenderingContext2D;

    firstCanvas.onclick = () => {
        ctx.fillStyle = '#000';
        ctx.fillRect(
            30*Math.floor(Math.random()*10),
            30*Math.floor(Math.random()*10),
            30, 30
        );
    };
};