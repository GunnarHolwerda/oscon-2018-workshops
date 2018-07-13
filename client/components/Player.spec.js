/* eslint-env mocha */
import { expect, shallow, React } from '../utils/testComponent';

import { Player, select } from './Player';
import reducer from '../reducers/index.mjs';
import actions from '../actions/index.mjs';

describe('Player', () => {
  describe('component', () => {
    it('works', () => {
      shallow(<Player name="bob" color="yellow" x={50} y={50} path={[]} angle={0} timeToStart={3} status="STARTING" />);
    });
  });

  describe('selector', () => {
    it('gets the player', () => {
      let state = reducer();
      state = reducer(state, actions.player.add('bob', 50, 50));
      expect(select(state, { name: 'bob' })).to.deep.equal({
        angle: 0,
        color: 'yellow',
        path: [],
        status: 'STARTING',
        timeToStart: 3,
        x: 50,
        y: 50,
      });
    });
  });
});
