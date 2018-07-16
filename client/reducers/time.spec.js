/* eslint-env mocha */
import { expect } from 'chai';
import { actions, directions, playerStates } from '../utils/constants.mjs';
import indexReducer, { initialState } from './index.mjs';
import reducerFreezer from '../utils/reducerFreezer';

const { BOARD_SET, PLAYER_ADD, PLAYER_DIRECTION, TIME } = actions;
const { LEFT, RIGHT, UP } = directions;
const { STARTING, PLAYING, CRASHED } = playerStates;

const reducer = reducerFreezer(indexReducer);
const reduce = (state, ...actionList) => actionList.reduce(reducer, state);

const time = timestamp => ({ type: TIME, timestamp });

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
};

const joeAdd = {
  type: PLAYER_ADD,
  data: { x: 100, y: 60 },
  player: 'joe',
};

const bobRight = {
  type: PLAYER_DIRECTION,
  data: RIGHT,
  player: 'bob',
};

const joeUp = {
  type: PLAYER_DIRECTION,
  data: UP,
  player: 'joe',
};

const joeLeft = {
  type: PLAYER_DIRECTION,
  data: LEFT,
  player: 'joe',
};

describe.only('reducers/time', () => {
  it.only('should not move players before their time', () => {
    const state = reduce(initialState, bobAdd, time(50));
    const { bob } = state.players;
    expect(bob.status).to.equal(STARTING);
    expect(bob.x).to.equal(50);
    expect(bob.y).to.equal(50);
  });

  it('should start moving players after the countdown', () => {
    const state = reduce(initialState, bobAdd, time(5000), time(5001));
    const { bob } = state.players;
    expect(bob.status).to.equal(PLAYING);
    expect(bob.y).to.be.below(50);
  });

  it('should add to the path whenever the direction changes', () => {
    const state = reduce(initialState, bobAdd, time(3000), time(3500), bobRight, time(4000), time(4001));
    const { bob } = state.players;
    expect(bob.status).to.equal(PLAYING);
    expect(bob.y).to.be.below(50);
    expect(bob.x).to.be.above(50);
    expect(bob.path.length).to.equal(2);
  });

  it('players should crash into the board', () => {
    const state = reduce(initialState, board, bobAdd, bobRight, time(3000), time(90000));
    expect(state.players.bob.status).to.equal(CRASHED);
  });

  it('should not move crashed players', () => {
    const state = reduce(initialState, board, bobAdd, bobRight, time(3000), time(20000));
    const { bob } = state.players;
    const stateAfterCrash = reduce(state, time(20001));
    const { bob: bob2 } = stateAfterCrash.players;
    expect(bob.x).to.equal(bob2.x);
    expect(bob.y).to.equal(bob2.y);
  });

  it('should crash into the path of other players', () => {
    const state = reduce(initialState, bobAdd, joeAdd, bobRight, joeUp, time(3000), time(4000), joeLeft, time(5000));
    expect(state.players.bob.status).to.equal(CRASHED);
  });

  it('should crash into the head-path of other players', () => {
    const state = reduce(initialState, bobAdd, bobRight, joeAdd, joeUp, time(3000), time(3800), time(4000));
    expect(state.players.bob.status).to.equal(CRASHED);
  });
});
