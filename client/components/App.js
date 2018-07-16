/* globals window */
import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import Board from './Board';
import Players from './Players';
import PlayerStart from './PlayerStart';
import Scores from './Scores';

export const App = ({
  minX = 0, minY = 0, width = 100, height = 100, x, y, zoomFactor,
}) => {
  const { innerWidth: stageWidth, innerHeight: stageHeight } = window;
  const size = (stageWidth > stageHeight) ? stageHeight : stageWidth;
  const transformX = (0.5 - (x / width)) * size * 2.8 * zoomFactor;
  const transformY = (0.5 - (y / height)) * size * 2.8 * zoomFactor;
  const zoom = 1 + (2 * zoomFactor);
  return (
    <div>
      <svg
        width="100%"
        viewBox={`${minX} ${minY} ${width} ${height}`}
        style={zoomFactor ? { transform: `matrix(${zoom}, 0, 0, ${zoom}, ${transformX}, ${transformY})` } : null}
      >
        <Board />
        <Players />
      </svg>
      <Scores />
      <PlayerStart />
    </div>
  );
};

App.propTypes = {
  minY: PropTypes.number,
  minX: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  zoomFactor: PropTypes.number,
};

export const select = (state) => {
  const {
    minX, minY, maxX, maxY, currentPlayer, time,
  } = state;
  const player = state.players[currentPlayer];
  const {
    x, y, startTime, crashTime, status,
  } = player || { x: 0, y: 0 };

  const age = time - startTime;
  const crashAge = crashTime - time;
  let zoomFactor = 0;
  if (status === 'PLAYING') {
    zoomFactor = 1;
  } else if (age < 0) {
    zoomFactor = (3000 + age) / 3000;
  } else if (status === 'CRASHED') {
    zoomFactor = Math.max((2000 + crashAge) / 2000, 0);
  }

  return {
    minX, minY, width: maxX - minX, height: maxY - minY, x, y, zoomFactor,
  };
};

export default connect(select)(App);
