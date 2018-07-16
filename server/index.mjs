/* eslint-env: node */
import express from 'express';
import http from 'http';
import WebSocket from 'ws';

// Socket server //////////////
const socketPort = process.env.SOCKET_PORT || 8081;

const server = new WebSocket.Server({ port: socketPort });
console.info(`Socket server listening on port ${socketPort}...`);
server.on('connection', (socket) => {
  console.log('socket attached.');
  socket.on('message', console.log);
});


// File server //////////////
const app = express();
app.server = http.createServer(app);

const port = process.env.PORT || 8080;
app.server.listen(port, () => {
  console.info(`Web server listening on port ${app.server.address().port}...`);
});

app.use('/', express.static('dist'));
