import { actions, directions, playerStates } from '../utils/constants.mjs';

const { PLAYER_ADD, PLAYER_START, PLAYER_DIRECTION, PLAYER_CRASH } = actions;
const { STARTING, PLAYING, CRASHED } = playerStates;

export const SECOND = 1000;

const basePlayer = {
  status: STARTING,
  speed: 50 / SECOND,
  direction: directions.UP,
  path: [],
};

const colorList = {
  '#ff1744': 0,
  '#42a5f5': 0,
  '#AA00FF': 0,
  '#00BCD4': 0,
  '#3d5afe': 0,
  '#00c853': 0,
  '#FF9800': 0,
  '#FFEB3B': 0,
  '#ff5722': 0,
  '#ff4081': 0,
};

const leastUsedColor = (state) => {
  const counts = { ...colorList };
  Object.keys(state.players).forEach((name) => {
    const { color } = state.players[name];
    counts[color] += 1;
  });

  return Object.keys(counts).reduce(
    (least, current) => (counts[least] < counts[current] ? least : current),
    'ugly',
  );
};

export default (player, action, parentState) => {
  const { type, data, timestamp } = action;
  const { status } = player || {};

  const updateAndMove = (patch) => {
    const { path, speed, direction, lastUpdate } = player;
    if (status !== PLAYING) return { ...player, ...patch };
    const timeDelta = action.time - lastUpdate;
    const lastPoint = path[path.length] - 1;
    const nextPoint = [
      lastPoint[0] + (direction[0] * timeDelta * speed),
      lastPoint[1] + (direction[1] * timeDelta * speed),
    ];
    return { ...player, ...patch, lastUpdate: action.time, path: [...path, nextPoint] };
  };

  switch (type) {
    case PLAYER_ADD: {
      const { x, y } = data;
      // Ignore adding players with a name that already exists on the board
      if (player && status !== CRASHED) return player;
      const color = player ? player.color : leastUsedColor(parentState);
      return { ...basePlayer, x, y, color, startTime: timestamp };
    }

    case PLAYER_START: {
      // Ignore if player isn't in starting state
      if (status !== STARTING) return player;
      return { ...player, status: PLAYING, lastUpdate: timestamp };
    }

    case PLAYER_DIRECTION: {
      const { direction: lastDir } = player;
      const { direction } = data;

      // if we're in a starting state, we can change to any
      // direction, but no moving allowed yet.
      if (status === STARTING) return { ...player, direction };

      // If the direction is the same as before, do nothing
      if (lastDir === direction) return player;
      // If the direction is exactly the opposite of before, do nothing
      if (lastDir && direction[0] === -lastDir[0] && direction[1] === -lastDir[1]) return player;

      // If the direction provided isn't redundant or conflicting,
      // Time to update the position
      return updateAndMove({ direction });
    }

    case PLAYER_CRASH: {
      // ignore unless the player is currently playing
      if (status !== PLAYING) return player;
      return updateAndMove({ status: CRASHED, crashTime: timestamp });
    }
    default: return player;
  }
};
