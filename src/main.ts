import { initPost as initPost_firstPost } from './vector-caves';

const initters: {[key: string]: () => void} = {
    'vector-caves': initPost_firstPost
};

const initPost = (name: string): void => {
    const initter = initters[name];
    if (initter) initter();
};

(window as any).initPost = initPost;