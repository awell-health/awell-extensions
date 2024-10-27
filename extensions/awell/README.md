---
title: Awell Workflow
description: Enrich your care flows with powerful Awell actions.
---

# Awell API extension

## Extension settings

You will need to provide the [API URL](https://developers.awellhealth.com/awell-orchestration/api-reference/overview/endpoints) and an [API key](https://developers.awellhealth.com/awell-orchestration/api-reference/overview/authorization).

## Custom Actions

### Start care flow

Starts a new care flow for the patient enrolled in your current care flow.

**Passing baseline info:**
Please read the documentation on [our developer hub](https://developers.awellhealth.com/awell-orchestration/api-reference/mutations/start-pathway) to learn more about how to pass baseline info.

**Example of how to configure a value for the baseline info action field:**

```json
[
  {
    "data_point_definition_id": "age",
    "value": "29"
  },
  {
    "data_point_definition_id": "dob",
    "value": "1993-11-30"
  }
]
```

### Stop care flow

Stops the care flow the patient is currently enrolled in. A reason is why you are stopping the care flow is mandatory.

### Update patient

Allows updating patient data for the patient currently enrolled in the care flow.

### Is patient already enrolled in care flow

Checks whether the patient is already enrolled in a care flow definition. The care flow the patient is currently enrolled in does not count and is excluded from the results.

**Action fields:**

- pathwayStatus: a comma-separated string of care flow statuses that will be used when looking for care flows the patient is already enrolled in. By default, we only look at active care flows. Options: "active", "completed", "missing_baseline_info", "starting", and "stopped".
- careFlowDefinitionIds: a comma-separated string of care flow definition ids that will be used when looking for care flows the patient is already enrolled in. By default, we only search for care flows that match the current care flow definition id (i.e. is the patient already included in the current care flow?).

**Data points:**

- result: a boolean indicating whether the patient is already enrolled in another care flow that matches your criteria (status & care flow definition id)
- nbrOfResults: the number of care flows found for the patient that match the criteria.
- careFlowIds: a comma-separated string of care flow ids that matched your search criteria. It will be empty when the result is `false` because then there are no other care flow ids that match your criteria.

### Search patients by patient code

Note that this action is deprecated and we recommend using [identifiers](https://developers.awellhealth.com/awell-orchestration/docs/misc/patient-identifiers) instead.

Search whether, apart from the patient currently enrolled in the care flow, another patient with the same `patient_code` already exists.

**Data points:**

1. patientAlreadyExists: a boolean which will be true if minimum one patient with the patient code already exists.
2. numberOfPatientsFound: the number of patients found with the same patient code.
3. awellPatientIds: a comma-separated string of all Awell patient ids (except the current patient) that have the same patient code as the patient currently enrolled in the care flow. Will return an empty string when there are no other patients with the same patient code.

### Get patient by identifier

This action lets you check if a patient with a specific identifier already exists in Awell. It's particularly useful when a patient's identity is initially anonymous during the start of the care flow, but later becomes identifiable through the identifiers collected during the care flow. This check ensures whether a patient with that identifier is already present or not.

### Add identifier to patient

This action adds a unique identifier to the current patient's profile. It first checks if this identifier is already linked to another patient. If it's safe to add (no other patient has this identifier), it updates the current patient's profile. However, if the identifier is already in use by another patient, the action will stop and let you know to avoid duplicates. For best results, use the "Get patient by identifier" action first to check for any matches before adding a new identifier.

## Webhooks

Webhooks in the Awell extension offer ways to trigger a care flow based on the end of another care flow, or from any event that happens in your system (via the pathwayStart webhook).
