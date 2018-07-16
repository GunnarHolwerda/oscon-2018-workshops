import { playerStates, actions as actionTypes } from '../utils/constants.mjs';
import { movePlayer, CRASH_LINGER, CRASH_DELETE } from './player.mjs';
import { segmentIntersectsPolyline, segmentsIntersect } from '../utils/calc.mjs';
import actions from '../actions/index.mjs';
import { initialState } from './index.mjs';

const { STARTING, PLAYING, CRASHED } = playerStates;
const { TIME } = actionTypes;

export default (lastState, action) => {
  if (!action || action.type !== TIME) return initialState;
  const { state, timestamp, pauseAmount = 0 } = action;
  if (!state || !timestamp) return initialState;

  const time = timestamp - pauseAmount;

  const { players: oldPlayers, currentPlayer, obstacles: board } = state;
  const playerList = Object.keys(oldPlayers);

  const players = {};
  playerList.forEach((name) => {
    const oldPlayer = oldPlayers[name];
    const [x, y] = movePlayer(oldPlayer, time);
    const player = { ...oldPlayer, x, y };
    players[name] = player;
  });

  const playersAsObstacles = playerList
    .map(name => ({ ...players[name], name }))
    // Negating this expression so it will keep when crashTime is not defined
    .filter(player => !(time - player.crashTime < CRASH_LINGER))
    .filter(player => player.status !== STARTING);

  const playerPaths = playersAsObstacles.map((player) => {
    const { path, name } = player;
    if (name === currentPlayer) return path.slice(0, path.length - 1);
    return path;
  });
  const obstacles = board.concat(playerPaths);

  const playerPathHeads = playersAsObstacles
    .filter(player => player.name !== currentPlayer)
    .map((player) => {
      const { path, x, y, name } = player;
      const lastPoint = path[path.length - 1];
      return [lastPoint, [x, y], name];
    });

  let actionToDispatch = null;

  const player = players[currentPlayer];
  if (player) {
    const { path, status } = player;

    switch (status) {
      case STARTING:
      // check if status should still be STARTING
        if (time < player.startTime) break;
        player.status = PLAYING;
        player.startTime = time;
        actionToDispatch = actions.player.start(currentPlayer);
      // fall through, because now we're playing!

      case PLAYING: {
      // check for collisions with paths and obstacles
        const p1 = path[path.length - 1];
        const p2 = [player.x, player.y];
        obstacles.some((obstacle) => {
          if (segmentIntersectsPolyline(p1, p2, obstacle)) {
            player.status = CRASHED;
            player.crashTime = time;
            return true;
          }
          return false;
        });

        // check if the player crashes into the heads of each path
        if (player.status !== CRASHED) {
          playerPathHeads.some(([p3, p4]) => {
            if (segmentsIntersect(p1, p2, p3, p4)) {
              player.status = CRASHED;
              player.crashTime = time;
              return true;
            }
            return false;
          });
        }

        if (player.status === CRASHED) {
          // dispatch that a player has crashed
          actionToDispatch = actions.player.crash(currentPlayer);
        }
        break;
      }

      case CRASHED: {
        console.log('we haz crashed already');
        if (time - player.crashTime >= CRASH_DELETE) {
          // dispatch that a player is to be deleted
          actionToDispatch = actions.player.delete(currentPlayer);
        }
        break;
      }

      default:
      // do nothing
    }
  }
  return { ...state, players, actionToDispatch, time };
};
