import freeze from 'deep-freeze';

export default function freezeReducer(reducer) {
  return (state, action) => {
    if (state) freeze(state);
    if (action) freeze(action);
    return reducer(state, action);
  };
}
