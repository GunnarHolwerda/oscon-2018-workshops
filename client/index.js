/* eslint-env browser */
import './index.css';
import './components/App.css';
import './components/Board.css';
import './components/Scores.css';
import './components/Player.css';
import './components/PlayerStart.css';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';

import App from './components/App';
import reducer from './reducers/index.mjs';
import actions from './actions/index.mjs';
import { keyCodes, playerStates, actions as actionTypes } from './utils/constants.mjs';
import currentPlayerDirection from './subscribers/currentPlayerDirection';
import currentPlayerStatus from './subscribers/currentPlayerStatus';
import { socketActionReporter } from './utils/middlewares';

const { hostname } = window.location;
const socket = new WebSocket(`ws://${hostname}:8081`);

const { player: { up, down, left, right } } = actions;
const { UP, DOWN, LEFT, RIGHT } = keyCodes;

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, composeEnhancers(applyMiddleware(socketActionReporter(socket))));

// configureSocket(socket, store);
socket.addEventListener('message', (event) => {
  const { data } = JSON.parse(event.data);
  data.incoming = true;
  store.dispatch(data);
});

document.addEventListener('keydown', (evt) => {
  const { currentPlayer: name, players } = store.getState();
  if (!name) return;
  const player = players[name];
  if (!player || player.status === playerStates.CRASHED) return;
  let prevent = true;
  switch (evt.keyCode) {
    case UP: store.dispatch(up(name)); break;
    case DOWN: store.dispatch(down(name)); break;
    case LEFT: store.dispatch(left(name)); break;
    case RIGHT: store.dispatch(right(name)); break;
    default:
      prevent = false;
  }
  if (prevent) evt.preventDefault();
});

socket.addEventListener('open', () => {
  store.dispatch(actions.board.load([
    [[0, 0], [500, 0], [500, 500], [0, 500], [0, 0]],
    [[150, 150], [350, 350]],
  ]));

  // sound effect hooks
  currentPlayerDirection(store);
  currentPlayerStatus(store);

  // If you want to watch another player, call this function!
  window.watch = name => store.dispatch({
    type: actionTypes.PLAYER_CURRENT,
    data: name,
    incoming: true,
  });

  // This is to allow things to animate
  // const next = requestAnimationFrame;
  const next = func => setTimeout(func, 2000);
  const step = () => {
    store.dispatch(actions.time(Date.now()));
    next(step);
  };
  next(step);
});

render(
  <Provider store={store}><App /></Provider>,
  document.getElementById('app-root'),
);
