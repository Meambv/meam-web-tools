import { DEFAULTS } from "./constants.js";
import { calculateMagnetronCooling } from "./calculations.js";

const subscribers = new Set();

export const sharedState = {
  accessGranted: false,
  defaults: { ...DEFAULTS },
  magnetronCooling: calculateMagnetronCooling(DEFAULTS)
};

export function updateSharedState(patch) {
  Object.assign(sharedState, patch);
  notifySubscribers();
}

export function updateDefaultValue(key, value) {
  sharedState.defaults = {
    ...sharedState.defaults,
    [key]: value
  };
  updateCalculatedState();
  notifySubscribers();
}

export function resetDefaults() {
  sharedState.defaults = { ...DEFAULTS };
  updateCalculatedState();
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

function updateCalculatedState() {
  sharedState.magnetronCooling = calculateMagnetronCooling(sharedState.defaults);
}