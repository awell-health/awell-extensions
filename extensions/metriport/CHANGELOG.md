# Metriport changelog

## July 2026

- Add `enrollment` webhook: an enrollment trigger for Metriport real-time patient (ADT) notifications that distinguishes between admit (`adt`) and `discharge` events and exposes the FHIR Encounter Bundle.
- Add optional `Webhook Key` setting used to verify incoming webhook requests via the `x-webhook-key` header.