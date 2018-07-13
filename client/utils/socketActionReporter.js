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
const socketActionReporter = socket => store => next => (action) => {
  // don't cycle incoming actions back - these are from the server
  if (action.incoming) {
    return next(action);
  }

  // outgoing
  const timestamp = Date.now() - store.getState().timeOffset;
  socket.send(JSON.stringify({ type: commands.ACTION, data: { ...action, timestamp } }));

  // by default, we don't allow actions to hit the reducer - they need to come from the server
  return null; // next(action);
};

export default socketActionReporter;
