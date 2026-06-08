# Ducting Calculation Build Todo

This todo list is for building the desktop-only ducting calculation page at `tools/ducting-calculation/index.html`.

The approach should be safe and incremental: build one useful piece, verify it, then continue. The minimum target viewport is Full HD, with UHD supported when available.

## Build Principles

- Keep the page desktop/computer focused.
- Target Full HD as the minimum practical viewport.
- Avoid mobile-first compromises.
- Build one section at a time.
- Keep every engineering constant editable.
- Prefer visible warnings over hidden assumptions.
- Do not add catalogue pricing or heat recovery before the core airflow model works.
- Keep the first calculator useful even with simplified pressure behavior.

## Phase 0: Preserve Current Access Flow

- [x] Keep the existing session access check intact.
- [x] Keep the Home and Admin links available.
- [x] Replace only the placeholder calculator content.
- [x] Verify that direct access without a valid code still redirects home.

## Phase 1: Desktop Page Shell

- [x] Create a dense desktop engineering layout.
- [x] Add a top header with page title, status, and navigation.
- [x] Add a main grid for inputs and results.
- [x] Add a persistent results and warnings panel.
- [x] Make sure the layout fits comfortably at 1920 x 1080.
- [x] Keep UHD useful without depending on UHD-only space.

## Phase 2: Editable Defaults Panel

- [x] Add inputs for default ambient temperature, default 20 degrees C.
- [x] Add input for maximum magnetron outlet temperature, default 50 degrees C.
- [x] Add input for target cavity pressure, default -20 Pa.
- [x] Add input for air density.
- [x] Add input for air heat capacity.
- [x] Add input for airflow tolerance band, default plus or minus 10 percent.
- [x] Add reset-to-defaults button.

## Phase 3: Magnetron Cooling Core

- [x] Add number of magnetrons, default 200.
- [x] Add fans per magnetron, default 1.
- [x] Add total system power, default 300 kW.
- [x] Add manually entered heat load fraction or direct heat load.
- [x] Add target airflow per magnetron, default 57.5 m3/h.
- [x] Show measured fan range, 45 to 70 m3/h.
- [x] Show measured typical restricted airflow, about 50 m3/h.
- [x] Show fan freeflow rating in metric units.
- [x] Show magnetron cooling restriction pressure loss, about 50 Pa.
- [x] Show restriction geometry, 40 holes of 9 mm by 9 mm.
- [x] Calculate total magnetron airflow.
- [x] Calculate heat load per magnetron.
- [x] Calculate outlet air temperature after the magnetron.
- [x] Calculate required airflow to stay below the outlet limit.
- [x] Add hard fail when outlet air temperature is 50 degrees C or higher.

## Phase 4: Calculation Mode Switch

- [x] Add mode: calculate required airflow from heat load and temperature limit.
- [x] Add mode: validate entered target airflow and show resulting outlet temperature.
- [x] Keep both modes visible enough that the user understands what is being calculated.
- [x] Do not hide editable constants used by the active mode.

## Phase 5: Push Inlet Section

- [x] Add number of push inlets.
- [x] Add airflow per push inlet.
- [x] Add power per push inlet fan.
- [x] Set permanent push/pull fan defaults from IRT/4-450 datasheet.
- [x] Add outlet fan power default for the later extraction section.
- [x] Add separate process fan data form for the chosen push/pull fan.
- [x] Let process fan airflow and power update push/extraction defaults.
- [x] Add temperature per push inlet.
- [x] Add desired deltaP per inlet relative to ambient.
- [x] Warn if pressure after push inlets goes above ambient.
- [x] Calculate total push inlet airflow.

## Phase 6: Cavity Balance Section

- [x] Add wanted cavity pressure relative to ambient, default -20 Pa.
- [x] Add cavity length, default around 20 m.
- [x] Add cavity width and height.
- [x] Add magnetron-air opening length and width.
- [x] Calculate magnetron-air opening area.
- [x] Alarm if magnetron-air opening area is below required area.
- [x] Calculate serial cavity airflow without adding push and magnetron flows as parallel streams.
- [x] Show push airflow, magnetron airflow, and the serial flow difference.
- [x] Warn if cavity target is not below ambient.
- [x] Warn if humidity containment is likely unsafe.

## Phase 7: Extraction Fan Section

- [x] Place Extraction Control below the main Phase 4/6 panels so the key extraction sizing problem has enough width.
- [x] Treat extraction as downstream control, not as a simple fan total.
- [x] Add number of extraction fans.
- [x] Add airflow per extraction fan.
- [x] Add power per extraction fan.
- [x] Add editable cavity absolute pressure and derive DeltaP over extraction fans from ambient minus cavity pressure.
- [x] Add editable heat recovery/condenser pressure drop and include it in extraction fan DeltaP.
- [x] Use permanent IRT/4-450 fan defaults for extraction fan airflow and power.
- [ ] Add fan-curve data entry for IRT/4-450 airflow versus static pressure.
- [x] Add metric fan library JSON with IRT/4-450 50 Hz curve data.
- [x] Add VFD frequency estimate from required airflow and static pressure.
- [x] Add indicative inlet VFD estimate rows before final extraction control.
- [x] Use process fan curve at push inlet deltaP for 50 Hz inlet flow estimate.
- [x] Warn when required operation exceeds 50 Hz and depends on ramping toward 60 Hz.
- [x] Mark VFD estimates as indicative because real fan speed is PLC PID controlled.
- [x] Use PLC pressure target range of about -2 to -10 Pa.
- [x] Add extraction temperature input for extraction control.
- [x] Add editable absolute moisture weight input for extraction control, for example g water/kg dry air.
- [x] Calculate relative humidity from absolute moisture weight, temperature, and air pressure.
- [x] Calculate humid-air volume increase from absolute moisture weight, temperature, pressure, and dry-air flow.
- [x] Use cavity absolute pressure in humid-air volume correction.
- [x] Use default cavity absolute pressure of ambient minus 100 Pa for Phase 7 extraction sizing.
- [x] Show dry-airflow target, calculated relative humidity, and corrected wet-air volume flow separately.
- [ ] Add cavity pressure target and serial airflow target as extraction control inputs.
- [x] Warn if extraction pull is too low for negative pressure, humidity removal, or magnetron temperature control.
- [x] Warn if extraction pull is too high and likely reduces useful convection/residence behavior.
- [x] Warn if moisture/temperature expansion makes extraction fan capacity or VFD estimate insufficient.
- [x] Add fan grouping field or selector.
- [x] Add control mode: humidity based, temperature based, or fixed.
- [x] Calculate total extraction airflow.
- [ ] Compare extraction airflow against serial cavity airflow and pressure target.
- [x] Show extraction control margin or shortage.
- [x] Keep extraction margin editable or clearly undefined until the model is chosen.

## Phase 8: First Results Summary

- [x] Show total push inlet airflow.
- [x] Show total magnetron cooling airflow.
- [x] Show serial cavity airflow.
- [x] Show total extraction airflow.
- [x] Show extraction control margin or shortage.
- [x] Show magnetron outlet temperature status.
- [x] Show cavity pressure status.
- [x] Show overall pass, warning, or fail state.

## Phase 9: Verification Before More Features

- [x] Test default values at 1920 x 1080.
- [x] Verify no text overlaps.
- [x] Verify hard fail at 50 degrees C or higher.
- [x] Verify warnings for weak extraction.
- [x] Verify all edited inputs update results immediately.
- [x] Verify access redirect still works.

## Phase 9b: Cross Heat Exchanger Control

- [ ] Add cross-flow heat exchanger model before duct segment builder work.
- [ ] Add wet-side inlet definition: 45 degrees C and high RH process exhaust.
- [ ] Calculate wet-side outlet state after recovery and condensation.
- [ ] Calculate condensate flow and define drain-to-client-water-drain requirement.
- [ ] Add dry-side inlet definition from seasonal outdoor weather input.
- [ ] Add dry-side target outlet of 20 degrees C with minimal RH as practical.
- [ ] Add control rule: if outlet RH at belt end is too high, reduce line speed to increase drying residence time.
- [ ] Add control rule: do not force post-heater as first action for high outlet RH; use process speed control first.
- [ ] Add hot-weather rule: if outside air is too hot, flag client decision for optional air conditioning.
- [ ] Define too-hot threshold for outside air as 28 to 30 degrees C with warning and fail bands.
- [ ] Add magnetron safety warning: high inlet temperature can harm magnetrons and make the process infeasible.
- [ ] Add control rule: if heat exchanger overshoots target dry outlet temperature, require bypass or mixing control.
- [ ] Add winter operating mode with optional extra push-in fan through heat-recovery path.
- [ ] Add summer operating mode where outside-air input fan is off.
- [ ] Add summer inlet strategy options: client mesh inlet or diverter valve to perforated wall tube.
- [ ] Add no-draft check/warning for summer perforated tube concept.

## Phase 10: Duct Segment Builder Later

- [ ] Add push duct segment list.
- [ ] Add extraction duct segment list.
- [ ] Add waveguide/funnel microwave-filter restriction inputs, if this pressure loss is modeled here.
- [ ] Add rectangular, circular, and oval duct types.
- [ ] Add add, edit, and delete line actions.
- [ ] Calculate total duct length.
- [ ] Add first simplified velocity calculation.
- [ ] Add first simplified pressure-drop warning.

## Phase 11: Extraction Areas Later

- [ ] Add multiple extraction areas.
- [ ] Add airflow per extraction area.
- [ ] Add temperature target per extraction area.
- [ ] Add humidity placeholder per extraction area.
- [ ] Show that first extraction area is probably drier.
- [ ] Keep same-temperature assumption editable.

## Phase 12: Visual Layout Later

- [ ] Draw a simple line layout of push, cavity, magnetrons, and extraction.
- [ ] Show airflow direction arrows.
- [ ] Show warning markers on the drawing.
- [ ] Keep this as a simple engineering sketch, not a CAD tool.

## Phase 13: Save And Export Later

- [x] Save calculation state in browser local storage.
- [x] Load saved calculation state.
- [x] Save selected process fan data in browser local storage.
- [x] Load selected process fan data in browser local storage.
- [ ] Export JSON.
- [ ] Export CSV summary.
- [ ] Add print-friendly result view.

## Phase 14: Product And Recovery Data Later

- [ ] Add Airkan catalogue data only after the core process model is stable.
- [ ] Add component selection.
- [ ] Add catalogue pressure loss.
- [ ] Add price estimate.
- [ ] Add bill of materials.
- [ ] Extend heat-recovery model with catalogue-specific component sizing and cost options.

## Immediate Next Step

- [x] Implement Phase 0 and Phase 1 only.
- [x] Stop and verify the desktop shell before adding calculations.
- [x] Implement Phase 3 magnetron cooling core.
- [x] Implement Phase 4 calculation mode switch.
- [x] Implement Phase 5 push inlet section.
- [x] Implement Phase 6 cavity balance section.
- [x] Implement Phase 7 extraction fan section.
- [x] Implement Phase 8 first results summary.
- [x] Complete Phase 9 verification before more features.
