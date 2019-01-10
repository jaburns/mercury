export const initPost = () :void => {
    const helloButton = document.getElementById('hello-button') as HTMLButtonElement;
    const firstCanvas = document.getElementById('first-canvas') as HTMLCanvasElement;
    const ctx = firstCanvas.getContext('2d') as CanvasRenderingContext2D;

    helloButton.onclick = () => {
        ctx.fillStyle = '#000';
        ctx.fillRect(
            30*Math.floor(Math.random()*10),
            30*Math.floor(Math.random()*10),
            30, 30
        );
    };
};