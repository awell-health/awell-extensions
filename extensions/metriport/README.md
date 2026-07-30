---
title: Metriport
description: Metriport is Plaid for healthcare data.
---
# Metriport

Metriport is Plaid for healthcare data. We help digital health companies access and manage patient health and medical data, through an open-source and universal API.

Through a single integration, our API enables modern health companies to get the comprehensive patient data they need from both HIEs and EHRs, as well as popular wearable devices.

As a developer-first interoperability solution, Metriport is powering the next wave of innovative companies, accelerating a revolution in digital health.

To learn more visit [https://www.metriport.com/](https://www.metriport.com/)
# Extension settings

In order to set up this extension, **you will need to provide a Metriport API key**. You can obtain an API key via the Metriport dashboard by selecting the `Developers tab`. To learn more on how to get started with Metriport visit our [quick start docs](https://docs.metriport.com/medical-api/getting-started/quickstart) for our Medical API. Also, to better understand how our API keys work check out the [API Keys section](https://docs.metriport.com/home/api-info/api-keys) of our docs as well.

# Custom Actions

**GENERAL NOTE: Make sure to create Organizations and Facilities in Metriport before using this extension. A Patient must be associated with a Facility by providing the facilityId when stated in the actions.**

## Create Patient

Creates a Patient in Metriport for the specified Facility where the Patient is receiving care.

Optionally, providing a **Cohort** ID enrolls the Patient in real-time monitoring by adding them to that cohort. Note that enrolling a Patient in real-time monitoring has downstream consequences: once you start receiving updates about the Patient, you are expected to contribute data back to Metriport.

Visit [endpoint docs](https://docs.metriport.com/medical-api/api-reference/patient/create-patient) for more info.

## Update Patient

Updates the specified Patient.

Visit [endpoint docs](https://docs.metriport.com/medical-api/api-reference/patient/update-patient) for more info.

## Get Patient

Retrieves the specified Patient.

Visit [endpoint docs](https://docs.metriport.com/medical-api/api-reference/patient/get-patient) for more info.

## Remove Patient

Removes a Patient at Metriport and at HIEs the Patient is linked to.

Visit [endpoint docs](https://docs.metriport.com/medical-api/api-reference/patient/delete-patient) for more info.

## List Documents

Lists all Documents that can be retrieved for a Patient.

Visit [endpoint docs](https://docs.metriport.com/medical-api/api-reference/document/list-documents) for more info.

**NOTE: It also returns the status of querying Document references across HIEs, indicating whether there is an asynchronous query in progress (status processing) or not (status completed). If the query is in progress, you will also receive the total number of Documents to be queried as well as the ones that have already been completed.**

## Query Documents

Triggers a Document query for the specified Patient across HIEs.

Visit [endpoint docs](https://docs.metriport.com/medical-api/api-reference/document/start-document-query) for more info.

**NOTE: When executed, this endpoint triggers an asynchronous Document query with HIEs and immediately returns the status of Document query, processing .**

## Get Document Url

Gets a presigned URL for downloading the specified Document.

Visit [endpoint docs](https://docs.metriport.com/medical-api/api-reference/document/get-document) for more info.

**NOTE: This endpoint returns a URL which you can use to download the specified Document using the file name provided from the List Documents endpoint.**

## Remove Patient from Cohort

Removes the specified Patient from a cohort.

Visit [endpoint docs](https://docs.metriport.com/medical-api/api-reference/cohort/remove-patients-from-cohort) for more info.

## Get Webhook Bundle

Fetches the FHIR bundle from a Metriport webhook payload URL — e.g. the [Encounter Bundle](https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle) from an ADT notification, or a discharge summary. Pass the `bundleUrl` data point emitted by the **Enrollment** webhook; the action downloads the bundle and returns it on the `bundle` data point.

When the payload is a Patient Encounter Bundle, the action also rewrites it into an executable FHIR transaction and returns that on the `transactionBundle` data point, ready to hand to the Medplum **Find or create resource** action.

**NOTE: Metriport pre-signed URLs are only valid for 10 minutes, so this action should run early in the care flow, shortly after the enrollment webhook fires.**

| Field | Type | Description |
| --- | --- | --- |
| `url` | string | The pre-signed payload URL to fetch (the webhook's `bundleUrl` data point). |
| `eventType` | string (optional) | The Metriport notification type — wire this from the enrollment webhook's `eventType` data point. Recorded on the import Provenance so admit, transfer and discharge can be told apart. |
| `provenanceReason` | text (optional) | Free-text reason recorded on the import Provenance, describing why the data was imported. |

| Data point | Type | Description |
| --- | --- | --- |
| `bundle` | json | The FHIR bundle fetched from the URL, exactly as Metriport sent it. |
| `transactionBundle` | json | The same data rewritten as an executable FHIR transaction. Omitted when the payload is not a Patient Encounter Bundle. |

### Building the transaction bundle

Metriport delivers a bundle of `type: 'collection'`, which is **not executable**. Handing it straight to Medplum does nothing useful: no entry carries `request` metadata saying what to do with it, and every internal reference points at a Metriport UUID that means nothing in Medplum. The action therefore builds a second, executable bundle rather than passing the original through.

The transformation is a pure function with no Medplum access of its own — this extension holds Metriport credentials only. That rules out reading Medplum to reconcile against what is already there, so every lookup is expressed declaratively and resolved by the server when the transaction executes.

**The Patient is never written.** Awell/Medplum is the source of truth for patient demographics, so the Patient entry is dropped entirely and every reference to it becomes a conditional reference:

```
Patient?identifier=https://awellhealth.com/patients|<awell patient id>
```

Omitting the entry guarantees structurally that a Metriport ADT feed can never overwrite the patient record.

**Everything else is written idempotently.** Each Metriport resource is stamped with an identifier derived from its Metriport id and written with a conditional update:

```
identifier: { system: 'https://metriport.com/fhir/encounter', value: '<metriport id>' }
request:    PUT Encounter?identifier=https://metriport.com/fhir/encounter|<metriport id>
```

A conditional update creates on zero matches and updates on one, so a redelivered notification updates in place instead of duplicating Conditions, Observations, Practitioners and Locations — and the admit and discharge notifications for one visit converge on a single Encounter. Existing identifiers are kept, so the Encounter keeps its HL7 `VN` visit number alongside ours.

**References are rewritten to Metriport's own `fullUrl`s.** Metriport resolves its relationships correctly, but emits them in a form FHIR cannot match: entries carry `urn:uuid:` fullUrls while references to them are relative.

```
fullUrl:    urn:uuid:3ca5e8d2-7c84-45ab-91e7-834f8becde12
reference:  Location/3ca5e8d2-7c84-45ab-91e7-834f8becde12
```

A transaction resolves an internal reference by matching it against `fullUrl` verbatim, and a relative reference does not match a `urn:uuid:` one — Medplum would read it as a reference to a *Medplum* Location with that id, which does not exist. Rewriting the reference to the entry's `fullUrl` closes the gap while keeping Metriport's identity. This is also why the result is a `transaction` and not a `batch`: `urn:uuid` resolution is a transaction feature.

**`meta` is stripped from every resource.** Medplum's `meta.accounts` is inherited from the compartment of the Patient a resource references, but specifying `meta` at all on a create or update replaces those inherited accounts instead of adding to them. Metriport's Encounter arrives with a `meta`, so it is removed. `resource.id` is dropped too, for a separate reason: Medplum assigns identity, and the entry's `fullUrl` already carries the local identity the transaction needs.

**Two entries are synthesised.** An `Organization` named *Metriport Realtime Monitoring*, created with `ifNoneExist` so an existing one is reused rather than overwritten; and a `Provenance` recording the import — what it created, when, which Metriport bundle it came from, and which ADT event triggered it (`patient.admit` → `A01`, `patient.transfer` → `A02`, `patient.discharge` → `A03`).

`extensions/metriport/actions/webhookBundle/bundle/transform.test.ts` asserts the complete output for a real `patient.admit` bundle, if you want to see the whole before/after in one place.

### Wiring it into a care flow

1. **Enrollment** webhook fires and emits `bundleUrl` and `eventType`.
2. **Get Webhook Bundle** — pass `bundleUrl` to `url` and `eventType` to `eventType`. Run this early; the URL expires after 10 minutes.
3. Medplum **Find or create resource** — pass the `transactionBundle` data point to its `resourceJson` field. No changes to that action are needed; it detects a Bundle and executes it.

**PREREQUISITE: for imported resources to be tagged with the Metriport organization, the Medplum Patient must already carry it in `meta.accounts` before the notification arrives.** Resources created without a `meta` inherit their accounts from the compartment of the Patient they reference, so tagging the Patient once causes every subsequent import to inherit it automatically. Note that this only covers resources *in* the patient compartment — `Location` and `Practitioner` are shared directory resources and are intentionally created untagged, since scoping a hospital or a physician to one patient's tenant would be wrong.

**NOTE: the conditional Patient reference only resolves if your Medplum Patients carry an identifier under the `https://awellhealth.com/patients` system with the Awell patient id as its value. A conditional reference that matches no Patient fails the whole transaction.**

### When the transaction bundle is omitted

`Get Webhook Bundle` serves several Metriport webhook types and only ADT notifications carry encounter bundles. For any payload that is not a `collection` bundle, `transactionBundle` is simply omitted and `bundle` is emitted on its own — the action still succeeds.

A `collection` bundle that is missing its Patient or Encounter entry is treated differently: that is an encounter bundle which does not describe an encounter, so the action **fails** rather than silently emitting a partial result.

# Webhooks

## Enrollment

An enrollment trigger that starts a care flow when Metriport sends a [real-time patient notification](https://docs.metriport.com/medical-api/handling-data/realtime-patient-notifications).

Metriport POSTs every notification type to the same endpoint, so this webhook discriminates on the notification `type` and only enrolls on two events. The `eventType` data point carries the raw Metriport webhook type:

- `patient.admit` (HL7 ADT^A01) → `eventType` = `patient.admit`. The payload carries a pre-signed URL to the [FHIR Encounter Bundle](https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle).
- `medical.discharge-summary` → `eventType` = `medical.discharge-summary`. This event is currently undocumented by Metriport and is modelled on the published `medical.*` webhook family (a `patients` array).

The webhook validates the request, emits the data points (including the pre-signed bundle URL on `bundleUrl`), and replies immediately — it does **not** download the bundle. Fetch the bundle later in the care flow with the **Get Webhook Bundle** action, using the `bundleUrl` data point. Because the URL expires after 10 minutes, run that action early.

Use the `eventType` data point in your care flow to branch on admit vs discharge. Every other notification type (`patient.discharge`, `patient.transfer`, ...) is acknowledged with a `200` but does not enroll a patient. Metriport [verification `ping` messages](https://docs.metriport.com/medical-api/getting-started/webhooks#the-ping-message) are answered with a `200` that echoes the ping value back as `pong: <value>`.

### Data points

| Data point | Type | Description |
| --- | --- | --- |
| `eventType` | string | The Metriport webhook type: `patient.admit` or `medical.discharge-summary` |
| `metriportPatientId` | string | The Metriport patient ID (also used as the patient identifier for enrollment) |
| `externalId` | string | Your external patient ID, if provided to Metriport |
| `admitTimestamp` | date | When the patient was admitted (admit events only) |
| `whenSourceSent` | date | When the source sent the notification, if available (admit events) |
| `messageId` | string | The Metriport message ID for the notification |
| `bundleUrl` | string | Pre-signed URL to the FHIR bundle; fetch it with the **Get Webhook Bundle** action (valid for 10 minutes) |

### Verifying incoming requests

Optionally set the **Webhook Key** setting to the webhook key from the Metriport dashboard (Settings/Developers tab). Metriport [authenticates each webhook](https://docs.metriport.com/medical-api/getting-started/webhooks#authentication) with an HMAC-SHA256 signature of the raw request body, keyed with your webhook key and sent in the `x-metriport-signature` header. When the setting is populated, the webhook recomputes the HMAC over the raw body and rejects any request whose signature is missing or does not match (`401`). When left empty, requests are not verified.

## More Info

For more information on how to integrate with Metriport please visit our [Medical API docs](https://docs.metriport.com/medical-api/getting-started/quickstart)
