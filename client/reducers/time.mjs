import { playerStates, actions as actionTypes } from '../utils/constants.mjs';
import { CRASH_LINGER, CRASH_DELETE } from './player.mjs';
import { segmentIntersectsPolyline, segmentsIntersect } from '../utils/calc.mjs';

const { STARTING, PLAYING, CRASHED } = playerStates;
const { TIME } = actionTypes;

export const movePlayer = (player, timeDelta) => {
  const { status, speed, x: oldX, y: oldY, direction } = player;
  if (status !== PLAYING) return null;
  const [dirX, dirY] = direction;
  const x = oldX + (dirX * timeDelta * speed);
  const y = oldY + (dirY * timeDelta * speed);
  return [x, y];
};

export default (state, action) => {
  if (!action || action.type !== TIME) return state;
  const { timestamp } = action;
  if (!state || !timestamp) return state;

  const { players: oldPlayers, obstacles: board } = state;
  const playerList = Object.keys(oldPlayers);

  const players = {};
  playerList.forEach((name) => {
    const oldPlayer = oldPlayers[name];
    const move = movePlayer(oldPlayer, timestamp - state.time);
    if (move) {
      const [x, y] = move;
      players[name] = { ...oldPlayer, x, y };
    } else {
      players[name] = { ...oldPlayer };
    }
  });

  const playersAsObstacles = playerList
    .map(name => ({ ...oldPlayers[name], name }))
    // Negating this expression so it will keep when crashTime is not defined
    .filter(player => !(timestamp - player.crashTime < CRASH_LINGER))
    .filter(player => player.status !== STARTING);

  const playerPaths = playersAsObstacles.map((player) => {
    const { path, name } = player;
    const result = path.slice();
    result.name = name;
    return result;
  });
  const obstacles = board.concat(playerPaths);

  const playerPathHeads = playersAsObstacles.map((player) => {
    const { path, x, y, name } = player;
    const lastPoint = path[path.length - 1];
    return [lastPoint, [x, y], name];
  });

  playerList.forEach((name) => {
    const player = players[name];
    const { path, status } = player;
    switch (status) {
      case STARTING:
        // check if status should still be STARTING
        console.log({ timestamp, playerStartTime: player.startTime });
        if (timestamp < player.startTime) break;
        player.status = PLAYING;
        player.startTime = timestamp;
        // fall through, because now we're playing!

      case PLAYING: {
        // check for collisions with paths and obstacles
        const p1 = path[path.length - 1];
        const p2 = [player.x, player.y];
        if (p1) {
          obstacles.some((o) => {
            let obstacle = o;
            if (obstacle.name === name) obstacle = o.slice(0, o.length - 1);
            if (segmentIntersectsPolyline(p1, p2, obstacle)) {
              player.status = CRASHED;
              player.crashTime = timestamp;
              return true;
            }
            return false;
          });

          // check if the player crashes into the heads of each path
          if (player.status !== CRASHED) {
            playerPathHeads.some(([p3, p4, headName]) => {
              if (name === headName) return false;
              if (segmentsIntersect(p1, p2, p3, p4)) {
                player.status = CRASHED;
                player.crashTime = timestamp;
                return true;
              }
              return false;
            });
          }
        }

        // append to the path if needed.
        if (player.direction !== player.lastDirection) {
          const oldPlayer = oldPlayers[name];
          player.path = player.path.concat([[oldPlayer.x, oldPlayer.y]]);
          player.lastDirection = player.direction;
        }
        break;
      }

      case CRASHED: {
        if (timestamp - player.crashTime >= CRASH_DELETE) {
          // dispatch that a player is to be deleted
          delete players[name];
        }
        break;
      }

      default:
      // do nothing
    }
  });
  return { ...state, players, time: timestamp };
};
