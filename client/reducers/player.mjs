import { actions, directions, playerStates } from '../utils/constants.mjs';

const { PLAYER_ADD, PLAYER_START, PLAYER_DIRECTION, PLAYER_CRASH } = actions;
const { STARTING, PLAYING, CRASHED } = playerStates;

export const SECOND = 1000;
export const START_COUNTDOWN = 3 * SECOND;
export const CRASH_LINGER = 2 * SECOND;
export const CRASH_DELETE = 15 * SECOND;

const basePlayer = {
  status: STARTING,
  speed: 50 / SECOND,
  direction: directions.UP,
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

export const movePlayer = (player, timestamp) => {
  const { status, speed, path, direction, lastUpdate = player.startTime } = player;
  const lastPoint = path[path.length - 1];
  if (status !== PLAYING) return lastPoint;
  const [oldX, oldY] = lastPoint;
  const [dirX, dirY] = direction;
  const timeDelta = timestamp - lastUpdate;
  const x = oldX + (dirX * timeDelta * speed);
  const y = oldY + (dirY * timeDelta * speed);
  return [x, y];
};

export default (player, action, parentState) => {
  const { type, data, timestamp } = action;
  const { status } = player || {};

  const updateAndMove = (patch) => {
    if (status !== PLAYING) return { ...player, ...patch };
    const move = movePlayer(player, action.timestamp);
    const { path: oldPath } = player;
    const path = [...oldPath, move];
    return { ...player, ...patch, path, lastUpdate: action.timestamp };
  };

  switch (type) {
    case PLAYER_ADD: {
      const { x, y } = data;
      const path = [[x, y]];
      // Ignore adding players with a name that already exists on the board
      if (player && status !== CRASHED) return player;
      const color = player ? player.color : leastUsedColor(parentState);
      return { ...basePlayer, path, color, startTime: timestamp + START_COUNTDOWN };
    }

    case PLAYER_START: {
      // Ignore if player isn't in starting state
      if (status !== STARTING) return player;
      return { ...player, status: PLAYING, startTime: timestamp, lastUpdate: timestamp };
    }

    case PLAYER_DIRECTION: {
      const { direction: lastDir } = player;
      const direction = data;

      // If we're crashed, this is a no-op
      if (status === CRASHED) return player;

      // If the direction is the same as before, do nothing
      if (lastDir === direction) return player;

      // if we're in a starting state, we can change to any
      // direction, but no moving allowed yet.
      if (status === STARTING) return { ...player, direction };

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
