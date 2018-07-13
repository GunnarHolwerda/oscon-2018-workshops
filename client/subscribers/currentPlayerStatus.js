import subscribeTo from './subscribeTo';
import soundEffect from '../utils/soundEffect';
import { playerStates } from '../utils/constants.mjs';

const crash = soundEffect('crash1.wav', 1);
const starting = soundEffect('countdown1.wav', 1);

const select = (state) => {
  const { currentPlayer, players } = state;
  if (!currentPlayer) return null;
  const player = players[currentPlayer];
  if (!player) return null;
  return player.status;
};

const onChange = (status) => {
  if (status === playerStates.CRASHED) crash();
  if (status === playerStates.STARTING) starting();
};

export default store => subscribeTo(store, select, onChange);
