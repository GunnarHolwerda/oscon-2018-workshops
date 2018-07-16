/* eslint-env: node */
import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import createStore from './liteStore.mjs';
import reducer from '../client/reducers/index.mjs';
import actions from '../client/actions/index.mjs';
import forNewSockets from './sockets.mjs';

// Socket server //////////////
const store = createStore(reducer);

store.dispatch(actions.board.load([
  // I am the boundaries
  [[0, 0], [500, 0], [500, 500], [0, 500], [0, 0]],
  // I am the line across the middle
  [[150, 150], [350, 350]],
]));

const newSocket = forNewSockets(store);

const socketPort = process.env.SOCKET_PORT || 8081;

const server = new WebSocket.Server({ port: socketPort });
console.info(`Socket server listening on port ${socketPort}...`);
server.on('connection', newSocket);


// File server //////////////
const app = express();
app.server = http.createServer(app);

const port = process.env.PORT || 8080;
app.server.listen(port, () => {
  console.info(`Web server listening on port ${app.server.address().port}...`);
});

app.use('/', express.static('dist'));
