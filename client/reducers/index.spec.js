/* eslint-env mocha */
import { expect } from 'chai';
import { actions, directions } from '../utils/constants.mjs';
import indexReducer, { initialState } from './index.mjs';
import reducerFreezer from '../utils/reducerFreezer';

const reducer = reducerFreezer(indexReducer);
const reduce = (state, ...actionList) => actionList.reduce(reducer, state);

const { BOARD_SET, PLAYER_ADD, PLAYER_DIRECTION, PLAYER_CURRENT } = actions;
const { LEFT } = directions;

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

const bobLeft = {
  type: PLAYER_DIRECTION,
  data: LEFT,
  player: 'bob',
  timestamp: 0,
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
      expect(state.players.bob.path.length).to.equal(1);
    });

    it('should add a second player', () => {
      const nextState = reduce(state, joeAdd);
      const { bob, joe } = nextState.players;
      expect(bob.path.length).to.equal(1);
      expect(joe.path.length).to.equal(1);
      expect(joe.color).to.not.equal(bob.color);
      expect(Object.keys(nextState.players).length).to.equal(2);
    });

    it('should not add a pre-existing player', () => {
      const evilBobAdd = {
        type: PLAYER_ADD,
        data: { x: 20, y: 20 },
        player: 'bob',
      };
      const nextState = reduce(state, bobAdd, evilBobAdd);
      expect(nextState).to.equal(state);
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
  });
});
