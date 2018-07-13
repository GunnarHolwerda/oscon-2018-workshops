/* eslint-env browser */
import { socketCommands as commands } from './constants.mjs';

let actionQueue = [];

export default function configureSocket(socket, store) {
  socket.addEventListener('open', () => {
    // console.log('Socket connected...');
  });

  socket.addEventListener('message', (event) => {
    const { type, data } = JSON.parse(event.data);
    data.incoming = true;
    if (type === commands.INIT) {
      data.timeOffset = Date.now() - data.timestamp;
      store.dispatch(data);
    } else if (type === commands.ACTION) {
      actionQueue.push(data);
    }
  });

  window.onbeforeunload = () => {
    socket.close();
  };

  // return a function that flushes the read head
  return () => {
    actionQueue.forEach((action) => {
      store.dispatch(action);
    });
    actionQueue = [];
  };
}
