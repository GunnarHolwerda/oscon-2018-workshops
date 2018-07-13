import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import actions from '../actions/index.mjs';
import { pointIsInPolygon } from '../utils/calc.mjs';
import { playerStates } from '../utils/constants.mjs';

export const PlayerStart = ({ visible = false, crashed = false, onSubmit }) => {
  const textInput = React.createRef();
  const submit = (evt) => {
    evt.preventDefault();
    const name = textInput.current.value;
    if (name) onSubmit(textInput.current.value);
  };
  return (
    <div className="player-start" visible={visible ? 'visible' : null}>
      <form className="player-start__form" onSubmit={submit}>
        <h3>{ crashed ? 'YOU HAVE DIED. Play again?' : 'Enter your name to start playing' }</h3>
        <input ref={textInput} placeholder="or a nickname..." type="text" />
        <button type="submit">Start</button>
      </form>
    </div>
  );
};

PlayerStart.propTypes = {
  visible: PropTypes.bool,
  crashed: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
};

export const select = (state) => {
  const {
    currentPlayer, obstacles, minX, maxX, minY, maxY,
  } = state;
  const player = state.players[currentPlayer];
  const crashed = (player && player.status === playerStates.CRASHED) || (currentPlayer && !player);
  return {
    crashed,
    visible: currentPlayer == null || crashed,
    perimeter: obstacles[0],
    minX,
    maxX,
    minY,
    maxY,
  };
};

export const dispatchers = dispatch => ({
  joinGame: (name, x, y) => {
    dispatch(actions.player.add(name, x, y));
  },
});

const findPointInside = (perimeter, minX, maxX, minY, maxY) => {
  let tries = 0;
  while (tries < 100) {
    tries += 1;
    const point = [
      (Math.random() * (maxX - minX)) + minX,
      (Math.random() * (maxY - minY)) + minY,
    ];
    if (pointIsInPolygon(point, perimeter)) return point;
  }
  throw Error('failed to find a starting point for a new player. Maybe your board doesn\'t have enough area?');
};

export const mergeProps = ({
  visible, crashed, perimeter, minX, maxX, minY, maxY,
}, { joinGame }) => ({
  visible,
  crashed,
  onSubmit: name => joinGame(name, ...(findPointInside(perimeter, minX, maxX, minY, maxY))),
});

export default connect(select, dispatchers, mergeProps)(PlayerStart);
