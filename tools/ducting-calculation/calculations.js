const SECONDS_PER_HOUR = 3600;
export function calculateMagnetronCooling(defaults) {
  const magnetronCount = positiveNumber(defaults.magnetronCount);
  const fansPerMagnetron = positiveNumber(defaults.fansPerMagnetron);
  const systemPowerKw = positiveNumber(defaults.systemPowerKw);
  const heatLoadKw = positiveNumber(defaults.heatLoadKw);
  const calculationMode = defaults.calculationMode === "sizeRequired" ? "sizeRequired" : "validateTarget";
  const targetAirflowPerMagnetronM3h = positiveNumber(defaults.targetAirflowPerMagnetronM3h);
  const ambientTemperatureC = numberOrZero(defaults.ambientTemperatureC);
  const maxOutletTemperatureC = numberOrZero(defaults.maxOutletTemperatureC);
  const airDensityKgM3 = positiveNumber(defaults.airDensityKgM3);
  const airHeatCapacityKjKgK = positiveNumber(defaults.airHeatCapacityKjKgK);
  const fanFreeflowM3h = positiveNumber(defaults.fanFreeflowM3h);
  const fanPowerW = positiveNumber(defaults.fanPowerW);

  const allowableDeltaTC = maxOutletTemperatureC - ambientTemperatureC;
  const totalFanPowerKw = (magnetronCount * fansPerMagnetron * fanPowerW) / 1000;
  const totalTargetAirflowM3h = magnetronCount * targetAirflowPerMagnetronM3h;
  const heatLoadPerMagnetronKw = magnetronCount > 0 ? heatLoadKw / magnetronCount : 0;
  const targetOutletDeltaTC = calculateDeltaT(heatLoadKw, totalTargetAirflowM3h, airDensityKgM3, airHeatCapacityKjKgK);
  const targetOutletTemperatureC = ambientTemperatureC + targetOutletDeltaTC;
  const requiredTotalAirflowM3h = calculateRequiredAirflow(heatLoadKw, allowableDeltaTC, airDensityKgM3, airHeatCapacityKjKgK);
  const requiredAirflowPerMagnetronM3h = magnetronCount > 0 ? requiredTotalAirflowM3h / magnetronCount : 0;
  const activeAirflowPerMagnetronM3h = calculationMode === "sizeRequired" && requiredAirflowPerMagnetronM3h > 0
    ? requiredAirflowPerMagnetronM3h
    : targetAirflowPerMagnetronM3h;
  const activeTotalAirflowM3h = magnetronCount * activeAirflowPerMagnetronM3h;
  const outletDeltaTC = calculateDeltaT(heatLoadKw, activeTotalAirflowM3h, airDensityKgM3, airHeatCapacityKjKgK);
  const outletTemperatureC = ambientTemperatureC + outletDeltaTC;

  const warnings = buildCoolingWarnings({
    allowableDeltaTC,
    calculationMode,
    heatLoadKw,
    maxOutletTemperatureC,
    outletTemperatureC,
    targetOutletTemperatureC,
    requiredAirflowPerMagnetronM3h,
    targetAirflowPerMagnetronM3h,
    measuredMin: defaults.measuredFanAirflowMinM3h,
    measuredMax: defaults.measuredFanAirflowMaxM3h
  });

  return {
    magnetronCount,
    fansPerMagnetron,
    systemPowerKw,
    heatLoadKw,
    calculationMode,
    targetAirflowPerMagnetronM3h,
    totalTargetAirflowM3h,
    activeAirflowPerMagnetronM3h,
    activeTotalAirflowM3h,
    heatLoadPerMagnetronKw,
    allowableDeltaTC,
    outletDeltaTC,
    outletTemperatureC,
    requiredTotalAirflowM3h,
    requiredAirflowPerMagnetronM3h,
    fanFreeflowM3h,
    totalFanPowerKw,
    status: getCoolingStatus(warnings),
    warnings
  };
}

function calculateDeltaT(heatLoadKw, airflowM3h, airDensityKgM3, airHeatCapacityKjKgK) {
  if (heatLoadKw <= 0 || airflowM3h <= 0 || airDensityKgM3 <= 0 || airHeatCapacityKjKgK <= 0) {
    return 0;
  }

  const airflowM3s = airflowM3h / SECONDS_PER_HOUR;
  return heatLoadKw / (airDensityKgM3 * airHeatCapacityKjKgK * airflowM3s);
}

function calculateRequiredAirflow(heatLoadKw, allowableDeltaTC, airDensityKgM3, airHeatCapacityKjKgK) {
  if (heatLoadKw <= 0 || allowableDeltaTC <= 0 || airDensityKgM3 <= 0 || airHeatCapacityKjKgK <= 0) {
    return 0;
  }

  return (heatLoadKw / (airDensityKgM3 * airHeatCapacityKjKgK * allowableDeltaTC)) * SECONDS_PER_HOUR;
}

function buildCoolingWarnings(values) {
  const warnings = [];

  if (values.heatLoadKw <= 0) {
    warnings.push({ level: "warning", message: "Enter the heat load removed by magnetron cooling air." });
  }

  if (values.allowableDeltaTC <= 0) {
    warnings.push({ level: "fail", message: "Outlet temperature limit must be higher than ambient temperature." });
  }

  if (values.calculationMode === "validateTarget" && values.outletTemperatureC >= values.maxOutletTemperatureC && values.heatLoadKw > 0) {
    warnings.push({ level: "fail", message: "Magnetron outlet air is at or above the temperature limit." });
  }

  if (values.targetAirflowPerMagnetronM3h < values.measuredMin || values.targetAirflowPerMagnetronM3h > values.measuredMax) {
    warnings.push({ level: "warning", message: `Target airflow per magnetron is outside the measured ${values.measuredMin} to ${values.measuredMax} m3/h range.` });
  }

  if (values.requiredAirflowPerMagnetronM3h > values.measuredMax) {
    warnings.push({ level: "warning", message: "Required airflow per magnetron is above the measured fan range." });
  }

  if (values.calculationMode === "sizeRequired" && values.requiredAirflowPerMagnetronM3h > values.targetAirflowPerMagnetronM3h) {
    warnings.push({ level: "warning", message: "Required airflow per magnetron is above the entered target airflow." });
  }

  return warnings;
}

function getCoolingStatus(warnings) {
  if (warnings.some((warning) => warning.level === "fail")) {
    return "fail";
  }

  if (warnings.length > 0) {
    return "warning";
  }

  return "pass";
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function calculatePushInlets(defaults) {
  const pushInletCount = positiveNumber(defaults.pushInletCount);
  const pushAirflowPerInletM3h = positiveNumber(defaults.pushAirflowPerInletM3h);
  const pushInletFanPowerW = positiveNumber(defaults.pushInletFanPowerW);
  const pushInletTemperatureC = numberOrZero(defaults.pushInletTemperatureC);
  const pushInletDeltaPPa = numberOrZero(defaults.pushInletDeltaPPa);
  const totalPushAirflowM3h = pushInletCount * pushAirflowPerInletM3h;
  const totalPushFanPowerKw = (pushInletCount * pushInletFanPowerW) / 1000;
  const warnings = [];

  if (pushInletCount <= 0) {
    warnings.push({ level: "warning", message: "Enter the number of push inlets." });
  }

  if (pushAirflowPerInletM3h <= 0) {
    warnings.push({ level: "warning", message: "Enter the airflow per push inlet." });
  }

  if (pushInletDeltaPPa >= 0) {
    warnings.push({ level: "warning", message: "Pressure after push inlets should stay below ambient." });
  }

  return {
    pushInletCount,
    pushAirflowPerInletM3h,
    pushInletFanPowerW,
    pushInletTemperatureC,
    pushInletDeltaPPa,
    totalPushAirflowM3h,
    totalPushFanPowerKw,
    status: warnings.length > 0 ? "warning" : "pass",
    warnings
  };
}

export function calculateCavityBalance(defaults, magnetronCooling, pushInlets) {
  const targetCavityPressurePa = numberOrZero(defaults.targetCavityPressurePa);
  const cavityLengthM = positiveNumber(defaults.cavityLengthM);
  const cavityWidthM = positiveNumber(defaults.cavityWidthM);
  const cavityHeightM = positiveNumber(defaults.cavityHeightM);
  const magnetronAirOpeningLengthM = positiveNumber(defaults.magnetronAirOpeningLengthM);
  const magnetronAirOpeningWidthM = positiveNumber(defaults.magnetronAirOpeningWidthM);
  const maxMagnetronOpeningVelocityMs = positiveNumber(defaults.maxMagnetronOpeningVelocityMs);
  const cavityVolumeM3 = cavityLengthM * cavityWidthM * cavityHeightM;
  const magnetronAirOpeningAreaM2 = magnetronAirOpeningLengthM * magnetronAirOpeningWidthM;
  const magnetronAirflowM3h = positiveNumber(magnetronCooling.activeTotalAirflowM3h);
  const pushAirflowM3h = positiveNumber(pushInlets.totalPushAirflowM3h);
  const serialCavityAirflowM3h = Math.max(magnetronAirflowM3h, pushAirflowM3h);
  const pushMagnetronFlowDeltaM3h = pushAirflowM3h - magnetronAirflowM3h;
  const requiredOpeningAreaM2 = maxMagnetronOpeningVelocityMs > 0
    ? (magnetronAirflowM3h / SECONDS_PER_HOUR) / maxMagnetronOpeningVelocityMs
    : 0;
  const openingVelocityMs = magnetronAirOpeningAreaM2 > 0
    ? (magnetronAirflowM3h / SECONDS_PER_HOUR) / magnetronAirOpeningAreaM2
    : 0;
  const warnings = [];

  if (targetCavityPressurePa >= 0) {
    warnings.push({ level: "fail", message: "Cavity pressure target must stay below ambient." });
  }

  if (cavityLengthM <= 0 || cavityWidthM <= 0 || cavityHeightM <= 0) {
    warnings.push({ level: "warning", message: "Enter cavity length, width, and height." });
  }

  if (magnetronAirOpeningAreaM2 <= 0) {
    warnings.push({ level: "warning", message: "Enter the magnetron-air opening length and width." });
  }

  if (requiredOpeningAreaM2 > 0 && magnetronAirOpeningAreaM2 < requiredOpeningAreaM2) {
    warnings.push({ level: "fail", message: "Magnetron-air opening area is below the area required for the selected velocity limit." });
  }

  if (pushAirflowM3h < magnetronAirflowM3h) {
    warnings.push({ level: "warning", message: "Push airflow is below the magnetron airflow requirement in the serial process line." });
  }

  return {
    targetCavityPressurePa,
    cavityLengthM,
    cavityWidthM,
    cavityHeightM,
    cavityVolumeM3,
    magnetronAirOpeningLengthM,
    magnetronAirOpeningWidthM,
    magnetronAirOpeningAreaM2,
    maxMagnetronOpeningVelocityMs,
    requiredOpeningAreaM2,
    openingVelocityMs,
    magnetronAirflowM3h,
    pushAirflowM3h,
    serialCavityAirflowM3h,
    pushMagnetronFlowDeltaM3h,
    status: getCoolingStatus(warnings),
    warnings
  };
}