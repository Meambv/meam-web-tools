export const FAN_LIBRARY = Object.freeze({
  fanLibraryVersion: 1,
  units: {
    airflow: "m3/h",
    pressure: "Pa",
    power: "kW",
    speed: "rpm",
    frequency: "Hz",
    temperature: "degrees C",
    density: "kg/m3"
  },
  fans: [
    {
      id: "magnetron-gea1238b28n30",
      label: "GEA1238B28N30 magnetron cooling fan",
      roles: ["magnetronCooling"],
      dataSource: "measured",
      isDefaultForRoles: ["magnetronCooling"],
      nominal: {
        rpm: 2800,
        freeflowM3h: 198.1
      },
      measuredOperatingRange: {
        airflowM3h: {
          min: 45,
          typical: 50,
          max: 70
        },
        staticPressurePa: {
          typical: 85
        },
        restrictionDeltaPPa: {
          typical: 50
        }
      },
      restriction: {
        type: "microwave-filter-holes",
        holeCount: 40,
        holeWidthMm: 9,
        holeHeightMm: 9,
        measuredDeltaPPa: 50
      },
      curveModel: {
        method: "measured-points",
        confidence: "medium"
      },
      measuredCurvePoints: [
        { airflowM3h: 45, staticPressurePa: 85, restrictionDeltaPPa: 50 },
        { airflowM3h: 50, staticPressurePa: 85, restrictionDeltaPPa: 50, isTypical: true },
        { airflowM3h: 70, staticPressurePa: 85, restrictionDeltaPPa: 50 }
      ]
    },
    {
      id: "process-irt-4-450-5132928300",
      label: "IRT/4-450 230/400V50Hz 560/160 VE",
      roles: ["pushInlet", "extraction"],
      dataSource: "datasheet-graph-digitized",
      isDefaultForRoles: ["pushInlet", "extraction"],
      nominal: {
        frequencyHz: 50,
        maxFrequencyHz: 60,
        rpm: 1380,
        airDensityKgM3: 1.2,
        temperatureC: 20
      },
      theoreticalWorkpoint: {
        airflowM3h: 3000,
        staticPressurePa: 900
      },
      actualWorkpoint: {
        airflowM3h: 2979,
        staticPressurePa: 888,
        dynamicPressurePa: 1.69,
        totalPressurePa: 889,
        inputPowerKw: 1.85,
        outletVelocityMs: 1.7,
        rpm: 1380,
        specificFanPowerWPerLs: 2.24
      },
      construction: {
        diameterMm: 793,
        fanSize: 450,
        weightKg: 87.58
      },
      motor: {
        poles: 4,
        voltage: "3-230/400V-50Hz",
        maxCurrentA: {
          delta230V: 7.4,
          star400V: 4.2
        },
        ipClass: "IP54",
        insulationClass: "F"
      },
      curveModel: {
        method: "digitized-50hz-curve-with-affinity-scaling",
        baseFrequencyHz: 50,
        maxFrequencyHz: 60,
        flowScaling: "linear-with-frequency",
        pressureScaling: "square-with-frequency",
        powerScaling: "cube-with-frequency",
        label: "Indicative VFD setting"
      },
      staticPressureCurve50Hz: [
        { airflowM3h: 0, staticPressurePa: 1000 },
        { airflowM3h: 2000, staticPressurePa: 940 },
        { airflowM3h: 2979, staticPressurePa: 888, isKnownWorkpoint: true },
        { airflowM3h: 4000, staticPressurePa: 830 },
        { airflowM3h: 6000, staticPressurePa: 690 },
        { airflowM3h: 8000, staticPressurePa: 420 },
        { airflowM3h: 9000, staticPressurePa: 250 },
        { airflowM3h: 10000, staticPressurePa: 0 }
      ],
      powerCurve50Hz: [
        { airflowM3h: 2979, inputPowerKw: 1.85, isKnownWorkpoint: true }
      ],
      rpmCurve50Hz: [
        { airflowM3h: 2979, rpm: 1380, isKnownWorkpoint: true }
      ]
    }
  ]
});

export function getDefaultFanForRole(role) {
  return FAN_LIBRARY.fans.find((fan) => fan.isDefaultForRoles.includes(role));
}