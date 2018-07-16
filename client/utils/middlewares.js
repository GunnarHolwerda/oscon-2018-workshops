

// eslint-disable-next-line
export const actionTimeStamper = (/* store */) => next => action => next({ ...action, timestamp: Date.now() });
