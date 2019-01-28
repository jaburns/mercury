import { initPost as initPost_vectorCaves } from 'pages/vector-caves';
import { initPost as initPost_webgl } from 'pages/page2-webgl';

const postInitters: {[key: string]: () => void} = {
    'vector-caves': initPost_vectorCaves,
    'page2-webgl': initPost_webgl
};

(window as any).initPost = (name: string): void =>
    postInitters[name]();