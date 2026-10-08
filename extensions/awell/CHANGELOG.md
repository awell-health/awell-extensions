# Awell changelog

## Unreleased

- New actions "Pause care flow" and "Unpause care flow": pause one or more care flows (defaults to the current care flow) and resume them later via the `pauseCareFlow` and `unpauseCareFlow` orchestration mutations.
- "Is patient already enrolled in care flow" now accepts "paused" in the pathway status field, so a support care flow can find a paused care flow and resume it.
- New action "Get Hosted Pages Link": fetches the static Hosted Pages link for a stakeholder in a care flow. The stakeholder field is optional and defaults to the patient when left empty.

## April 2024

Two new action were added: "Get patient by identifier" and "Add identifier to patient".

## October 26, 2023

Generic webhook to start a care flow added

## April 19, 2023

Stop care flow action added.
Search patients by patient code action was added.
"Is patient enrolled in care flow" action added.
