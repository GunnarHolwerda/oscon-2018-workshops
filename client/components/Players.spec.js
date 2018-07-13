/* eslint-env mocha */
import { expect, shallow, React } from '../utils/testComponent';

import { Players, select } from './Players';
import reducer from '../reducers/index.mjs';
import actions from '../actions/index.mjs';

describe('Players', () => {
  describe('component', () => {
    it('works', () => {
      shallow(<Players names={[]} />);
    });
  });

  describe('selector', () => {
    it('gets the players', () => {
      let state = reducer();
      expect(select(state).names).to.deep.equal([]);
      state = reducer(state, actions.player.add('bob', 50, 50));
      expect(select(state).names).to.deep.equal(['bob']);
    });
  });
});
