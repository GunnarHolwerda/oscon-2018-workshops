/* eslint-env mocha */
import { expect, shallow, React } from '../utils/testComponent';

import { PlayerStart, select, dispatchers, mergeProps } from './PlayerStart';
import reducer from '../reducers/index.mjs';
import actions from '../actions/index.mjs';
import { actions as actionTypes } from '../utils/constants.mjs';

const { PLAYER_ADD } = actionTypes;
const perimeter = [[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]];

describe('PlayerStart', () => {
  describe('component', () => {
    it('shows with the visible Attribute', () => {
      const subject = shallow(<PlayerStart visible onSubmit={x => x} />);
      expect(subject.props().visible).to.equal('visible');
    });

    it('does not show without the visible Attribute', () => {
      const subject = shallow(<PlayerStart onSubmit={x => x} />);
      expect(subject.props().visible).to.equal(null);
    });

    it('shows a "crashed" message when crashed', () => {
      const subject = shallow(<PlayerStart visible crashed onSubmit={x => x} />);
      expect(subject.find('h3').text().toLowerCase().includes('die')).to.equal(true);
    });
  });

  describe('selector', () => {
    it('returns visible=true when there is not a current player', () => {
      const state = reducer(reducer(), actions.board.load([perimeter]));
      expect(select(state).visible).to.equal(true);
      expect(select(state).perimeter).to.deep.equal(perimeter);
    });

    it('returns visible=true when there is a current crashed player', () => {
      let state = reducer(reducer(), actions.board.load([perimeter]));
      state = reducer(state, actions.player.add('ian', 50, 50));
      state = reducer(state, actions.player.claim('ian'));
      state = reducer(state, actions.time(2900));
      state = reducer(state, actions.time(1000));
      expect(select(state).visible).to.equal(true);
      expect(select(state).crashed).to.equal(true);
    });

    it('returns visible=true when there WAS a current player, but not anymore', () => {
      let state = reducer(reducer(), actions.board.load([perimeter]));
      state = reducer(state, actions.player.add('ian', 50, 50));
      state = reducer(state, actions.player.claim('ian'));
      state = reducer(state, actions.time(2900));
      state = reducer(state, actions.time(1000));
      state = reducer(state, actions.time(4000));
      expect(select(state).visible).to.equal(true);
      expect(select(state).crashed).to.equal(true);
    });

    it('returns visible=false when there is a current player', () => {
      let state = reducer(reducer(), actions.player.add('ian', 50, 50));
      state = reducer(state, actions.board.load([perimeter]));
      state = reducer(state, actions.player.claim('ian'));
      expect(select(state).visible).to.equal(false);
      expect(select(state).perimeter).to.deep.equal(perimeter);
    });
  });

  describe('dispatcher', () => {
    it('dispatches a player-add', () => {
      const dispatches = [];
      const dispatch = action => dispatches.push(action);
      dispatchers(dispatch).joinGame('bob', 50, 50);
      expect(dispatches).to.deep.equal([
        { type: PLAYER_ADD, data: { name: 'bob', x: 50, y: 50 } },
        // { type: PLAYER_CURRENT, data: 'bob' },
      ]);
    });
  });

  describe('mergeProps', () => {
    it('merges as expected', () => {
      const stateProps = {
        visible: true,
        perimeter,
        minX: 0,
        maxX: 10,
        minY: 0,
        maxY: 10,
      };
      let callArgs;
      const dispatch = (...args) => { callArgs = args; };
      const subject = mergeProps(stateProps, { joinGame: dispatch });
      expect(subject.visible).to.equal(true);
      const { onSubmit } = subject;
      onSubmit('dave');
      const [dave, x, y] = callArgs;
      expect(dave).to.equal('dave');
      expect(x).to.be.below(10);
      expect(y).to.be.below(10);
    });
  });
});
