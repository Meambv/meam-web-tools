import { ACCESS_CODE, ACCESS_MESSAGES, ACCESS_STORAGE_KEY } from "./constants.js";
import { sharedState, subscribeToSharedState, updateSharedState } from "./sharedState.js";

const REDIRECT_DELAY_MS = 1200;

const elements = {
  accessStatus: document.querySelector("[data-access-status]"),
  accessMessage: document.querySelector("[data-access-message]"),
  accessSummary: document.querySelector("[data-access-summary]"),
  defaultValues: document.querySelectorAll("[data-default]")
};

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

function renderAccessState(state) {
  const accessText = state.accessGranted ? "Access granted" : "Access denied";

  elements.accessStatus.textContent = accessText;
  elements.accessStatus.classList.toggle("locked", !state.accessGranted);
  elements.accessSummary.textContent = accessText;
  elements.accessMessage.textContent = state.accessGranted ? ACCESS_MESSAGES.granted : ACCESS_MESSAGES.denied;
  elements.accessMessage.classList.toggle("warning", !state.accessGranted);
}

function redirectWithoutAccess() {
  window.setTimeout(() => window.location.replace("/"), REDIRECT_DELAY_MS);
}

function initializeApp() {
  populateDefaults();
  subscribeToSharedState(renderAccessState);

  const accessGranted = hasValidAccess();
  updateSharedState({ accessGranted });

  if (!accessGranted) {
    redirectWithoutAccess();
  }
}

initializeApp();