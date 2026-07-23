# Metriport changelog

## July 2026

- Add `enrollment` webhook: an enrollment trigger for Metriport real-time patient notifications. The `eventType` data point carries the Metriport webhook type (`patient.admit` or `medical.discharge-summary`) so care flows can distinguish on it. The webhook validates and replies immediately, emitting the pre-signed FHIR bundle URL on the `bundleUrl` data point rather than downloading the bundle inline.
- Add `Get Webhook Bundle` action: fetches the FHIR bundle from a Metriport webhook payload URL (the webhook's `bundleUrl`), for use later in the care flow.
- Add optional `Webhook Key` setting used to verify incoming webhook requests via Metriport's HMAC-SHA256 signature (`x-metriport-signature` header), computed over the raw request body.