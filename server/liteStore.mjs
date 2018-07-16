const createStore = (reducer) => {
  let state = reducer();
  const dispatch = (action) => {
    state = reducer(state, action);
  };
  const getState = () => state;

  return { dispatch, getState };
};

export default createStore;
