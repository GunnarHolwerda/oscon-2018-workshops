/* eslint-env mocha */
import { expect, shallow, React } from '../utils/testComponent';

import { Board, select } from './Board';
import reducer from '../reducers/index.mjs';
import actions from '../actions/index.mjs';

describe('Board', () => {
  const board = [
    [[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]],
    [[20, 20], [80, 80]],
  ];

  describe('component', () => {
    it('renders without crashing', () => {
      const subject = shallow(<Board />);
      expect(subject.find('g')).to.have.length(1);
    });

    it('renders all the polylines', () => {
      const subject = shallow(<Board obstacles={board} />);
      const polylines = subject.find('Polyline');
      expect(polylines).to.have.length(2);
      expect(polylines.first().prop('points')).to.equal(board[0]);
      expect(polylines.last().prop('points')).to.equal(board[1]);
    });
  });

  describe('selector', () => {
    it('gets the board', () => {
      const action = actions.board.load(board);
      const state = reducer(reducer(), action);
      expect(select(state).obstacles).to.deep.equal(board);
    });
  });
});
