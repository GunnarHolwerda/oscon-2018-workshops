/* eslint-env: node */
import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { socketCommands } from '../client/utils/constants.mjs';
import createStore from './liteStore.mjs';
import reducer from '../client/reducers/index.mjs';

// Socket server //////////////
const store = createStore(reducer);
const socketPort = process.env.SOCKET_PORT || 8081;

const server = new WebSocket.Server({ port: socketPort });
console.info(`Socket server listening on port ${socketPort}...`);
server.on('connection', (socket) => {
  console.info('socket attached.');
  socket.on('message', (message) => {
    const { data: action } = JSON.parse(message);
    if (action.type !== 'TIME') console.log(action);
    action.timestamp = Date.now();
    store.dispatch(action);
    socket.send(JSON.stringify({ type: socketCommands.ACTION, data: action }));
  });
});


// File server //////////////
const app = express();
app.server = http.createServer(app);

const port = process.env.PORT || 8080;
app.server.listen(port, () => {
  console.info(`Web server listening on port ${app.server.address().port}...`);
});

app.use('/', express.static('dist'));
