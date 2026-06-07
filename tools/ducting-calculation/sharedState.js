import { DEFAULTS } from "./constants.js?v=working-defaults";
import { calculateCavityBalance, calculateExtractionControl, calculateMagnetronCooling, calculatePushInlets } from "./calculations.js?v=working-defaults";

const subscribers = new Set();
const STORAGE_KEYS = Object.freeze({
  calculator: "meam:ducting-calculation:state",
  processFan: "meam:ducting-calculation:process-fan"
});

export const sharedState = {
  accessGranted: false,
  defaults: { ...DEFAULTS },
  magnetronCooling: calculateMagnetronCooling(DEFAULTS),
  pushInlets: calculatePushInlets(DEFAULTS),
  cavityBalance: calculateCavityBalance(DEFAULTS, calculateMagnetronCooling(DEFAULTS), calculatePushInlets(DEFAULTS)),
  extractionControl: calculateExtractionControl(DEFAULTS, calculateCavityBalance(DEFAULTS, calculateMagnetronCooling(DEFAULTS), calculatePushInlets(DEFAULTS)))
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

export function saveCalculatorState() {
  localStorage.setItem(STORAGE_KEYS.calculator, JSON.stringify(sharedState.defaults));
}

export function openCalculatorState() {
  const savedState = readSavedObject(STORAGE_KEYS.calculator);

  if (!savedState) {
    return false;
  }

  updateDefaultValues(savedState);
  return true;
}

export function saveProcessFanState() {
  localStorage.setItem(STORAGE_KEYS.processFan, JSON.stringify(getProcessFanState()));
}

export function openProcessFanState() {
  const savedState = readSavedObject(STORAGE_KEYS.processFan);

  if (!savedState) {
    return false;
  }

  updateDefaultValues(getDerivedFanDefaults(savedState));
  return true;
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
  sharedState.extractionControl = calculateExtractionControl(sharedState.defaults, sharedState.cavityBalance);
}

function getProcessFanState() {
  return {
    processFanModel: sharedState.defaults.processFanModel,
    processFanWorkpointAirflowM3h: sharedState.defaults.processFanWorkpointAirflowM3h,
    processFanStaticPressurePa: sharedState.defaults.processFanStaticPressurePa,
    processFanInputPowerKw: sharedState.defaults.processFanInputPowerKw,
    processFanFrequencyHz: sharedState.defaults.processFanFrequencyHz,
    processFanMaxFrequencyHz: sharedState.defaults.processFanMaxFrequencyHz
  };
}

function getDerivedFanDefaults(fanState) {
  const inputPowerKw = Number(fanState.processFanInputPowerKw);
  const airflowM3h = Number(fanState.processFanWorkpointAirflowM3h);

  return {
    ...fanState,
    ...(Number.isFinite(airflowM3h) ? { pushAirflowPerInletM3h: airflowM3h, extractionAirflowPerFanM3h: airflowM3h } : {}),
    ...(Number.isFinite(inputPowerKw) ? {
      pushInletFanPowerW: inputPowerKw * 1000,
      extractionFanPowerW: inputPowerKw * 1000
    } : {})
  };
}

function readSavedObject(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}