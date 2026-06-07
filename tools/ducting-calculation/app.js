import { ACCESS_CODE, ACCESS_MESSAGES, ACCESS_STORAGE_KEY } from "./constants.js";
import { resetDefaults, sharedState, subscribeToSharedState, updateDefaultValue, updateSharedState } from "./sharedState.js";

const REDIRECT_DELAY_MS = 1200;

const elements = {
  accessStatus: document.querySelector("[data-access-status]"),
  accessMessage: document.querySelector("[data-access-message]"),
  accessSummary: document.querySelector("[data-access-summary]"),
  defaultValues: document.querySelectorAll("[data-default]"),
  defaultInputs: document.querySelectorAll("[data-default-input]"),
  resetDefaults: document.querySelector("[data-reset-defaults]"),
  coolingOutputs: document.querySelectorAll("[data-cooling-output]"),
  coolingStatusLine: document.querySelector("[data-cooling-status-line]"),
  coolingStatus: document.querySelector("[data-cooling-status]"),
  coolingWarnings: document.querySelector("[data-cooling-warnings]")
};

const COOLING_STATUS_TEXT = Object.freeze({
  pass: "Below limit",
  warning: "Needs input",
  fail: "Hard fail"
});

function hasValidAccess() {
  return sessionStorage.getItem(ACCESS_STORAGE_KEY) === ACCESS_CODE;
}

function populateDefaults() {
  elements.defaultValues.forEach((element) => {
    const key = element.dataset.default;
    const value = sharedState.defaults[key];

    if (value !== undefined) {
      element.textContent = value;
    }
  });
}

function populateDefaultInputs(forceUpdate = false) {
  elements.defaultInputs.forEach((input) => {
    const key = input.dataset.defaultInput;
    const value = sharedState.defaults[key];

    if (value !== undefined && (forceUpdate || document.activeElement !== input)) {
      input.value = value;
    }
  });
}

function parseInputValue(input) {
  if (input.type === "number") {
    return input.value === "" ? "" : Number(input.value);
  }

  return input.value;
}

function renderAccessState(state) {
  const accessText = state.accessGranted ? "Access granted" : "Access denied";

  elements.accessStatus.textContent = accessText;
  elements.accessStatus.classList.toggle("locked", !state.accessGranted);
  elements.accessSummary.textContent = accessText;
  elements.accessMessage.textContent = state.accessGranted ? ACCESS_MESSAGES.granted : ACCESS_MESSAGES.denied;
  elements.accessMessage.classList.toggle("warning", !state.accessGranted);
}

function renderDefaults() {
  populateDefaults();
  populateDefaultInputs();
}

function renderMagnetronCooling(state) {
  elements.coolingOutputs.forEach((output) => {
    const key = output.dataset.coolingOutput;
    const value = state.magnetronCooling[key];

    if (value !== undefined) {
      output.textContent = formatNumber(value, key);
    }
  });

  elements.coolingStatus.textContent = COOLING_STATUS_TEXT[state.magnetronCooling.status];
  elements.coolingStatusLine.classList.remove("neutral", "pass", "warning", "fail");
  elements.coolingStatusLine.classList.add(state.magnetronCooling.status);
  renderCoolingWarnings(state.magnetronCooling.warnings);
}

function renderCoolingWarnings(warnings) {
  elements.coolingWarnings.replaceChildren();

  warnings.forEach((warning) => {
    const item = document.createElement("li");
    item.className = warning.level;
    item.textContent = warning.message;
    elements.coolingWarnings.append(item);
  });
}

function formatNumber(value, key = "") {
  if (!Number.isFinite(value)) {
    return "0";
  }

  if (key.toLowerCase().includes("freeflow")) {
    return value.toFixed(1);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 100 ? 0 : 1
  }).format(value);
}

function bindDefaultInputs() {
  elements.defaultInputs.forEach((input) => {
    input.addEventListener("input", () => {
      updateDefaultValue(input.dataset.defaultInput, parseInputValue(input));
    });
  });

  elements.resetDefaults.addEventListener("click", () => {
    resetDefaults();
    populateDefaultInputs(true);
  });
}

function redirectWithoutAccess() {
  window.setTimeout(() => window.location.replace("/"), REDIRECT_DELAY_MS);
}

function initializeApp() {
  subscribeToSharedState(renderAccessState);
  subscribeToSharedState(renderDefaults);
  subscribeToSharedState(renderMagnetronCooling);
  bindDefaultInputs();

  const accessGranted = hasValidAccess();
  updateSharedState({ accessGranted });

  if (!accessGranted) {
    redirectWithoutAccess();
  }
}

initializeApp();