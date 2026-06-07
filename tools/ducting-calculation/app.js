import { ACCESS_CODE, ACCESS_MESSAGES, ACCESS_STORAGE_KEY } from "./constants.js?v=fan-library";
import { openCalculatorState, openProcessFanState, resetDefaults, saveCalculatorState, saveProcessFanState, sharedState, subscribeToSharedState, updateDefaultValue, updateDefaultValues, updateSharedState } from "./sharedState.js?v=fan-library";

const REDIRECT_DELAY_MS = 1200;

const elements = {
  accessStatus: document.querySelector("[data-access-status]"),
  accessMessage: document.querySelector("[data-access-message]"),
  accessSummary: document.querySelector("[data-access-summary]"),
  saveCalculator: document.querySelector("[data-save-calculator]"),
  openCalculator: document.querySelector("[data-open-calculator]"),
  saveProcessFan: document.querySelector("[data-save-process-fan]"),
  openProcessFan: document.querySelector("[data-open-process-fan]"),
  defaultValues: document.querySelectorAll("[data-default]"),
  defaultInputs: document.querySelectorAll("[data-default-input]"),
  resetDefaults: document.querySelector("[data-reset-defaults]"),
  coolingOutputs: document.querySelectorAll("[data-cooling-output]"),
  coolingStatusLine: document.querySelector("[data-cooling-status-line]"),
  coolingStatus: document.querySelector("[data-cooling-status]"),
  coolingWarnings: document.querySelector("[data-cooling-warnings]"),
  requiredAirflowRow: document.querySelector("[data-required-airflow-row]"),
  pushOutputs: document.querySelectorAll("[data-push-output]"),
  pushStatusLine: document.querySelector("[data-push-status-line]"),
  pushStatus: document.querySelector("[data-push-status]"),
  pushWarnings: document.querySelector("[data-push-warnings]"),
  pushPressureRow: document.querySelector("[data-push-pressure-row]"),
  cavityOutputs: document.querySelectorAll("[data-cavity-output]"),
  cavityStatusLine: document.querySelector("[data-cavity-status-line]"),
  cavityStatus: document.querySelector("[data-cavity-status]"),
  cavityWarnings: document.querySelector("[data-cavity-warnings]"),
  cavityPressureRow: document.querySelector("[data-cavity-pressure-row]"),
  openingAreaRow: document.querySelector("[data-opening-area-row]"),
  flowDeltaRow: document.querySelector("[data-flow-delta-row]")
};

const COOLING_STATUS_TEXT = Object.freeze({
  pass: "Below limit",
  warning: "Check warnings",
  fail: "Hard fail"
});

const SIMPLE_STATUS_TEXT = Object.freeze({
  pass: "OK",
  warning: "Check warnings",
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
  elements.requiredAirflowRow.classList.toggle("over-target", state.magnetronCooling.requiredAirflowPerMagnetronM3h > state.magnetronCooling.targetAirflowPerMagnetronM3h);
  renderCoolingWarnings(state.magnetronCooling.warnings);
}

function renderPushInlets(state) {
  elements.pushOutputs.forEach((output) => {
    const key = output.dataset.pushOutput;
    const value = state.pushInlets[key];

    if (value !== undefined) {
      output.textContent = formatNumber(value, key);
    }
  });

  elements.pushStatus.textContent = SIMPLE_STATUS_TEXT[state.pushInlets.status];
  elements.pushStatusLine.classList.remove("neutral", "pass", "warning", "fail");
  elements.pushStatusLine.classList.add(state.pushInlets.status);
  elements.pushPressureRow.classList.toggle("over-target", state.pushInlets.pushInletDeltaPPa >= 0);
  renderWarningList(elements.pushWarnings, state.pushInlets.warnings);
}

function renderCavityBalance(state) {
  elements.cavityOutputs.forEach((output) => {
    const key = output.dataset.cavityOutput;
    const value = state.cavityBalance[key];

    if (value !== undefined) {
      output.textContent = formatNumber(value, key);
    }
  });

  elements.cavityStatus.textContent = SIMPLE_STATUS_TEXT[state.cavityBalance.status];
  elements.cavityStatusLine.classList.remove("neutral", "pass", "warning", "fail");
  elements.cavityStatusLine.classList.add(state.cavityBalance.status);
  elements.cavityPressureRow.classList.toggle("over-target", state.cavityBalance.targetCavityPressurePa >= 0);
  elements.openingAreaRow.classList.toggle("over-target", state.cavityBalance.requiredOpeningAreaM2 > 0 && state.cavityBalance.magnetronAirOpeningAreaM2 < state.cavityBalance.requiredOpeningAreaM2);
  elements.flowDeltaRow.classList.toggle("over-target", state.cavityBalance.pushMagnetronFlowDeltaM3h < 0);
  renderWarningList(elements.cavityWarnings, state.cavityBalance.warnings);
}

function renderCoolingWarnings(warnings) {
  renderWarningList(elements.coolingWarnings, warnings);
}

function renderWarningList(list, warnings) {
  list.replaceChildren();

  warnings.forEach((warning) => {
    const item = document.createElement("li");
    item.className = warning.level;
    item.textContent = warning.message;
    list.append(item);
  });
}

function formatNumber(value, key = "") {
  if (!Number.isFinite(value)) {
    return "0";
  }

  if (key.toLowerCase().includes("freeflow")) {
    return value.toFixed(1);
  }

  if (key.endsWith("M2") || key.endsWith("M3") || key.endsWith("Ms")) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 100 ? 0 : 1
  }).format(value);
}

function bindDefaultInputs() {
  elements.defaultInputs.forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.defaultInput;
      const value = parseInputValue(input);

      if (key === "processFanWorkpointAirflowM3h") {
        updateDefaultValues({
          processFanWorkpointAirflowM3h: value,
          pushAirflowPerInletM3h: value
        });
        return;
      }

      if (key === "processFanInputPowerKw") {
        updateDefaultValues({
          processFanInputPowerKw: value,
          pushInletFanPowerW: value * 1000,
          extractionFanPowerW: value * 1000
        });
        return;
      }

      updateDefaultValue(key, value);
    });
  });

  elements.resetDefaults.addEventListener("click", () => {
    resetDefaults();
    populateDefaultInputs(true);
  });
}

function bindStorageButtons() {
  elements.saveCalculator.addEventListener("click", () => {
    saveCalculatorState();
    setAccessMessage("Calculator state saved in this browser.");
  });

  elements.openCalculator.addEventListener("click", () => {
    const opened = openCalculatorState();
    if (opened) {
      populateDefaultInputs(true);
    }
    setAccessMessage(opened ? "Calculator state opened from this browser." : "No saved calculator state found.", !opened);
  });

  elements.saveProcessFan.addEventListener("click", () => {
    saveProcessFanState();
    setAccessMessage("Process fan data saved in this browser.");
  });

  elements.openProcessFan.addEventListener("click", () => {
    const opened = openProcessFanState();
    if (opened) {
      populateDefaultInputs(true);
    }
    setAccessMessage(opened ? "Process fan data opened from this browser." : "No saved process fan data found.", !opened);
  });
}

function setAccessMessage(message, isWarning = false) {
  elements.accessMessage.textContent = message;
  elements.accessMessage.classList.toggle("warning", isWarning);
}

function redirectWithoutAccess() {
  window.setTimeout(() => window.location.replace("/"), REDIRECT_DELAY_MS);
}

function initializeApp() {
  subscribeToSharedState(renderAccessState);
  subscribeToSharedState(renderDefaults);
  subscribeToSharedState(renderMagnetronCooling);
  subscribeToSharedState(renderPushInlets);
  subscribeToSharedState(renderCavityBalance);
  bindDefaultInputs();
  bindStorageButtons();

  const accessGranted = hasValidAccess();
  updateSharedState({ accessGranted });

  if (!accessGranted) {
    redirectWithoutAccess();
  }
}

initializeApp();