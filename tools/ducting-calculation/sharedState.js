import { DEFAULTS } from "./constants.js";
import { calculateCavityBalance, calculateMagnetronCooling, calculatePushInlets } from "./calculations.js";

const subscribers = new Set();

export const sharedState = {
  accessGranted: false,
  defaults: { ...DEFAULTS },
  magnetronCooling: calculateMagnetronCooling(DEFAULTS),
  pushInlets: calculatePushInlets(DEFAULTS),
  cavityBalance: calculateCavityBalance(DEFAULTS, calculateMagnetronCooling(DEFAULTS), calculatePushInlets(DEFAULTS))
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

export function updateDefaultValues(patch) {
  sharedState.defaults = {
    ...sharedState.defaults,
    ...patch
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
  sharedState.pushInlets = calculatePushInlets(sharedState.defaults);
  sharedState.cavityBalance = calculateCavityBalance(sharedState.defaults, sharedState.magnetronCooling, sharedState.pushInlets);
}