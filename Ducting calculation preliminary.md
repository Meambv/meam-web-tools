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
- Freeflow fan rating: 135 CFM
- Approximate pressure loss through the magnetron cooling restriction: 50 Pa
- Cooling restriction geometry: 40 holes of 9 mm by 9 mm
- Default airflow tolerance or design band: plus or minus 10 percent

The 50 degrees C limit is measured at the cooling air outlet after the magnetron. The tool should treat this as a hard warning limit.

At 50 degrees C or above, the tool should show a hard fail state for magnetron outlet temperature.

The default fan airflow should use the measured average of 57.5 m3/h, while allowing the user to switch to conservative values, optimistic values, or manually entered values.

The first version should assume one GEA1238B28N30 fan per magnetron.

The heat load fraction from the magnetron system into the cooling air should be entered manually. The tool should not assume that 100 percent of the 300 kW becomes cooling-air heat unless the user enters that value.

## Main Calculation Sections

### 1. Push Inlets

These are the fan-driven inlet points on top of the machine that push air into the process system.

Inputs:

- Number of push inlets
- Desired deltaP per inlet relative to ambient
- Temperature per inlet
- Airflow per inlet, if known
- Duct system connected to each inlet

Rules and warnings:

- The pressure after the push inlets must stay below ambient.
- The tool should warn if the entered inlet pressure would create positive pressure relative to ambient.
- Push air should be treated as controlled supply air, not as permission to pressurize the cavity.

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

The known pressure input should initially be treated as duct section pressure drop. For the magnetron cooling path, the measured pressure loss is about 50 Pa through the restriction made by 40 holes of 9 mm by 9 mm. This produced about 50 m3/h in the real setup, while the fan freeflow rating is 135 CFM.

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
- Optional cavity width and height later
- Optional leakage/opening factors later

Rules and warnings:

- The cavity pressure must stay below ambient.
- The default target cavity pressure should be -20 Pa relative to ambient.
- The target pressure should be negative enough to prevent humidity escaping.
- The tool should warn if push air plus magnetron cooling air is greater than the extraction capacity.

### 4. Extraction Fans

The extraction fans are positioned after the cavity and pull air out of the process. They may pull harder or softer depending on humidity and temperature.

Inputs:

- Number of extraction fans
- Fan grouping, if multiple fans share one duct system
- Airflow per fan or fan group
- Target pressure before and after fan group
- Ducting per fan or fan group
- Control mode note: humidity based, temperature based, or fixed

Rules and warnings:

- Extraction airflow should exceed push inlet airflow plus magnetron cooling airflow by a suitable margin, but the default margin still needs to be defined from the process model.
- Extraction must maintain the desired negative cavity pressure.
- The tool should flag configurations where extraction cannot maintain below-ambient pressure.

Extraction temperature and humidity should be treated by extraction area. The air is expected to become warmer and more humid along the extraction path. As a first simplifying assumption, the tool may treat the target extraction temperature as the same across all extraction areas, while still allowing humidity and load distribution to be refined later.

The first extraction area will probably be drier than later extraction areas.

### 5. Duct Systems

Ducting should be entered separately for each functional section:

- Push ducting
- Cavity-connected ducting
- Extraction ducting
- Future heat recovery or condenser ducting

Each duct system should support a list of line segments.

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
- Total air entering the cavity
- Total extraction airflow
- Net extraction margin, if a margin target has been selected
- Target cavity pressure
- Pressure status relative to ambient
- Main warnings

Initial balance principle:

```text
total_inflow = push_airflow + magnetron_cooling_airflow
extraction_margin = extraction_airflow - total_inflow
```

The extraction margin should normally be positive to keep the cavity below ambient pressure. The default margin should remain editable and may need to be based on extraction area behavior rather than one fixed percentage.

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
- Extraction airflow lower than push airflow plus magnetron cooling airflow
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

- What safety margin should extraction airflow have above total inflow?
- Should pressure drop calculations use a simplified method first, or should they immediately use catalogue/product data?
- Should fan behavior be modeled from the measured 50 Pa / 50 m3/h operating point, or entered as a simple editable airflow value for the first version?
- Should the plus or minus 10 percent band be treated as tolerance, warning band, or design safety margin?
- How many extraction areas are normally used, and how is airflow divided between them?
- Should humidity be entered per extraction area in the first version, or left for the later thermal/humidity model?
- How should the small flow change from stronger extraction pull or stronger push inlet pressure be represented in the first version?