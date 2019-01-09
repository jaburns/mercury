import { initPost as initPost_firstPost } from './posts/first-post';

const initters: {[key: string]: () => void} = {
    'first-post': initPost_firstPost
};

const initPost = (name: string): void => {
    const initter = initters[name];
    if (initter) initter();
};

(window as any).initPost = initPost;