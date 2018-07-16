import { socketCommands } from './constants.mjs';

export const socketActionReporter = socket => store => next => (action) => {
  // Send it
  socket.send(JSON.stringify({
    type: socketCommands.ACTION,
    data: action,
  }));

  return next({ ...action, timestamp: Date.now() });
};

export const actionTimeStamper = (/* store */) => next => action => next({ ...action, timestamp: Date.now() });