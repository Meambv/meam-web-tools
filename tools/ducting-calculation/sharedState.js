import { DEFAULTS } from "./constants.js";

const subscribers = new Set();

export const sharedState = {
  accessGranted: false,
  defaults: { ...DEFAULTS }
};

export function updateSharedState(patch) {
  Object.assign(sharedState, patch);
  notifySubscribers();
}

export function subscribeToSharedState(callback) {
  subscribers.add(callback);
  callback(sharedState);

  return () => subscribers.delete(callback);
}

function notifySubscribers() {
  subscribers.forEach((callback) => callback(sharedState));
}