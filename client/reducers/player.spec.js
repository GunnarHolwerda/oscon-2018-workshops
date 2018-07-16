/* eslint-env mocha */
import { expect } from 'chai';
import { actions, directions, playerStates } from '../utils/constants.mjs';
import playerReducer, { START_COUNTDOWN } from './player.mjs';
import reducerFreezer from '../utils/reducerFreezer';

const { PLAYER_ADD, PLAYER_DIRECTION, PLAYER_START, PLAYER_CRASH } = actions;
const { LEFT, RIGHT, UP } = directions;
const { STARTING, PLAYING, CRASHED } = playerStates;

const dumbParentState = { players: {} };
const reducer = reducerFreezer((state, action) => playerReducer(state, action, dumbParentState));
const reduce = (player, ...actionList) => actionList.reduce(reducer, player);

const bobAdd = {
  type: PLAYER_ADD,
  data: { x: 50, y: 50 },
  timestamp: 0,
};
const bobStart = { type: PLAYER_START, timestamp: 2000 };

const bobLeft = {
  type: PLAYER_DIRECTION,
  data: LEFT,
  timestamp: 4000,
};

const bobRight = {
  type: PLAYER_DIRECTION,
  data: RIGHT,
  timestamp: 0,
};

const bobUp = {
  type: PLAYER_DIRECTION,
  data: UP,
  timestamp: 0,
};

const bobCrash = {
  type: PLAYER_CRASH,
  timestamp: 8000,
};

describe('reducers/player', () => {
  const player = reduce(null, bobAdd);
  describe(PLAYER_ADD, () => {
    it('should add a player', () => {
      expect(player.x).to.equal(undefined);
      expect(player.y).to.equal(undefined);
      // A length-2 array represents x-direction and y-direction
      expect(player.direction.length).to.equal(2);
      expect(player.path).to.deep.equal([[50, 50]]);
      expect(player.status).to.equal(STARTING);
      expect(player.startTime).to.equal(START_COUNTDOWN);
      expect(player.color).to.be.a('string');
    });

    it('should keep the color of a dead player', () => {
      const deadPlayer = { ...player, status: CRASHED, color: 'fancy' };
      const newPlayer = reduce(deadPlayer, bobAdd);
      expect(newPlayer.color).to.equal('fancy');
    });

    it('should do nothing with a good working player', () => {
      const newPlayer = reduce(player, bobAdd);
      expect(newPlayer).to.equal(player);
    });
  });

  describe(PLAYER_START, () => {
    it('should make them PLAYING', () => {
      const subject = reduce(player, bobStart);
      expect(subject.status).to.equal(PLAYING);
      expect(subject.x).to.equal(undefined);
      expect(subject.y).to.equal(undefined);
      expect(subject.path).to.equal(player.path);
      expect(subject.startTime).to.equal(2000);
      expect(subject.lastUpdate).to.equal(2000);
    });
  });

  describe(PLAYER_DIRECTION, () => {
    it('should ignore redundant turns', () => {
      const subject = reduce(player, bobUp);
      expect(subject).to.deep.equal(player);
    });

    it('should allow 180º turns when starting up', () => {
      const subject = reduce(player, bobLeft, bobRight);
      expect(subject.direction).to.equal(RIGHT);
    });

    it('should not allow 180º turns when playing', () => {
      const subject = reduce(player, bobLeft, bobStart, bobRight);
      expect(subject.direction).to.equal(LEFT);
    });

    it('should append motion to the path when playing', () => {
      const subject = reduce(player, bobStart, bobLeft);
      expect(subject.path.length).to.equal(2);
      expect(subject.x).to.equal(undefined);
      expect(subject.y).to.equal(undefined);
      const [x, y] = subject.path[1];
      expect(x).to.equal(50);
      expect(y).below(50);
    });

    it('should do nothing when crashed', () => {
      const bob = reduce(player, bobStart, bobCrash);
      const subject = reduce(bob, bobLeft);
      expect(subject).to.equal(bob);
    });
  });

  describe(PLAYER_CRASH, () => {
    it('should set the player status', () => {
      const subject = reduce(player, bobStart, bobCrash);
      expect(subject.status).to.equal(CRASHED);
    });

    it('should move the player', () => {
      const subject = reduce(player, bobStart, bobCrash);
      expect(subject.path.length).to.equal(2);
      expect(subject.x).to.equal(undefined);
      expect(subject.y).to.equal(undefined);
      const [x, y] = subject.path[1];
      expect(x).to.equal(50);
      expect(y).below(50);
    });

    it('should do nothing if still starting', () => {
      const subject = reduce(player, bobCrash);
      expect(subject.status).to.equal(STARTING);
    });

    it('should do nothing if already crashed', () => {
      const bob = reduce(player, bobStart, bobCrash);
      const subject = reduce(bob, bobCrash);
      expect(subject).to.equal(bob);
    });
  });
});
