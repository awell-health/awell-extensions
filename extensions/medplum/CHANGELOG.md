# Medplum changelog

## Unreleased

- Added the `Execute stored bundle` action: executes a FHIR Bundle (transaction or batch) in Medplum, reading it from a reference instead of from a field, so a bundle too large to pass between care flow steps, such as one stored by the Metriport `Store Webhook Bundle` action, can still be imported. The stored object must be a `transaction` or `batch` Bundle. It returns the same `bundleId`, `bundleType`, `resourceIds` and `resourcesCreated` data points as `Find or create resource` does for a bundle.
- Added `Fail if patient not found?` (`failIfNotFound`) field to the `searchPatient` action. When enabled, a search that returns no patient fails the action with a `SERVER_ERROR` instead of completing with an empty patient. Defaults to `false`, so existing care flows are unchanged.
- Opted `searchPatient` in to automated retries (`supports_automated_retries`). Combined with `failIfNotFound`, this lets a care flow recover from the race where the search runs before the patient exists in Medplum.
