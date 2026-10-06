# Medplum changelog

## Unreleased

- Added the `Execute stored bundle` action: executes a FHIR Bundle (transaction or batch) in Medplum, reading it from a reference instead of from a field, so a bundle too large to pass between care flow steps, such as one stored by the Metriport `Store Webhook Bundle` action, can still be imported. The stored object must be a `transaction` or `batch` Bundle. It returns only `bundleId` and `bundleType`. `Find or create resource` also returns `resourceIds` and `resourcesCreated`, which grow with the number of entries, so a bundle too large to pass between steps could be answered by a result that is too large too.
- Added `Fail if patient not found?` (`failIfNotFound`) field to the `searchPatient` action. When enabled, a search that returns no patient fails the action with a `SERVER_ERROR` instead of completing with an empty patient. Defaults to `false`, so existing care flows are unchanged.
- Opted `searchPatient` in to automated retries (`supports_automated_retries`). Combined with `failIfNotFound`, this lets a care flow recover from the race where the search runs before the patient exists in Medplum.
