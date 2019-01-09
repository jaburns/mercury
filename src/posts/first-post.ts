export const initPost = () :void => {
    const helloButton = document.getElementById('hello-button') as HTMLButtonElement;
    helloButton.onclick = () =>
        console.log("Hello world!");
};