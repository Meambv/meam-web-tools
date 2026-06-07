# Ducting Calculation Preliminary

## Purpose

The **Ducting Calculation** tool on the **MEAM Web Tools** site is intended for ducting systems that are part of an industrial magnetron process.

The first version of the tool should focus on airflow and pressure balance for a magnetron process line. It should help determine whether the push inlets, magnetron cooling air, cavity pressure, and extraction fans form a controlled system where air and humidity are kept inside the tunnel and directed toward the extraction side.

The tool is not a generic HVAC duct calculator. It is designed around a production machine where magnetrons inject hot cooling air into an open process cavity, and extraction fans must control pressure, temperature, and humidity after the cavity.

## Process Context

The reference case is a magnetron system with approximately:

- 200 magnetrons
- 300 kW total magnetron system power
- Push air supplied from the top of the machine through multiple ceiling fan inlets
- Hot magnetron cooling air injected into the process cavity
- Extraction fans after the cavity
- Extraction fan control based on humidity and temperature
- An open tunnel cavity of about 20 m or longer

The cavity must remain below ambient pressure so humidity does not escape into the surrounding building.

## First Version Scope

The first version should calculate airflow and pressure balance only.

Units:

- Pressure: Pa
- Airflow: m3/h
- Temperature: degrees C
- Power: kW

The first version should not yet perform a full thermal, humidity, condenser, or heat recovery model. It should, however, reserve sections for these later features.

## Known Constants and Editable Defaults

The tool should start with practical default values, but every constant must be editable in the JavaScript UI through inputs, buttons, or settings controls.

Default values:

- Maximum allowed magnetron outlet air temperature: 50 degrees C
- Default ambient temperature: 20 degrees C
- Default target cavity pressure: -20 Pa relative to ambient
- Default magnetron fan type: GEA1238B28N30 double ball bearing fan
- Default airflow per magnetron fan: 57.5 m3/h
- Measured airflow range from test setups: 45 to 70 m3/h per fan
- Measured typical airflow through the actual magnetron restriction: about 50 m3/h per fan
- Freeflow fan rating: 198.1 m3/h
- Approximate pressure loss through the magnetron cooling restriction: 50 Pa
- Cooling restriction geometry: 40 holes of 9 mm by 9 mm
- Default airflow tolerance or design band: plus or minus 10 percent

Permanent push/pull fan reference for future machines:

- Fan code: 5132928300 - IRT/4-450 230/400V50Hz 560/160 VE
- Nominal frequency: 50 Hz
- Future ramp allowance: up to 60 Hz when extra capacity is needed
- Theoretical point: 3000 m3/h at 900 Pa static pressure, 20 degrees C, 1.2 kg/m3 air density
- Workpoint: 2979 m3/h, 888 Pa static pressure, 889 Pa total pressure
- Input power: 1.85 kW per fan
- Outlet velocity: 1.7 m/s
- Fan speed: 1380 rpm
- Specific fan power: 2.24 W/l/s
- Diameter: 793 mm
- Fan size: 450
- Weight: 87.58 kg
- Motor: 4 poles, 3-230/400V-50Hz, max current 7.4 A / 4.2 A, IP54, insulation class F

The fan curve must be captured before the tool can determine the VFD setting accurately. The tool should eventually use curve data for airflow versus static pressure, input power, and RPM. The single workpoint above is only a default reference point.

The editable fan data source is stored as metric JSON in `tools/ducting-calculation/fanLibrary.json`. It includes the magnetron cooling fan measured points and the IRT/4-450 50 Hz static-pressure curve, including 10000 m3/h at 0 Pa.

The tool should expose the chosen process fan in a separate fan data form. The IRT/4-450 data should be prefilled, but changing that form should allow a future fan to be entered. The process fan form should update the default push inlet airflow and push/extraction fan power values, while those section-specific values remain editable.

VFD setting requirement:

- Determine the required fan frequency from the required airflow and static pressure.
- Use captured fan-curve values where available.
- Use fan affinity laws only as an interim estimate between known curve points.
- Nominal operation is 50 Hz.
- Allow ramping to 60 Hz for extra capacity, with a clear warning when the design depends on operation above 50 Hz.
- Show the estimated VFD setting in Hz and the resulting estimated airflow, pressure, power, and RPM.

The 50 degrees C limit is measured at the cooling air outlet after the magnetron. The tool should treat this as a hard warning limit.

At 50 degrees C or above, the tool should show a hard fail state for magnetron outlet temperature.

The default fan airflow should use the measured average of 57.5 m3/h, while allowing the user to switch to conservative values, optimistic values, or manually entered values.

The first version should assume one GEA1238B28N30 fan per magnetron.

Reference fan specification:

- Size: 120 mm fan, 120 x 120 x 38 mm
- Operating voltage: AC 110 V to 240 V, nominal 230 V use
- Speed: 2800 rpm
- Airflow rating: 198.1 m3/h
- Power per fan: editable, default 0 W until supplier or measured value is confirmed
- Noise: 41 dBA
- Bearing: dual ball bearing
- Service life: 67,000 hours at 25 degrees C
- Material: PBT plastic fan frame and fan blades

The heat load fraction from the magnetron system into the cooling air should be entered manually. The tool should not assume that 100 percent of the 300 kW becomes cooling-air heat unless the user enters that value.

## Serial Airflow And Control Principle

The machine airflow is a serial process, not a set of independent parallel fan systems.

Primary controlled values:

- Required airflow through the process cavity
- Required negative pressure in the cavity relative to ambient
- Magnetron outlet temperature below 50 degrees C
- Enough convection in the cavity to heat the material properly
- Enough extraction to remove humidity without pulling so hard that useful convection is lost

Control principle:

- Upstream push fans mainly provide air to the machine inlet side.
- Push fans must not push so hard that the cavity can no longer stay below ambient pressure.
- Magnetron cooling air enters the serial cavity stream and adds heat.
- Downstream extraction fans are the main control element for cavity pressure, humidity removal, and the final process airflow.
- If extraction fans pull too weakly, the cavity can lose negative pressure, humidity can escape, and magnetron outlet temperature can rise.
- If extraction fans pull too strongly, the process can lose useful convection/residence advantage for heating the material.
- The practical control target is a continuous balance between upstream air supply and downstream extraction, with downstream control being more critical.

The tool should therefore treat extraction as a controlled downstream actuator, not just as a static airflow total. VFD setting, fan curve, cavity pressure target, magnetron temperature limit, and process convection should be evaluated together.

The real fan speed control is handled by PLC PID, not by the web tool. The web tool should show indicative VFD settings only. The PLC target range for cavity pressure is approximately -2 to -10 Pa.

Extraction control will also need relative humidity and temperature inputs. These values affect how hard extraction should pull: enough to remove humidity and protect magnetrons, but not so much that useful heat transfer/convection in the cavity is lost.

## Main Calculation Sections

### 1. Push Inlets

These are the fan-driven inlet points on top of the machine that push air into the process system.

Inputs:

- Number of push inlets
- Desired deltaP per inlet relative to ambient
- Temperature per inlet
- Airflow per inlet, if known
- Power per inlet fan
- Duct system connected to each inlet

Rules and warnings:

- The pressure after the push inlets must stay below ambient.
- The tool should warn if the entered inlet pressure would create positive pressure relative to ambient.
- Push air should be treated as controlled supply air, not as permission to pressurize the cavity.
- The push inlet fan flow should be estimated from the process fan static-pressure curve at the entered low pressure difference. At -5 to -10 Pa the IRT/4-450 is close to the 0 Pa curve point, so the 50 Hz estimated flow is near 10000 m3/h per fan.
- The entered fan data flow and fan data power are reference values at the fan data static pressure, not the real operating flow at the low inlet pressure.
- Fan data flow, fan data power, and fan data pressure should be grouped together in the push inlet input area because they describe the same reference fan point.
- The 50 Hz curve flow is an estimate of available capacity at the selected inlet pressure. The controlled push flow and indicative VFD setting are estimates and should be italic in the UI.
- The Push Inlets table should show, in order: total required flow, needed flow per inlet, indicative inlet VFD setting, delta flow inlets minus magnetrons, indicative total push fan power, pressure after inlets, inlet temperature, and inlet relative humidity.
- Total required push flow should default to 1 percent less than the required total magnetron airflow. This keeps the upstream inlet side slightly under the magnetron demand.
- Total push fan power in the Push Inlets table is indicative and should be scaled down with the VFD estimate rather than using the full reference fan data power.
- Default inlet relative humidity is 80 percent.
- Indicative inlet VFD frequency should compare required flow per fan against the curve-estimated 50 Hz flow. If the target pressure is more negative, available flow drops and the indicative frequency rises; if pressure is closer to ambient, the fan should slow down.

### 2. Magnetron Cooling Air

The magnetrons require cooling airflow. This cooling air becomes hot and is injected into the cavity.

Inputs:

- Number of magnetrons
- Number of fans per magnetron, default 1
- Total magnetron system power in kW
- Heat load fraction or heat load in kW entered manually
- DeltaT behind the magnetrons
- Ambient temperature
- Maximum allowed outlet temperature after the magnetron
- Target airflow per magnetron
- Fan airflow range or tolerance
- Optional efficiency or heat fraction factor, if needed later

Calculation target:

- Airflow per magnetron
- Total magnetron cooling airflow
- Estimated hot air temperature increase behind the magnetrons
- Outlet air temperature after the magnetron
- Pass/warning/fail status against the 50 degrees C outlet limit

Initial calculation principle:

```text
airflow = heat load / (air density * air heat capacity * deltaT)
```

The UI should allow the tool to calculate airflow from magnetron power and deltaT. A later version may allow manually entered airflow per magnetron when catalogue or measured values are available.

The UI should support two calculation modes:

- Calculate required airflow to keep magnetron outlet air below the temperature limit, then compare it against the target airflow.
- Validate the user-entered target airflow and show the resulting outlet temperature.

Default behavior should use the editable GEA1238B28N30 fan airflow average of 57.5 m3/h per magnetron, with a visible measured range of 45 to 70 m3/h.

The known pressure input should initially be treated as duct section pressure drop. For the magnetron cooling path, the measured pressure loss is about 50 Pa through the restriction made by 40 holes of 9 mm by 9 mm. This produced about 50 m3/h in the real setup, while the fan freeflow rating is 198.1 m3/h.

The user should be able to override the measured default because inlet push pressure and extraction pull may create a small amount of usable wiggle room in the actual flow.

Rules and warnings:

- Warn if deltaT is missing or too low to produce a realistic airflow.
- Warn if calculated magnetron cooling airflow is outside an expected operating range.
- Warn if the resulting hot air temperature is above the allowed process or equipment limit.
- Warn if outlet air after the magnetron reaches or exceeds 50 degrees C.
- Warn if the required airflow is above the editable fan airflow range.
- Warn if the selected target airflow is outside the measured 45 to 70 m3/h setup range, unless the user overrides the default fan data.
- Hard fail if the magnetron outlet air temperature is 50 degrees C or higher.

### 3. Process Cavity

The cavity is an open tunnel, approximately 20 m or longer. It receives air from the push inlets and hot cooling air from the magnetrons.

Inputs:

- Wanted cavity pressure relative to ambient
- Cavity length
- Cavity width
- Cavity height
- Magnetron-air opening length
- Magnetron-air opening width
- Maximum allowed magnetron-air opening velocity
- Optional leakage/opening factors later

Rules and warnings:

- The cavity pressure must stay below ambient.
- The default target cavity pressure should be -20 Pa relative to ambient.
- The target pressure should be negative enough to prevent humidity escaping.
- The cavity is a serial process line. Do not add push airflow and magnetron airflow as parallel streams for the cavity airflow. Use the governing serial airflow and warn when the push airflow is below the magnetron airflow requirement.
- The tool should calculate the magnetron-air opening area and alarm if the area is below what is needed for the selected magnetron airflow and velocity limit.

### 4. Extraction Fans

The extraction fans are positioned after the cavity and pull air out of the process. They may pull harder or softer depending on humidity and temperature.

Inputs:

- Number of extraction fans
- Fan grouping, if multiple fans share one duct system
- Airflow per fan or fan group
- Target pressure before and after fan group
- Extraction air temperature
- Extraction relative humidity
- Absolute moisture weight, for example g water/kg dry air
- Dry-airflow target and corrected wet-air volume flow
- Ducting per fan or fan group
- Control mode note: humidity based, temperature based, or fixed

Rules and warnings:

- Extraction airflow should be controlled to maintain the required cavity pressure and process airflow. It should not be modeled as simply exceeding a parallel sum of push airflow and magnetron cooling airflow.
- Extraction must maintain the desired negative cavity pressure.
- The tool should flag configurations where extraction cannot maintain below-ambient pressure.
- The tool should warn when extraction pull is likely too high for the desired convection/residence behavior in the cavity.
- The tool should warn when extraction pull is likely too low for humidity containment or magnetron temperature control.
- Extraction control should later include relative humidity and temperature because downstream airflow demand depends on both process moisture and heat removal.
- Extraction control must include absolute moisture weight as an editable value. Temperature and absolute moisture content together can increase the actual extraction volume flow significantly, so the extraction calculation should distinguish dry-airflow target from corrected humid-air volume flow.
- The extraction fan VFD estimate should use the corrected humid-air volume flow when checking fan capacity, while still showing that the result is indicative and the real machine is controlled by PLC PID.
- The tool should warn if moisture and temperature expansion push the extraction demand above nominal 50 Hz capacity or toward/above the 60 Hz ramp allowance.

Extraction temperature and humidity should be treated by extraction area. The air is expected to become warmer and more humid along the extraction path. As a first simplifying assumption, the tool may treat the target extraction temperature as the same across all extraction areas, while still allowing humidity and load distribution to be refined later.

The first extraction area will probably be drier than later extraction areas.

### 5. Duct Systems

Ducting should be entered separately for each functional section:

- Push ducting
- Extraction ducting
- Future heat recovery or condenser ducting

Each duct system should support a list of line segments.

The funnel/waveguide microwave-filter holes are not a duct segment list. If their pressure loss is included in the tool, it should be modeled as a separate restriction input using the total hole geometry and measured pressure loss.

Per segment inputs:

- Duct type: rectangular, circular, or oval
- Length
- Angle
- Direction
- Width and height for rectangular ducts
- Diameter for circular ducts
- Width and height or equivalent dimensions for oval ducts
- Optional fitting type later

Per segment actions:

- Add line
- Edit line
- Delete line

Calculation outputs per duct system:

- Total length
- Estimated velocity
- Estimated pressure drop
- Warnings for high velocity or pressure loss

## Overall Balance Calculation

The tool should calculate and show a process balance summary:

- Total push inlet airflow
- Total magnetron cooling airflow
- Serial cavity airflow
- Total extraction airflow
- Extraction control margin relative to serial cavity airflow and pressure target
- Target cavity pressure
- Pressure status relative to ambient
- Main warnings

Serial balance principle:

```text
serial_cavity_airflow = governing process airflow through the cavity
push_airflow should be sufficient to feed the serial stream without pressurizing the cavity
extraction airflow and VFD setting should control cavity pressure, humidity removal, and convection behavior
```

The extraction margin should remain editable and may need to be based on extraction area behavior rather than one fixed percentage. It should be treated as a control band, not a fixed oversizing rule.

The main cooling chain for the first version is:

```text
ambient_temperature + magnetron_deltaT = magnetron_outlet_temperature
magnetron_outlet_temperature must be below 50 degrees C
```

If ambient temperature, duct pressure drop, magnetron quantity, and target airflow per magnetron are known, the tool should derive the remaining airflow balance and warning states from those values.

## Safety and Design Warnings

The first version should include warnings for:

- Pressure after push inlets above ambient
- Cavity pressure above or too close to ambient
- Extraction airflow too low to maintain negative cavity pressure, humidity removal, or magnetron temperature control
- Extraction airflow too high for useful material-heating convection/residence behavior
- Magnetron outlet temperature outside allowed range
- Magnetron outlet temperature at or above 50 degrees C
- Possible humidity escape from the open tunnel
- Missing required values
- Unrealistic deltaT or airflow values
- Target fan airflow outside the editable measured fan range

## Results View

The results should be shown in a clear engineering summary:

- Input summary
- Push inlet totals
- Magnetron cooling airflow
- Cavity pressure target and status
- Extraction fan totals
- Duct pressure drop by section
- Overall pass/warning/fail status

The tool should make it easy to see whether the system is balanced and whether the cavity remains safely below ambient pressure.

## Future Features

### Airkan Catalogue Integration

Later versions may use Airkan catalogue data to:

- Select compatible duct components
- Suggest duct dimensions
- Estimate pressure drop using product data
- Calculate duct and component pricing
- Produce a bill of materials

### Heat Exchanger / Condenser Section

Later versions should include heat recovery and condenser calculations.

Purpose:

- Use extracted heat in winter to heat the building
- Reuse exhausted air energy for inlet air preheating
- Estimate recovered heat from exhaust air
- Estimate condenser load if humidity removal is included

Future inputs:

- Exhaust air temperature
- Exhaust humidity
- Inlet air temperature
- Desired recovered heat
- Heat exchanger efficiency
- Condenser selection

Future outputs:

- Recoverable heat in kW
- Reused air or energy estimate
- Condenser load
- Winter heating contribution

### Save, Export, and Drawing

Later versions may include:

- Save calculation results
- Export results to PDF or CSV
- Simple line drawing of the duct layout
- Visual indication of airflow direction
- Warnings shown directly on the drawing

## Open Questions

- Which fan-curve points should be entered manually first for the IRT/4-450 fan: airflow/static pressure only, or airflow/static pressure/power/RPM together?
- What safety margin should extraction airflow have above total inflow?
- Should pressure drop calculations use a simplified method first, or should they immediately use catalogue/product data?
- Should fan behavior be modeled from the measured 50 Pa / 50 m3/h operating point, or entered as a simple editable airflow value for the first version?
- Should the plus or minus 10 percent band be treated as tolerance, warning band, or design safety margin?
- How many extraction areas are normally used, and how is airflow divided between them?
- Should humidity be entered per extraction area in the first version, or left for the later thermal/humidity model?
- How should the small flow change from stronger extraction pull or stronger push inlet pressure be represented in the first version?