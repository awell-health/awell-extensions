# Metriport changelog

## August 2026

- `Date of Birth` on the `Create Patient` and `Update Patient` actions is now a date field rather than a free-text string, so care flows can map a date onto it directly instead of hand-formatting `YYYY-MM-DD`. The value is normalised to the date-only string Metriport expects, so care flows already passing `YYYY-MM-DD` are unaffected.

## July 2026

- Add `enrollment` webhook: an enrollment trigger for Metriport real-time patient notifications. The `eventType` data point carries the Metriport webhook type (`patient.admit` or `medical.discharge-summary`) so care flows can distinguish on it. The webhook validates and replies immediately, emitting the pre-signed FHIR bundle URL on the `bundleUrl` data point rather than downloading the bundle inline.
- Add `Get Webhook Bundle` action: fetches the FHIR bundle from a Metriport webhook payload URL (the webhook's `bundleUrl`), for use later in the care flow.
- Add optional `Webhook Key` setting used to verify incoming webhook requests via Metriport's HMAC-SHA256 signature (`x-metriport-signature` header), computed over the raw request body.