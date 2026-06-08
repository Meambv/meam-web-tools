import { ACCESS_CODE, ACCESS_MESSAGES, ACCESS_STORAGE_KEY } from "./constants.js?v=working-defaults";
import { addDuctChildNode, openCalculatorState, openProcessFanState, removeDuctNode, resetDefaults, saveCalculatorState, saveProcessFanState, sharedState, subscribeToSharedState, toggleDuctNode, updateDefaultValue, updateDefaultValues, updateDuctNode, updateSharedState } from "./sharedState.js?v=working-defaults";

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
  flowDeltaRow: document.querySelector("[data-flow-delta-row]"),
  extractionOutputs: document.querySelectorAll("[data-extraction-output]"),
  extractionStatusLine: document.querySelector("[data-extraction-status-line]"),
  extractionStatus: document.querySelector("[data-extraction-status]"),
  extractionWarnings: document.querySelector("[data-extraction-warnings]"),
  extractionMarginRow: document.querySelector("[data-extraction-margin-row]"),
  extractionFrequencyRow: document.querySelector("[data-extraction-frequency-row]"),
  hxOutputs: document.querySelectorAll("[data-hx-output]"),
  hxWarnings: document.querySelector("[data-hx-warnings]"),
  ductOutputs: document.querySelectorAll("[data-duct-output]"),
  pushTreeHost: document.querySelector('[data-duct-tree="push"]'),
  extractionTreeHost: document.querySelector('[data-duct-tree="extraction"]'),
  ductExpandButtons: document.querySelectorAll("[data-duct-expand]"),
  ductCollapseButtons: document.querySelectorAll("[data-duct-collapse]"),
  summaryOutputs: document.querySelectorAll("[data-summary-output]"),
  summaryExtractionMarginRow: document.querySelector("[data-summary-extraction-margin-row]"),
  summaryOverallRow: document.querySelector("[data-summary-overall-row]")
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
  elements.flowDeltaRow.classList.toggle("over-target", state.cavityBalance.pushMagnetronFlowDeltaM3h > 0);
  renderWarningList(elements.cavityWarnings, state.cavityBalance.warnings);
}

function renderExtractionControl(state) {
  elements.extractionOutputs.forEach((output) => {
    const key = output.dataset.extractionOutput;
    const value = state.extractionControl[key];

    if (value !== undefined) {
      output.textContent = formatNumber(value, key);
    }
  });

  elements.extractionStatus.textContent = SIMPLE_STATUS_TEXT[state.extractionControl.status];
  elements.extractionStatusLine.classList.remove("neutral", "pass", "warning", "fail");
  elements.extractionStatusLine.classList.add(state.extractionControl.status);
  elements.extractionMarginRow.classList.toggle("over-target", state.extractionControl.extractionCapacityMarginM3h < 0);
  elements.extractionFrequencyRow.classList.toggle("over-target", state.extractionControl.indicativeExtractionFrequencyHz > state.defaults.processFanFrequencyHz);
  renderWarningList(elements.extractionWarnings, state.extractionControl.warnings);
}

function renderOverallSummary(state) {
  const summary = buildOverallSummary(state);

  elements.summaryOutputs.forEach((output) => {
    const key = output.dataset.summaryOutput;
    const value = summary[key];

    if (value !== undefined) {
      output.textContent = typeof value === "string" ? value : formatNumber(value, key);
    }
  });

  elements.summaryExtractionMarginRow.classList.toggle("over-target", summary.extractionCapacityMarginM3h < 0);
  elements.summaryOverallRow.classList.remove("pass", "warning", "fail");
  elements.summaryOverallRow.classList.add(summary.overallStatusLevel);
}

function renderHeatExchangerControl(state) {
  elements.hxOutputs.forEach((output) => {
    const key = output.dataset.hxOutput;
    const value = state.heatExchangerControl[key];

    if (value !== undefined) {
      output.textContent = typeof value === "string" ? value : formatNumber(value, key);
    }
  });

  renderWarningList(elements.hxWarnings, state.heatExchangerControl.warnings);
}

function renderDuctTree(state) {
  const summary = buildDuctSummary(state.ductTreeNodes);

  elements.ductOutputs.forEach((output) => {
    const key = output.dataset.ductOutput;
    const value = summary[key];

    if (value !== undefined) {
      output.textContent = typeof value === "string" ? value : formatNumber(value, key);
    }
  });

  renderTreeSide(elements.pushTreeHost, state.ductTreeNodes, "push");
  renderTreeSide(elements.extractionTreeHost, state.ductTreeNodes, "extraction");
}

function buildDuctSummary(nodes) {
  const pushRoots = nodes.filter((node) => node.parentId === null && node.kind === "push");
  const extractionRoots = nodes.filter((node) => node.parentId === null && node.kind === "extraction");
  const pushTotalLengthM = nodes
    .filter((node) => node.kind === "push")
    .reduce((sum, node) => sum + toValidLength(node.lengthM), 0);
  const extractionTotalLengthM = nodes
    .filter((node) => node.kind === "extraction")
    .reduce((sum, node) => sum + toValidLength(node.lengthM), 0);

  return {
    pushRootCount: pushRoots.length,
    extractionRootCount: extractionRoots.length,
    pushTotalLengthM,
    extractionTotalLengthM
  };
}

function renderTreeSide(container, nodes, kind) {
  if (!container) {
    return;
  }

  container.replaceChildren();
  const rootNodes = nodes.filter((node) => node.parentId === null && node.kind === kind);
  const list = document.createElement("ul");
  list.className = "duct-tree-list";

  rootNodes.forEach((rootNode) => {
    list.append(createTreeNodeElement(rootNode, nodes));
  });

  container.append(list);
}

function createTreeNodeElement(node, allNodes) {
  const item = document.createElement("li");
  item.className = "duct-tree-node";

  const row = document.createElement("div");
  row.className = "duct-tree-row";

  const children = allNodes.filter((candidate) => candidate.parentId === node.id);
  const hasChildren = children.length > 0;

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className = "tree-node-button";
  toggleButton.textContent = hasChildren ? (node.collapsed ? "+" : "-") : "•";
  toggleButton.disabled = !hasChildren;
  toggleButton.addEventListener("click", () => toggleDuctNode(node.id));
  row.append(toggleButton);

  const nameInput = document.createElement("input");
  nameInput.className = "tree-node-name";
  nameInput.type = "text";
  nameInput.value = node.name;
  nameInput.addEventListener("input", () => updateDuctNode(node.id, { name: nameInput.value }));
  row.append(nameInput);

  const lengthInput = document.createElement("input");
  lengthInput.className = "tree-node-length";
  lengthInput.type = "number";
  lengthInput.min = "0";
  lengthInput.step = "0.1";
  lengthInput.value = toValidLength(node.lengthM).toString();
  lengthInput.addEventListener("input", () => updateDuctNode(node.id, { lengthM: Number(lengthInput.value) }));
  row.append(lengthInput);

  const lengthUnit = document.createElement("span");
  lengthUnit.className = "tree-node-unit";
  lengthUnit.textContent = "m";
  row.append(lengthUnit);

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "tree-node-action";
  addButton.textContent = "+ child";
  addButton.addEventListener("click", () => addDuctChildNode(node.id));
  row.append(addButton);

  if (node.parentId !== null) {
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "tree-node-action remove";
    removeButton.textContent = "Delete";
    removeButton.addEventListener("click", () => removeDuctNode(node.id));
    row.append(removeButton);
  }

  item.append(row);

  if (hasChildren && !node.collapsed) {
    const childList = document.createElement("ul");
    childList.className = "duct-tree-list";
    children.forEach((childNode) => {
      childList.append(createTreeNodeElement(childNode, allNodes));
    });
    item.append(childList);
  }

  return item;
}

function toValidLength(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function buildOverallSummary(state) {
  const statuses = [
    state.magnetronCooling.status,
    state.pushInlets.status,
    state.cavityBalance.status,
    state.extractionControl.status
  ];
  const overallStatusLevel = statuses.includes("fail") ? "fail" : statuses.includes("warning") ? "warning" : "pass";

  return {
    requiredPushAirflowM3h: state.cavityBalance.requiredPushAirflowM3h,
    magnetronAirflowM3h: state.cavityBalance.magnetronAirflowM3h,
    serialCavityAirflowM3h: state.cavityBalance.serialCavityAirflowM3h,
    correctedWetAirVolumeFlowM3h: state.extractionControl.correctedWetAirVolumeFlowM3h,
    extractionCapacityMarginM3h: state.extractionControl.extractionCapacityMarginM3h,
    outletTemperatureC: state.magnetronCooling.outletTemperatureC,
    targetCavityPressurePa: state.cavityBalance.targetCavityPressurePa,
    overallStatus: SIMPLE_STATUS_TEXT[overallStatusLevel],
    overallStatusLevel
  };
}

function renderCoolingWarnings(warnings) {
  renderWarningList(elements.coolingWarnings, warnings);
}

function renderWarningList(list, warnings) {
  if (!list) {
    return;
  }

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

  if (key.toLowerCase().includes("factor")) {
    return value.toFixed(2);
  }

  if (key.endsWith("M2") || key.endsWith("M3") || key.endsWith("Ms") || key.endsWith("Hz")) {
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
          pushAirflowPerInletM3h: value,
          extractionAirflowPerFanM3h: value
        });
        return;
      }

      if (key === "processFanStaticPressurePa") {
        updateDefaultValue(key, value);
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

function bindDuctTreeButtons() {
  elements.ductExpandButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const kind = button.dataset.ductExpand;
      setTreeCollapsed(kind, false);
    });
  });

  elements.ductCollapseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const kind = button.dataset.ductCollapse;
      setTreeCollapsed(kind, true);
    });
  });
}

function setTreeCollapsed(kind, collapsed) {
  const patch = sharedState.ductTreeNodes.map((node) => {
    if (node.kind !== kind) {
      return node;
    }

    return {
      ...node,
      collapsed
    };
  });

  updateSharedState({ ductTreeNodes: patch });
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
  subscribeToSharedState(renderExtractionControl);
  subscribeToSharedState(renderHeatExchangerControl);
  subscribeToSharedState(renderDuctTree);
  subscribeToSharedState(renderOverallSummary);
  bindDefaultInputs();
  bindStorageButtons();
  bindDuctTreeButtons();

  const accessGranted = hasValidAccess();
  updateSharedState({ accessGranted });

  if (!accessGranted) {
    redirectWithoutAccess();
  }
}

initializeApp();