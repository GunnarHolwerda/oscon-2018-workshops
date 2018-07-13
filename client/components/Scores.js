import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';

export const Scores = ({ players = [] }) => (
  <div className="scoreboard">
    <h3>Players</h3>
    { players.map(player => (
      <div className="score-player" key={`score-${player.name}`}>
        <div className="score-player__name">
          <div className="score-player__color" style={{ backgroundColor: player.color }} />
          {player.name}
        </div>
        <div className="score-player__score">{player.score}</div>
      </div>
    ))}
  </div>
);

Scores.propTypes = {
  players: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    score: PropTypes.number,
    color: PropTypes.string,
  })),
};

export const select = state => ({
  players: Object.keys(state.players)
    .map((name) => {
      const { startTime, color, crashTime, path } = state.players[name];
      const age = (crashTime || state.time) - startTime;
      const score = Math.max(Math.round(age / 100), 0) + (path.length * 5);
      return { name, score, color };
    })
    .sort((a, b) => b.score - a.score),
});

export default connect(select)(Scores);
