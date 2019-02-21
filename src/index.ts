import { initPost as initPost_vectorCaves } from 'pages/vector-caves';
import { initGame, initLocalMultiGame } from 'pages/game';

const postInitters: {[key: string]: () => void} = {
    'vector-caves': initPost_vectorCaves,
};

(window as any).initPost = (name: string): void =>
    postInitters[name]();

(window as any).initGame = initGame;

(window as any).initLocalMultiGame = initLocalMultiGame;