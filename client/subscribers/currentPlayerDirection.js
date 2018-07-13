import subscribeTo from './subscribeTo';
import soundEffect from '../utils/soundEffect';
import { playerStates } from '../utils/constants.mjs';

const sound = soundEffect('turn1.wav');

const select = (state) => {
  const { currentPlayer, players } = state;
  if (!currentPlayer) return null;
  const player = players[currentPlayer];
  if (!player || player.status !== playerStates.PLAYING) return null;
  return player.direction;
};

const onChange = (current, prev) => {
  if (current && prev) sound();
};

export default store => subscribeTo(store, select, onChange);
