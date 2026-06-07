export const ACCESS_STORAGE_KEY = "meam:webtools:access";
export const ACCESS_CODE = "B5C6D7";

export const DEFAULTS = Object.freeze({
  magnetronCount: 200,
  fansPerMagnetron: 1,
  systemPowerKw: 300,
  heatLoadKw: 0,
  calculationMode: "validateTarget",
  targetAirflowPerMagnetronM3h: 57.5,
  ambientTemperatureC: 20,
  maxOutletTemperatureC: 50,
  targetCavityPressurePa: -20,
  airDensityKgM3: 1.2,
  airHeatCapacityKjKgK: 1.006,
  fanModel: "GEA1238B28N30",
  defaultFanAirflowM3h: 57.5,
  measuredFanAirflowMinM3h: 45,
  measuredFanAirflowMaxM3h: 70,
  restrictedFanAirflowM3h: 50,
  fanFreeflowCfm: 116.6,
  restrictionPressureLossPa: 50,
  restrictionHoleCount: 40,
  restrictionHoleWidthMm: 9,
  restrictionHoleHeightMm: 9,
  airflowTolerancePercent: 10
});

export const ACCESS_MESSAGES = Object.freeze({
  granted: "Access granted for this session.",
  denied: "No valid code found for this session. Returning to the landing page..."
});