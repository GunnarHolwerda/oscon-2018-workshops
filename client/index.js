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
import timeReducer from './reducers/time.mjs';
import actions from './actions/index.mjs';
import { keyCodes, playerStates, actions as actionTypes } from './utils/constants.mjs';
import currentPlayerDirection from './subscribers/currentPlayerDirection';
import currentPlayerStatus from './subscribers/currentPlayerStatus';
import configureSocket from './utils/configureSocket';
import socketActionMiddleware from './utils/socketActionReporter';

const { hostname } = window.location;
const socket = new WebSocket(`ws://${hostname}:8081`);

const { player: { up, down, left, right } } = actions;
const { UP, DOWN, LEFT, RIGHT } = keyCodes;

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, composeEnhancers(applyMiddleware(socketActionMiddleware(socket))));

configureSocket(socket, store);

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

// sound effect hooks
currentPlayerDirection(store);
currentPlayerStatus(store);

// If you want to watch another player, call this function!
window.watch = name => store.dispatch({
  type: actionTypes.PLAYER_CURRENT,
  data: name,
  incoming: true,
});

/**
 * We created a subStore because we want to have a few things happen:
 *
 * 1) We don't want a TIME actions on every requestAnimationFrame to
 *    Show up in redux dev tools. It make the dev tools unhelpful.
 *
 * 2) We don't want the server to have to broadcast TIME actions,
 *    because it makes for a lot of unessesary network traffic.
 *
 * 3) Every client's requestAnimationFrame happens differently,
 *    and we'd like each client to have control over how many
 *    TIME dispatches they need.
 *
 * 4) The alternative was to have our components be time-aware
 *    and update their props independently based upon the current
 *    time (and on every requestAnimationFrame), thus making them
 *    no longer be connected to react-redux. Yuck!
 */
const subStore = createStore(timeReducer);

let pauseAmount = 0;
let pauseTime = null;
const step = () => {
  const timestamp = Date.now();
  // eslint-disable-next-line no-underscore-dangle
  if (window.__REDUX_DEVTOOLS_EXTENSION_LOCKED__) {
    if (pauseTime) pauseAmount = timestamp - pauseTime;
    else pauseTime = timestamp;
  } else {
    subStore.dispatch({
      type: actionTypes.TIME,
      state: store.getState(),
      timestamp,
      pauseAmount,
    });
    const { actionToDispatch } = subStore.getState();
    if (actionToDispatch) store.dispatch(actionToDispatch);
    pauseAmount = 0;
  }
  requestAnimationFrame(step);
};
requestAnimationFrame(step);

render(
  <Provider store={{ ...subStore, dispatch: store.dispatch }}><App /></Provider>,
  document.getElementById('app-root'),
);
