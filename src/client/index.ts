import { initPost as initPost_vectorCaves } from './vector-caves';
import { initGame, initLocalMultiGame } from './game';

const postInitters: {[key: string]: () => void} = {
    'vector-caves': initPost_vectorCaves,
};

(window as any).initPost = (name: string): void =>
    postInitters[name]();

(window as any).initGame = initGame;

(window as any).initLocalMultiGame = initLocalMultiGame;