/* eslint-env mocha */
import { expect } from 'chai';
import { actions, directions, playerStates } from '../utils/constants.mjs';
import indexReducer, { initialState, START_COUNTDOWN } from './index.mjs';
import timeReducer from './time.mjs';
import reducerFreezer from '../utils/reducerFreezer';

const { BOARD_SET, PLAYER_ADD, PLAYER_CURRENT, PLAYER_DIRECTION, PLAYER_START, PLAYER_CRASH, TIME } = actions;
const { LEFT, RIGHT, UP } = directions;
const { STARTING, PLAYING, CRASHED } = playerStates;

const reducer = reducerFreezer(indexReducer);
const reduce = (state, ...actionList) => actionList.reduce(reducer, state);
const reducerOfTime = reducerFreezer(timeReducer);

const reduceTime = (state, timestamp, pauseAmount) => reducerOfTime(null, { type: TIME, state, timestamp, pauseAmount });

const WIDTH = 500;
const HEIGHT = 500;

const board = {
  type: BOARD_SET,
  data: [[
    [0, 0],
    [WIDTH, 0],
    [WIDTH, HEIGHT],
    [0, HEIGHT],
    [0, 0],
  ]],
};

const bobAdd = {
  type: PLAYER_ADD,
  data: { x: 50, y: 50 },
  player: 'bob',
  timestamp: 0,
};

const joeAdd = {
  type: PLAYER_ADD,
  data: { x: 100, y: 60 },
  player: 'joe',
  timestamp: 0,
};

const iAmBob = { type: PLAYER_CURRENT, data: 'bob' };
const bobStart = { player: 'bob', type: PLAYER_START, timestamp: START_COUNTDOWN };
const joeStart = { player: 'joe', type: PLAYER_START, timestamp: START_COUNTDOWN };

const bobRight = {
  type: PLAYER_DIRECTION,
  data: RIGHT,
  player: 'bob',
  timestamp: 0,
};

const bobLaterRight = { ...bobRight, timestamp: START_COUNTDOWN + 500 };

const joeUp = {
  type: PLAYER_DIRECTION,
  data: UP,
  player: 'joe',
  timestamp: 0,
};

const joeLeft = {
  type: PLAYER_DIRECTION,
  data: LEFT,
  player: 'joe',
  timestamp: 4000,
};

describe.only('reducers/time', () => {
  it('should not move players before their time', () => {
    const state = reduce(initialState, bobAdd);
    const timed = reduceTime(state, 50);
    const { bob } = timed.players;
    expect(bob.status).to.equal(STARTING);
    expect(bob.x).to.equal(50);
    expect(bob.y).to.equal(50);
  });

  it('should not move players before their time (with pauseAmount)', () => {
    const state = reduce(initialState, bobAdd);
    const timed = reduceTime(state, 5000, 3000);
    const { bob } = timed.players;
    expect(bob.status).to.equal(STARTING);
    expect(bob.x).to.equal(50);
    expect(bob.y).to.equal(50);
  });

  it('should start moving players after the countdown', () => {
    const state = reduce(initialState, bobAdd, bobStart);
    const timed = reduceTime(state, 5000);
    const { bob } = timed.players;
    expect(bob.status).to.equal(PLAYING);
    expect(bob.y).to.be.below(50);
  });

  it('should add to the path whenever the direction changes', () => {
    const state = reduce(initialState, bobAdd, bobStart, bobLaterRight);
    const timed = reduceTime(state, 4000);
    const { bob } = timed.players;
    expect(bob.status).to.equal(PLAYING);
    expect(bob.y).to.be.below(50);
    expect(bob.x).to.be.above(50);
    expect(bob.path.length).to.equal(2);
  });

  it('players should crash into the board', () => {
    const state = reduce(initialState, board, bobAdd, iAmBob, bobRight, bobStart);
    const timed = reduceTime(state, 90000);
    expect(timed.players.bob.status).to.equal(CRASHED);
    expect(timed.actionToDispatch).to.deep.equal({ type: PLAYER_CRASH, player: 'bob' });
  });

  it('should not move crashed players', () => {
    const state = reduce(initialState, board, bobAdd, iAmBob, bobRight, bobStart);
    const timed = reduceTime(state, 20000);
    const { bob } = timed.players;
    const bobCrashed = { ...timed.actionToDispatch, timestamp: 20000 };
    const stateAfterCrash = reduce(state, bobCrashed);
    const timed2 = reduceTime(stateAfterCrash, 20001);
    const { bob: bob2 } = timed2.players;
    expect(bob.x).to.equal(bob2.x);
    expect(bob.y).to.equal(bob2.y);
  });

  it('should crash into the path of other players', () => {
    const state = reduce(initialState, bobAdd, joeAdd, bobRight, joeUp, bobStart, joeStart, joeLeft);
    const timed = reduceTime(state, 5000);
    console.log(timed.players.bob);
    console.log(timed.players.joe);
    expect(timed.players.bob.status).to.equal(CRASHED);
  });

  it.skip('should crash into the head-path of other players', () => {
    let state = reduce(initialState, bobAdd, bobRight, joeAdd, joeUp);
    const crashPoint = state.players.joe.x;
    while (state.players.bob.x < crashPoint) state = reduce(state, time);
    expect(state.players.bob.status).to.equal(CRASHED);
  });
});
