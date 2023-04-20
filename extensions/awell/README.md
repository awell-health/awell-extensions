# Awell API extension

## Extension settings

You will need to provide the [API URL](https://developers.awellhealth.com/awell-orchestration/api-reference/overview/endpoints) and an [API key](https://developers.awellhealth.com/awell-orchestration/api-reference/overview/authorization).

## Custom Actions

### Start care flow

Starts a new care flow for the patient enrolled in your current care flow.

### Stop care flow

Stops the care flow the patient is currently enrolled in. A reason is why you are stopping the care flow is mandatory.

### Update patient

Allows updating patient data for the patient currently enrolled in the care flow.

### Search patients by patient code

Search whether the current patient already exists. Search happens based on the `patient_code` field which is taken from the patient's profile.

**Returns the below data points:**

1. patientAlreadyExists: a boolean which will be true if minimum one patient with the patient code already exists.
2. numberOfPatientsFound: the number of patients found with the same patient code.
3. awellPatientIds: a comma-separated string of all Awell patient ids that have the same patient code as the patient currently enrolled in the care flow. Will return an empty string when there are no patients with the same patient code.
