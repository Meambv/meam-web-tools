const SECONDS_PER_HOUR = 3600;
const M3H_PER_CFM = 1.69901082;

export function calculateMagnetronCooling(defaults) {
  const magnetronCount = positiveNumber(defaults.magnetronCount);
  const fansPerMagnetron = positiveNumber(defaults.fansPerMagnetron);
  const systemPowerKw = positiveNumber(defaults.systemPowerKw);
  const heatLoadKw = positiveNumber(defaults.heatLoadKw);
  const targetAirflowPerMagnetronM3h = positiveNumber(defaults.targetAirflowPerMagnetronM3h);
  const ambientTemperatureC = numberOrZero(defaults.ambientTemperatureC);
  const maxOutletTemperatureC = numberOrZero(defaults.maxOutletTemperatureC);
  const airDensityKgM3 = positiveNumber(defaults.airDensityKgM3);
  const airHeatCapacityKjKgK = positiveNumber(defaults.airHeatCapacityKjKgK);
  const fanFreeflowCfm = positiveNumber(defaults.fanFreeflowCfm);

  const allowableDeltaTC = maxOutletTemperatureC - ambientTemperatureC;
  const fanFreeflowM3h = fanFreeflowCfm * M3H_PER_CFM;
  const totalTargetAirflowM3h = magnetronCount * targetAirflowPerMagnetronM3h;
  const heatLoadPerMagnetronKw = magnetronCount > 0 ? heatLoadKw / magnetronCount : 0;
  const outletDeltaTC = calculateDeltaT(heatLoadKw, totalTargetAirflowM3h, airDensityKgM3, airHeatCapacityKjKgK);
  const outletTemperatureC = ambientTemperatureC + outletDeltaTC;
  const requiredTotalAirflowM3h = calculateRequiredAirflow(heatLoadKw, allowableDeltaTC, airDensityKgM3, airHeatCapacityKjKgK);
  const requiredAirflowPerMagnetronM3h = magnetronCount > 0 ? requiredTotalAirflowM3h / magnetronCount : 0;

  const warnings = buildCoolingWarnings({
    allowableDeltaTC,
    heatLoadKw,
    maxOutletTemperatureC,
    outletTemperatureC,
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
    targetAirflowPerMagnetronM3h,
    totalTargetAirflowM3h,
    heatLoadPerMagnetronKw,
    allowableDeltaTC,
    outletDeltaTC,
    outletTemperatureC,
    requiredTotalAirflowM3h,
    requiredAirflowPerMagnetronM3h,
    fanFreeflowM3h,
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

  if (values.outletTemperatureC >= values.maxOutletTemperatureC && values.heatLoadKw > 0) {
    warnings.push({ level: "fail", message: "Magnetron outlet air is at or above the temperature limit." });
  }

  if (values.targetAirflowPerMagnetronM3h < values.measuredMin || values.targetAirflowPerMagnetronM3h > values.measuredMax) {
    warnings.push({ level: "warning", message: `Target airflow per magnetron is outside the measured ${values.measuredMin} to ${values.measuredMax} m3/h range.` });
  }

  if (values.requiredAirflowPerMagnetronM3h > values.measuredMax) {
    warnings.push({ level: "warning", message: "Required airflow per magnetron is above the measured fan range." });
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