import { actions } from '../utils/constants.mjs';
import playerReducer from './player.mjs';

export const SECOND = 1000;
export const START_COUNTDOWN = 3 * SECOND;
export const CRASH_LINGER = 2 * SECOND;
const { STATE_SET, BOARD_SET, PLAYER_CURRENT, PLAYER_DELETE } = actions;

export const initialState = {
  time: 0,
  players: {},
  obstacles: [],
  minX: 0,
  maxX: 10,
  minY: 0,
  maxY: 10,
};

export default (state = initialState, action) => {
  if (!action) return state;
  const { type, data } = action;

  const updatePlayer = () => {
    const { player: name } = action;
    const { players } = state;
    const oldPlayer = players[name];
    const player = playerReducer(oldPlayer, action, state);
    if (oldPlayer === player) return state;
    return { ...state, players: { ...players, [name]: player } };
  };

  switch (type) {
    case STATE_SET: {
      return action.data;
    }

    case BOARD_SET: {
      const obstacles = data;
      const [perimeter] = obstacles;
      const Xs = perimeter.map(point => point[0]);
      const Ys = perimeter.map(point => point[1]);
      const minX = Math.min(...Xs);
      const minY = Math.min(...Ys);
      const maxX = Math.max(...Xs);
      const maxY = Math.max(...Ys);
      return {
        ...state, obstacles, minX, maxX, minY, maxY,
      };
    }

    case PLAYER_CURRENT: {
      return { ...state, currentPlayer: data };
    }

    case PLAYER_DELETE: {
      const players = { ...state.players };
      delete players[data];
      return { ...state, players };
    }

    default: {
      if (action.player) return updatePlayer();
      return state;
    }
  }
};
