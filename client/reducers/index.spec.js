/* eslint-env mocha */
import { expect } from 'chai';
import { actions, directions, playerStates } from '../utils/constants.mjs';
import indexReducer, { initialState, START_COUNTDOWN } from './index.mjs';
import reducerFreezer from '../utils/reducerFreezer';
import { pointIsInPolygon } from '../utils/calc.mjs';

const reducer = reducerFreezer(indexReducer);
const reduce = (state, ...actionList) => actionList.reduce(reducer, state);

const {
  BOARD_SET, PLAYER_ADD, PLAYER_DIRECTION, PLAYER_CURRENT, TIME,
} = actions;
const { LEFT, RIGHT, UP } = directions;
const { STARTING, PLAYING, CRASHED } = playerStates;
const SECOND = 1000;

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
  data: { x: 50, y: 50, name: 'bob' },
};

const joeAdd = {
  type: PLAYER_ADD,
  data: { x: 100, y: 60, name: 'joe' },
};

const bobLeft = {
  type: PLAYER_DIRECTION,
  data: { name: 'bob', direction: LEFT },
};

const bobRight = {
  type: PLAYER_DIRECTION,
  data: { name: 'bob', direction: RIGHT },
};

const bobUp = {
  type: PLAYER_DIRECTION,
  data: { name: 'bob', direction: UP },
};

const joeUp = {
  type: PLAYER_DIRECTION,
  data: { name: 'joe', direction: UP },
};

const joeLeft = {
  type: PLAYER_DIRECTION,
  data: { name: 'joe', direction: LEFT },
};

const time = {
  type: TIME,
  data: SECOND / 10,
};

const jumpStart = {
  type: TIME,
  data: START_COUNTDOWN,
};


describe('reducers/index', () => {
  it('initialState should be as expected', () => {
    expect(reducer()).to.deep.equal(initialState);
  });

  describe(BOARD_SET, () => {
    it('should set the board', () => {
      const state = reduce(initialState, board);
      expect(state.obstacles).to.deep.equal(board.data);
      expect(state.minX).to.equal(0);
      expect(state.minY).to.equal(0);
      expect(state.maxX).to.equal(WIDTH);
      expect(state.maxY).to.equal(HEIGHT);
    });
  });

  describe(PLAYER_ADD, () => {
    const state = reduce(initialState, bobAdd);

    it('should add a player', () => {
      expect(state.players.bob.x).to.equal(50);
      expect(state.players.bob.y).to.equal(50);
      // A length-2 array represents x-direction and y-direction
      expect(state.players.bob.direction.length).to.equal(2);
    });

    it('should add a second player', () => {
      const nextState = reduce(state, joeAdd);
      expect(nextState.players.bob.x).to.equal(50);
      expect(nextState.players.bob.y).to.equal(50);
      expect(nextState.players.bob.direction.length).to.equal(2);
      expect(nextState.players.joe.x).to.equal(100);
      expect(nextState.players.joe.y).to.equal(60);
      expect(nextState.players.joe.direction.length).to.equal(2);
      expect(Object.keys(nextState.players).length).to.equal(2);
    });

    it('should not add a pre-existing player', () => {
      const evilBobAdd = {
        type: PLAYER_ADD,
        data: { x: 20, y: 20, name: 'bob' },
      };
      const nextState = reduce(state, bobAdd, evilBobAdd);
      expect(nextState.players.bob.x).to.equal(50);
      expect(nextState.players.bob.y).to.equal(50);
      expect(nextState.players.bob.direction.length).to.equal(2);
      expect(Object.keys(nextState.players).length).to.equal(1);
      expect(nextState).to.deep.equal(state);
    });
  });

  describe(PLAYER_CURRENT, () => {
    it('should claim the current player', () => {
      const bobIsMe = {
        type: PLAYER_CURRENT,
        data: 'bob',
      };
      const state = reduce(initialState, bobAdd, bobIsMe);
      expect(state.currentPlayer).to.equal('bob');
    });
  });

  describe(PLAYER_DIRECTION, () => {
    it("should change a player's direction", () => {
      const state = reduce(initialState, bobAdd, bobLeft);
      expect(state.players.bob.direction).to.equal(LEFT);
    });

    it('should not update on redundant directions', () => {
      const state1 = reduce(initialState, bobAdd, bobLeft);
      const state2 = reduce(state1, bobLeft);
      expect(state2).to.deep.equal(state1);
    });

    it('should not allow a 180º turns', () => {
      const startState = reduce(initialState, bobAdd, bobLeft, jumpStart);
      let state = reduce(startState, bobRight);
      expect(state).to.deep.equal(startState);

      state = reduce(state, bobUp);
      expect(state.players.bob.direction).to.equal(UP);
      state = reduce(state, bobRight);
      // should ignore the last action, because it conflicts with previous direction
      expect(state.players.bob.direction).to.equal(UP);
    });
  });

  describe(TIME, () => {
    it('should increase the timer', () => {
      const state = reduce(initialState, time);
      expect(state.time).to.equal(SECOND / 10);
    });

    it('should not move players before their time', () => {
      const state = reduce(initialState, bobAdd, time);
      const { bob } = state.players;
      expect(bob.status).to.equal(STARTING);
      expect(bob.x).to.equal(50);
      expect(bob.y).to.equal(50);
    });

    it('should start moving players after the countdown', () => {
      const state = reduce(initialState, bobAdd, bobRight, jumpStart);
      const { bob } = state.players;
      expect(bob.status).to.equal(PLAYING);
      expect(bob.y).to.equal(50);
      expect(bob.x).to.be.above(50);
      expect(bob.path).to.deep.equal([[50, 50]]);
    });

    it('should add to the path whenever the direction changes', () => {
      const state = reduce(initialState, bobAdd, bobRight, jumpStart, bobUp, time);
      const { bob } = state.players;
      expect(bob.path.length).to.equal(2);
      expect(bob.path[1][0]).to.equal(50 + (bob.speed * START_COUNTDOWN));
    });

    it('players should crash into the board', () => {
      let state = reduce(initialState, board, bobAdd, bobRight, jumpStart);
      while (pointIsInPolygon(
        [state.players.bob.x, state.players.bob.y],
        state.obstacles[0],
      )) state = reduce(state, time);
      expect(state.players.bob.status).to.equal(CRASHED);
    });

    it('should not move crashed players', () => {
      let state = reduce(initialState, board, bobAdd, bobRight, jumpStart);
      while (pointIsInPolygon(
        [state.players.bob.x, state.players.bob.y],
        state.obstacles[0],
      )) state = reduce(state, time);
      expect(state.players.bob.status).to.equal(CRASHED);

      const stateAfterCrash = reduce(state, time);
      expect(state.players).to.deep.equal(stateAfterCrash.players);
    });

    it('should crash into the path of other players', () => {
      let state = reduce(initialState, bobAdd, bobRight, joeAdd, joeUp);
      while (state.players.joe.y >= state.players.bob.y) state = reduce(state, time);
      const crashPoint = state.players.joe.x;
      state = reduce(state, joeLeft, time);
      while (state.players.bob.x < crashPoint) state = reduce(state, time);
      expect(state.players.bob.status).to.equal(CRASHED);
    });

    it('should crash into the head-path of other players', () => {
      let state = reduce(initialState, bobAdd, bobRight, joeAdd, joeUp);
      const crashPoint = state.players.joe.x;
      while (state.players.bob.x < crashPoint) state = reduce(state, time);
      expect(state.players.bob.status).to.equal(CRASHED);
    });
  });
});
