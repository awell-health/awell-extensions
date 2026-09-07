# Metriport changelog

## September 2026

- Add the `metriportAdt` ingestion endpoint (`source: 'webhook'`): receives Metriport real-time notifications, handles `patient.admit`, `patient.transfer`, `patient.discharge` and `medical.discharge-summary`, downloads the FHIR bundle each points at, and saves the patient (demographics from the bundle) and one encounter per visit, so admit, transfer, discharge and the summary converge on the same encounter. Publishes `patient.admitted` / `patient.transferred` / `patient.discharged` / `document.available` for care flows and `fhir.bundle-received` for FHIR data movement. Any other notification type is acknowledged without producing a record; the verification ping is answered with `pong`. Requests are verified with Metriport's HMAC-SHA256 signature and the **Webhook Key** setting is required for it. The extension now declares `identifier.system` (`https://metriport.com`).
- Add `Enroll in Monitoring` action: creates a Patient and enrolls them in real-time monitoring in one step. It takes the same Patient details as `Create Patient` but a **Cohort Name** instead of a Facility ID; by convention a Cohort and its Facility share a name, so both are resolved from that one input. Facility and Cohort lists are cached in memory for 24 hours per API credential, refreshing early (at most once a minute) when a name is not found.
- **Breaking: remove the `Cohort` field from `Create Patient` and `Update Patient`.** Real-time monitoring enrollment now lives on `Enroll in Monitoring`; care flows that passed a cohort ID to `Create Patient` should switch to the new action.

## August 2026

- Rename the `enrollment` webhook to `realtimeUpdate`. The old name described what Awell does with the notification rather than what Metriport sends, which read confusingly next to the genuine enrolment concepts (the `Cohort` field, enrolling a patient into a care flow). Behaviour is unchanged. **Breaking: the webhook endpoint URL changes, so any webhook already configured in the Metriport dashboard must be repointed.**
- `Date of Birth` on the `Create Patient` and `Update Patient` actions is now a date field rather than a free-text string, so care flows can map a date onto it directly instead of hand-formatting `YYYY-MM-DD`. The value is normalised to the date-only string Metriport expects, so care flows already passing `YYYY-MM-DD` are unaffected.

## July 2026

- Add `enrollment` webhook: an enrollment trigger for Metriport real-time patient notifications. The `eventType` data point carries the Metriport webhook type (`patient.admit` or `medical.discharge-summary`) so care flows can distinguish on it. The webhook validates and replies immediately, emitting the pre-signed FHIR bundle URL on the `bundleUrl` data point rather than downloading the bundle inline.
- Add `Get Webhook Bundle` action: fetches the FHIR bundle from a Metriport webhook payload URL (the webhook's `bundleUrl`), for use later in the care flow.
- Add optional `Webhook Key` setting used to verify incoming webhook requests via Metriport's HMAC-SHA256 signature (`x-metriport-signature` header), computed over the raw request body.
