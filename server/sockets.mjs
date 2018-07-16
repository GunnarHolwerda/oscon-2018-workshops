import { socketCommands, actionTypes } from '../client/utils/constants.mjs';

const sockets = new Set();

const broadcast = (message) => {
  const stringified = JSON.stringify(message);
  sockets.forEach((socket) => {
    socket.send(stringified);
  });
};

const forNewSockets = store => (socket) => {
  sockets.add(socket);

  socket.on('message', (message) => {
    const { data: action } = JSON.parse(message);
    if (action.type !== 'TIME') console.log(action);
    action.timestamp = Date.now();

    if (action.type === actionTypes.PLAYER_ADD) {
      // eslint-disable-next-line
      socket.name = action.player;
    }

    store.dispatch(action);
    broadcast({ type: socketCommands.ACTION, data: action });
  });

  socket.send(JSON.stringify({
    type: socketCommands.INIT,
    data: {
      type: actionTypes.STATE_SET,
      data: {
        type: actionTypes.STATE_SET,
        data: store.getState(),
        timestamp: Date.now(),
      },
    },
  }));

  socket.on('close', () => {
    const action = {
      type: actionTypes.PLAYER_DELETE,
      data: socket.name,
    };
    broadcast({
      type: socketCommands.action,
      data: action,
    });
    store.dispatch(action);
    sockets.delete(socket);
  });
};

export default forNewSockets;
