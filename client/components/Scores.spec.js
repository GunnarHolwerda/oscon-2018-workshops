/* eslint-env mocha */
import { expect, shallow, React } from '../utils/testComponent';
import { Scores, select } from './Scores';

describe('Scores', () => {
  describe('component', () => {
    it('works', () => {
      shallow(<Scores />);
    });
  });

  describe('selector', () => {
    it('gets the players list and orders by age', () => {
      const state = {
        time: 2000,
        players: {
          bob: { startTime: 500, crashTime: 1900, color: 'red' },
          joe: { startTime: 1000, color: 'blue' },
          harry: { startTime: 200, color: 'green' },
          moe: { startTime: 3000, color: 'orange' },
        },
      };

      expect(select(state)).to.deep.equal({
        players: [
          { name: 'harry', score: 18, color: 'green' },
          { name: 'bob', score: 14, color: 'red' },
          { name: 'joe', score: 10, color: 'blue' },
          { name: 'moe', score: 0, color: 'orange' },
        ],
      });
    });
  });
});
