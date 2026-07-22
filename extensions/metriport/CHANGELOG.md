# Metriport changelog

## July 2026

- Add `enrollment` webhook: an enrollment trigger for Metriport real-time patient notifications that distinguishes between admit (`adt`, from `patient.admit`) and `discharge` (from `medical.discharge-summary`) events, exposing the FHIR Encounter Bundle and discharge summary respectively.
- Add optional `Webhook Key` setting used to verify incoming webhook requests via Metriport's HMAC-SHA256 signature (`x-metriport-signature` header), computed over the raw request body.