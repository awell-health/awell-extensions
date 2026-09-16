# Medplum changelog

## Unreleased

- Added `Fail if patient not found?` (`failIfNotFound`) field to the `searchPatient` action. When enabled, a search that returns no patient fails the action with a `SERVER_ERROR` instead of completing with an empty patient. Defaults to `false`, so existing care flows are unchanged.
- Opted `searchPatient` in to automated retries (`supports_automated_retries`). Combined with `failIfNotFound`, this lets a care flow recover from the race where the search runs before the patient exists in Medplum.
