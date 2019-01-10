import { initPost as initPost_vectorCaves } from './vector-caves';

const postInitters: {[key: string]: () => void} = {
    'vector-caves': initPost_vectorCaves
};

(window as any).initPost = (name: string): void =>
    postInitters[name]();