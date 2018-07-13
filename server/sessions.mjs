/* eslint-env: node */
import { actions, socketCommands as commands } from '../client/utils/constants.mjs';

const { STATE_SET, PLAYER_ADD, PLAYER_ADD_ERR, PLAYER_CURRENT, PLAYER_DELETE } = actions;

const sessions = {};

export const sendAction = socket => (action) => {
  socket.send(JSON.stringify({
    type: commands.ACTION,
    data: action,
  }));
};

export const broadcast = (action) => {
  Object.keys(sessions).forEach((id) => {
    const socket = sessions[id];
    try {
      sendAction(socket)(action);
    } catch (err) {
      console.error('ERR: Failed to send');
    }
  });
};

export const nameAvailable = name => Object.keys(sessions).every(id => sessions[id].name !== name);

export const newConnection = store => (socket) => {
  const id = Date.now();
  sessions[id] = socket;
  const send = sendAction(socket);
  socket.on('message', (message) => {
    const { type, data: action } = JSON.parse(message);

    // Wait right there... Before we reduce this, we need to
    // make sure the name provided is available. If not, send out an error.
    if (type === commands.ACTION) {
      if (action.type === PLAYER_ADD) {
        if (nameAvailable(action.data)) {
          // eslint-disable-next-line no-param-reassign
          socket.name = action.data;
          send({
            type: PLAYER_CURRENT,
            data: action.data.name,
          });
        } else {
          send({
            type: PLAYER_ADD_ERR,
            data: action.data.name,
          });
          return;
        }
      }

      // reduce on our local store
      store.dispatch(action);
      // broadcast to all other sessions
      broadcast(action);
    }
  });

  socket.on('close', () => {
    delete sessions[id];
    broadcast({
      type: PLAYER_DELETE,
      data: id,
    });
  });

  // Welcome to the party, here is the current state
  socket.send(JSON.stringify({
    type: commands.INIT,
    data: {
      type: STATE_SET,
      data: store.getState(),
      timestamp: Date.now(),
    },
  }));
};
