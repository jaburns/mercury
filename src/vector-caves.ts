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