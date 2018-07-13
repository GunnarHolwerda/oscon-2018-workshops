import { actions, directions } from '../utils/constants.mjs';
import { isClosed } from '../utils/calc.mjs';

const { BOARD_SET, PLAYER_ADD, PLAYER_DIRECTION, PLAYER_CURRENT, TIME } = actions;
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

const player = {
  add: (name, inputX, inputY) => {
    if (inputX == null) throw new Error(`x is required. Received ${inputX}`);
    if (inputY == null) throw new Error(`y is required. Received ${inputY}`);
    const x = Number(inputX);
    const y = Number(inputY);
    if (Number.isNaN(x)) throw new Error(`x should be a number. Received ${inputX}`);
    if (Number.isNaN(y)) throw new Error(`y should be a number. Received ${inputY}`);
    return { type: PLAYER_ADD, data: { x, y }, player: name };
  },

  claim: data => ({ type: PLAYER_CURRENT, data }),

  up: name => ({ type: PLAYER_DIRECTION, data: UP, player: name }),
  down: name => ({ type: PLAYER_DIRECTION, data: DOWN, player: name }),
  left: name => ({ type: PLAYER_DIRECTION, data: LEFT, player: name }),
  right: name => ({ type: PLAYER_DIRECTION, data: RIGHT, player: name }),
};

const time = (amount) => {
  const data = Number(amount);
  if (!Number.isFinite(data)) throw Error(`amount should be a number. Received ${amount}`);
  if (!data) throw Error(`amount must exist and be non-zero. Received ${amount}`);
  return { type: TIME, data };
};

export default { board, player, time };
