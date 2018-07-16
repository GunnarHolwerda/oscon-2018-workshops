import { actions, directions, playerStates } from '../utils/constants.mjs';

const { PLAYER_ADD, PLAYER_DIRECTION } = actions;
const { STARTING, CRASHED } = playerStates;

export const SECOND = 1000;
export const START_COUNTDOWN = 3 * SECOND;
export const CRASH_LINGER = 2 * SECOND;
export const CRASH_DELETE = 15 * SECOND;

const initializePlayer = (x, y, startTime, color) => ({
  x,
  y,
  color,
  startTime,
  status: STARTING,
  speed: 50 / SECOND,
  direction: directions.UP,
  lastDirection: null,
  path: [],
});

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

  switch (type) {
    case PLAYER_ADD: {
      const { x, y } = data;
      // Ignore adding players with a name that already exists on the board
      if (player && status !== CRASHED) return player;
      const color = player ? player.color : leastUsedColor(parentState);
      return initializePlayer(x, y, timestamp + START_COUNTDOWN, color);
    }

    case PLAYER_DIRECTION: {
      const direction = data;
      const { lastDirection, direction: currentDirection } = player;

      // If we're crashed, this is a no-op
      if (status === CRASHED) return player;

      // If the direction is the same as current, do nothing
      if (currentDirection === direction) return player;

      // if we're in a starting state, we can change to any
      // direction, but no moving allowed yet.
      if (status === STARTING) return { ...player, direction };

      // If the direction is exactly the opposite of before, do nothing
      if (lastDirection && direction[0] === -lastDirection[0] && direction[1] === -lastDirection[1]) return player;

      // If the direction provided isn't redundant or conflicting,
      // Time to update the position
      return { ...player, direction };
    }
    default: return player;
  }
};
