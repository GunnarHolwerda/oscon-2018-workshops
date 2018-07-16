/* eslint-env mocha */
import { expect } from 'chai';
import actions from './index.mjs';

const { board, player, time } = actions;

const simpleBoard = [[
  [0, 0], [50, 0], [50, 50], [0, 0],
]];

describe('actions', () => {
  describe('board', () => {
    describe('load()', () => {
      it('works with a simple boundary', () => {
        expect(board.load(simpleBoard)).to.deep.equal({ type: 'BOARD_SET', data: simpleBoard });
      });

      it('rejects unless provided with an array of arrays of arrays', () => {
        expect(() => board.load('garbage')).to.throw(/must be an array/);
        expect(() => board.load([3, 2])).to.throw(/array of arrays/);
        expect(() => board.load([[3, 2]])).to.throw(/array of arrays of arrays/);
      });

      it('rejects unless deepest arrays are numeric', () => {
        expect(() => board.load([[['garbage']]])).to.throw(/numeric/);
      });

      it('rejects unless deepest arrays are 2D points', () => {
        expect(() => board.load([[[3]]])).to.throw(/point.*length.*2/i);
        expect(() => board.load([[[3, 2, 1]]])).to.throw(/point.*length.*2/i);
      });

      it('rejects unless all polylines have at least 2-points', () => {
        expect(() => board.load([[[3, 2]]])).to.throw(/at least.*2.*points/);
      });

      it('rejects unless boundary has at least 3 points', () => {
        expect(() => board.load([[[3, 2], [1, 0]]])).to.throw(/boundary.*at least.*3.*points/i);
      });

      it('rejects unless boundary is self-closing', () => {
        expect(() => board.load([[[3, 2], [1, 0], [3, 3]]])).to.throw(/boundary.*self.*closing/i);
      });
    });
  });

  describe('player', () => {
    describe('add()', () => {
      it('works with simple numbers', () => {
        expect(player.add('matt', 20, 15)).to.deep.equal({
          type: 'PLAYER_ADD',
          player: 'matt',
          data: { x: 20, y: 15 },
        });
        expect(player.add('matt', 0, 0)).to.deep.equal({
          type: 'PLAYER_ADD',
          player: 'matt',
          data: { x: 0, y: 0 },
        });
      });

      it('converts non-numberics', () => {
        expect(player.add('matt', '20', '15')).to.deep.equal({
          type: 'PLAYER_ADD',
          player: 'matt',
          data: { x: 20, y: 15 },
        });
      });

      it('throws garbage', () => {
        expect(() => player.add('matt', 'junk', 3)).to.throw();
        expect(() => player.add('matt', 3, 'junk')).to.throw();
      });

      it('throws nulls and undefineds', () => {
        expect(() => player.add('matt', null, 3)).to.throw();
        expect(() => player.add('matt', undefined, 3)).to.throw();
        expect(() => player.add('matt', 3)).to.throw();
        expect(() => player.add('matt', 3, null)).to.throw();
        expect(() => player.add('matt', 3, undefined)).to.throw();
      });
    });

    it('claim()', () => {
      expect(player.claim('ian')).to.deep.equal({ type: 'PLAYER_CURRENT', data: 'ian' });
    });

    it('up()', () => {
      expect(player.up('ian')).to.deep.equal({ type: 'PLAYER_DIRECTION', player: 'ian', data: [0, -1] });
    });
    it('down()', () => {
      expect(player.down('ian')).to.deep.equal({ type: 'PLAYER_DIRECTION', player: 'ian', data: [0, 1] });
    });
    it('left()', () => {
      expect(player.left('ian')).to.deep.equal({ type: 'PLAYER_DIRECTION', player: 'ian', data: [-1, 0] });
    });
    it('right()', () => {
      expect(player.right('ian')).to.deep.equal({ type: 'PLAYER_DIRECTION', player: 'ian', data: [1, 0] });
    });

    it('crash()', () => {
      expect(player.crash('ian')).to.deep.equal({ type: 'PLAYER_CRASH', player: 'ian' });
    });
  });

  describe('time()', () => {
    it('rejects non-numbers', () => {
      expect(() => time('lame')).to.throw();
      expect(() => time([3, 4])).to.throw();
      expect(() => time({})).to.throw();
      expect(() => time(NaN)).to.throw();
      expect(() => time(Infinity)).to.throw();
    });
    it('rejects falsies', () => {
      expect(() => time(0.0)).to.throw();
      expect(() => time(0)).to.throw();
      expect(() => time(false)).to.throw();
      expect(() => time(undefined)).to.throw();
      expect(() => time(null)).to.throw();
    });
  });
});
