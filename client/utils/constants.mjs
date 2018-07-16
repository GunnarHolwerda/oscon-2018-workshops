export const actions = {
  STATE_SET: 'STATE_SET',
  BOARD_SET: 'BOARD_SET',
  PLAYER_ADD: 'PLAYER_ADD',
  PLAYER_ADD_ERR: 'PLAYER_ADD_ERR',
  PLAYER_CURRENT: 'PLAYER_CURRENT',
  PLAYER_START: 'PLAYER_START',
  PLAYER_DIRECTION: 'PLAYER_DIRECTION',
  PLAYER_CRASH: 'PLAYER_CRASH',
  PLAYER_DELETE: 'PLAYER_DELETE',
  TIME: 'TIME',
};

export const directions = {
  UP: [0, -1],
  DOWN: [0, 1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
};

export const keyCodes = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
};

export const playerStates = {
  STARTING: 'STARTING',
  PLAYING: 'PLAYING',
  CRASHED: 'CRASHED',
};
