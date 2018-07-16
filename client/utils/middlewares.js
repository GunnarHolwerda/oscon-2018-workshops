import { socketCommands as commands } from './constants.mjs';

/**
 * This middleware reports all actions to the server on a socket.
 * Any pending actions are renamed so the server can handle them appropriately.
 * Also, some actions will require data to be retrieved from the server, so
 * these will get follow-up requests for data
 *
 * @param {Object} socket The socket.io socket to use for all actions.
 * @return {Function} A middleware function to use with a Redux store
 */
export const socketActionReporter = socket => (/* store */) => next => (action) => {
  // Dispatch what comes from the server, but don't send it back!
  if (action.incoming) {
    console.log('incoming action', action);
    return next(action);
  }

  // Send out all the actions to the server
  socket.send(JSON.stringify({ type: commands.ACTION, data: action }));

  // by default, we don't allow actions to hit the reducer - they need to come from the server
  return null;
};

export const actionTimeStamper = (/* store */) => next => action => next({ ...action, timestamp: Date.now() });
