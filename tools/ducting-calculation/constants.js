import { getDefaultFanForRole } from "./fanLibrary.js?v=phase7-extraction";

const magnetronFan = getDefaultFanForRole("magnetronCooling");
const processFan = getDefaultFanForRole("pushInlet");

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
  cavityLengthM: 20,
  cavityWidthM: 1.2,
  cavityHeightM: 0.8,
  magnetronAirOpeningLengthM: 1,
  magnetronAirOpeningWidthM: 0.2,
  maxMagnetronOpeningVelocityMs: 6,
  pushInletCount: 3,
  pushAirflowPerInletM3h: processFan.actualWorkpoint.airflowM3h,
  pushInletFanPowerW: processFan.actualWorkpoint.inputPowerKw * 1000,
  pushInletTemperatureC: 20,
  pushInletRelativeHumidityPercent: 80,
  pushInletDeltaPPa: -5,
  extractionFanCount: 3,
  extractionAirflowPerFanM3h: processFan.actualWorkpoint.airflowM3h,
  extractionFanPowerW: processFan.actualWorkpoint.inputPowerKw * 1000,
  extractionStaticPressurePa: processFan.actualWorkpoint.staticPressurePa,
  extractionFanGroupLabel: "All extraction fans",
  extractionControlMode: "humidityTemperature",
  extractionTemperatureC: 45,
  extractionAbsoluteMoistureGKg: 80,
  extractionAirPressurePa: 101325,
  extractionControlMarginPercent: 10,
  processFanModel: processFan.label,
  processFanWorkpointAirflowM3h: processFan.actualWorkpoint.airflowM3h,
  processFanStaticPressurePa: processFan.actualWorkpoint.staticPressurePa,
  processFanInputPowerKw: processFan.actualWorkpoint.inputPowerKw,
  processFanFrequencyHz: processFan.nominal.frequencyHz,
  processFanMaxFrequencyHz: processFan.nominal.maxFrequencyHz,
  airDensityKgM3: 1.2,
  airHeatCapacityKjKgK: 1.006,
  fanModel: magnetronFan.label,
  fanPowerW: 0,
  defaultFanAirflowM3h: 57.5,
  measuredFanAirflowMinM3h: magnetronFan.measuredOperatingRange.airflowM3h.min,
  measuredFanAirflowMaxM3h: magnetronFan.measuredOperatingRange.airflowM3h.max,
  restrictedFanAirflowM3h: magnetronFan.measuredOperatingRange.airflowM3h.typical,
  fanFreeflowM3h: magnetronFan.nominal.freeflowM3h,
  restrictionPressureLossPa: magnetronFan.restriction.measuredDeltaPPa,
  restrictionHoleCount: magnetronFan.restriction.holeCount,
  restrictionHoleWidthMm: magnetronFan.restriction.holeWidthMm,
  restrictionHoleHeightMm: magnetronFan.restriction.holeHeightMm,
  airflowTolerancePercent: 10
});

export const ACCESS_MESSAGES = Object.freeze({
  granted: "Access granted for this session.",
  denied: "No valid code found for this session. Returning to the landing page..."
});