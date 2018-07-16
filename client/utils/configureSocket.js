/* eslint-env browser */
import { socketCommands as commands } from './constants.mjs';

export default function configureSocket(socket, store) {
  socket.addEventListener('open', () => {
    // console.log('Socket connected...');
  });

  let timeOffset = 0;
  socket.addEventListener('message', (event) => {
    const { type, data } = JSON.parse(event.data);
    data.incoming = true;
    if (type === commands.INIT) {
      timeOffset = Date.now() - data.timestamp;
    } else {
      data.timestamp += timeOffset;
    }
    store.dispatch(data);
  });

  window.onbeforeunload = () => {
    socket.close();
  };
}
