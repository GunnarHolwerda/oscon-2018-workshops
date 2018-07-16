import { actions, directions } from '../utils/constants.mjs';
import { isClosed } from '../utils/calc.mjs';

const { BOARD_SET, PLAYER_ADD, PLAYER_START, PLAYER_DIRECTION, PLAYER_CURRENT, PLAYER_CRASH, PLAYER_DELETE } = actions;
const { UP, DOWN, LEFT, RIGHT } = directions;

const board = {
  load: (data) => {
    if (!Array.isArray(data)) throw Error(`board received must be an array. Received${typeof data}`);
    if (!data.every(Array.isArray)) throw Error('board received must be an array of arrays.');
    if (!data.every(p => p.every(Array.isArray))) throw Error('board received must be an array of arrays of arrays');
    if (!data.every(p => p.every(n => n.every(Number.isFinite)))) throw Error('Non-numeric points found in board.');
    if (!data.every(p => p.every(n => n.length === 2))) throw Error('Points must always be of length=2');
    if (!data.every(p => p.length >= 2)) throw Error('All polylines must have at least 2 points');
    const [boundary] = data;
    if (boundary.length < 3) throw Error('First polyline (boundary) must have at least 3 points');
    if (!isClosed(boundary)) throw Error('First polyline (boundary) must be self-closing');
    return { type: BOARD_SET, data };
  },
};

const playerActions = {
  add: (name, inputX, inputY) => {
    if (inputX == null) throw new Error(`x is required. Received ${inputX}`);
    if (inputY == null) throw new Error(`y is required. Received ${inputY}`);
    const x = Number(inputX);
    const y = Number(inputY);
    if (Number.isNaN(x)) throw new Error(`x should be a number. Received ${inputX}`);
    if (Number.isNaN(y)) throw new Error(`y should be a number. Received ${inputY}`);
    return { type: PLAYER_ADD, data: { x, y }, player: name };
  },

  up: player => ({ type: PLAYER_DIRECTION, data: UP, player }),
  down: player => ({ type: PLAYER_DIRECTION, data: DOWN, player }),
  left: player => ({ type: PLAYER_DIRECTION, data: LEFT, player }),
  right: player => ({ type: PLAYER_DIRECTION, data: RIGHT, player }),
  crash: player => ({ type: PLAYER_CRASH, player }),
  start: player => ({ type: PLAYER_START, player }),

  // We DON'T want to use the `player` property on these actions, because
  // we need this to be ignored by the player reducer, but instead
  // be handled by the main reducer.
  claim: data => ({ type: PLAYER_CURRENT, data }),
  delete: data => ({ type: PLAYER_DELETE, data }),
};

export default { board, player: playerActions };
