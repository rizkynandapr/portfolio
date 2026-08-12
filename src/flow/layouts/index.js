import vertical from './vertical.js';
import horizontal from './horizontal.js';
import branching from './branching.js';
import convergent from './convergent.js';

export const LAYOUTS = { vertical, horizontal, branching, convergent };
export const COMPOSITIONS = Object.keys(LAYOUTS);
