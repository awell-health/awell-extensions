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

# Ingestion

## Metriport ADT notifications (`metriportAdt`)

An ingestion endpoint for Metriport's [real-time patient notifications](https://docs.metriport.com/medical-api/handling-data/realtime-patient-notifications). Point the webhook URL in the Metriport dashboard at it. Request verification (Metriport's HMAC-SHA256 `x-metriport-signature`, with the verification ping answered by `pong`) is implemented but switched off for the pre-release; it will be enabled, and the **Webhook Key** setting required, before general availability.

Handled notification types are `patient.admit`, `patient.transfer`, `patient.discharge` and `patient.discharge-summary`. For each, the FHIR bundle behind the pre-signed `payload.url` is downloaded and the patient is resolved on `payload.externalId` (the id you gave Metriport when creating the patient, i.e. your own MRN). The endpoint saves one encounter keyed on the visit number (the patient itself is created by that resolution; demographics are not written yet), so all four notifications about one visit update the same encounter (`in-progress` until the discharge, `finished` after it, with the last transfer destination as its location). Any other notification type is acknowledged and produces nothing.

Events published, for care flows to trigger on: `patient.admitted`, `patient.transferred`, `patient.discharged` and `discharge.summary-received` (on a discharge summary). Every handled notification also publishes `fhir.bundle-received`, which FHIR data movement listens for; it carries no clinical data, the bundle is looked up by ingestion id.

# Custom Actions

**GENERAL NOTE: Make sure to create Organizations and Facilities in Metriport before using this extension. A Patient must be associated with a Facility by providing the facilityId when stated in the actions.**

## Create Patient

Creates a Patient in Metriport for the specified Facility where the Patient is receiving care. The Patient is not enrolled in real-time monitoring; use **Enroll in Monitoring** for that.

Visit [endpoint docs](https://docs.metriport.com/medical-api/api-reference/patient/create-patient) for more info.

## Enroll in Monitoring

Creates a Patient in Metriport and enrolls them in real-time monitoring in one step. It takes the same Patient details as **Create Patient**, but instead of a Facility ID it takes a **Cohort Name**. By convention a Cohort and the Facility its Patients receive care at share the same name, so the action looks both up by that name: the Patient is created in the matching Facility and added to the matching Cohort.

Names are matched case-insensitively, ignoring surrounding whitespace, and must identify exactly one Cohort and exactly one Facility. Both lists are cached in memory for 24 hours; a name that is not in the cached list triggers an early refresh (at most once a minute) before the action fails, so a Cohort or Facility created recently is still found.

Note that enrolling a Patient in real-time monitoring has downstream consequences: once you start receiving updates about the Patient, you are expected to contribute data back to Metriport.

Visit the endpoint docs for [create patient](https://docs.metriport.com/medical-api/api-reference/patient/create-patient), [list facilities](https://docs.metriport.com/medical-api/api-reference/facility/list-facilities) and [list cohorts](https://docs.metriport.com/medical-api/api-reference/cohort/list-cohorts) for more info.

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

## Get Facility by Name

Gets the Facility with the given name, so a care flow can resolve a human-readable Facility name into the `facilityId` that the Patient and Document actions require.

Metriport has no endpoint to filter Facilities by name, so this action lists all Facilities in your Organization and matches in memory. The name is matched case-insensitively and ignoring surrounding whitespace, and must match **exactly one** Facility: the action errors if no Facility matches, and also if several do, rather than guessing which one was meant.

Visit [endpoint docs](https://docs.metriport.com/medical-api/api-reference/facility/list-facilities) for more info.

| Field | Type | Description |
| --- | --- | --- |
| `facilityName` | string | The name of the Facility to look up. Matched case-insensitively, ignoring surrounding whitespace, and must match exactly one Facility in your Organization. |

The data points mirror the Facility object Metriport returns from [Get Facility](https://docs.metriport.com/medical-api/api-reference/facility/get-facility), one data point per response field:

| Data point | Type | Metriport field | Description |
| --- | --- | --- | --- |
| `facilityId` | string | `id` | Metriport's UUID for the Facility. This is the `facilityId` the Patient and Document actions take. |
| `facilityName` | string | `name` | The Facility name, as stored at Metriport — the canonical casing and spacing, not the name that was searched for. |
| `npi` | string | `npi` | The Facility's National Provider Identifier. |
| `tin` | string | `tin` | The Facility's Taxpayer Identification Number. Optional at Metriport; left unset when absent. |
| `active` | boolean | `active` | Whether the Facility is active. Optional at Metriport; left unset when absent. |
| `addressLine1` | string | `address.addressLine1` | Street address line 1. |
| `addressLine2` | string | `address.addressLine2` | Street address line 2. Optional; left unset when absent. |
| `city` | string | `address.city` | Address city. |
| `state` | string | `address.state` | Two-letter US state or territory code. |
| `zip` | string | `address.zip` | Address ZIP code. |
| `country` | string | `address.country` | Address country — always `USA` at Metriport today. Left unset when absent. |

## Remove Patient from Cohort

Removes the specified Patient from a cohort.

Visit [endpoint docs](https://docs.metriport.com/medical-api/api-reference/cohort/remove-patients-from-cohort) for more info.

## Get Webhook Bundle

Fetches the FHIR bundle from a Metriport webhook payload URL — e.g. the [Encounter Bundle](https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle) from an ADT notification, or a discharge summary. Pass the `bundleUrl` data point emitted by the **Realtime Update** webhook; the action downloads the bundle and returns it on the `bundle` data point.

When the payload is a Patient Encounter Bundle, the action also rewrites it into an executable FHIR transaction and returns that on the `transactionBundle` data point, ready to hand to the Medplum **Find or create resource** action.

The Encounter's Metriport id is returned separately on the `encounterId` data point, so a later step can address the imported Encounter without re-parsing the bundle.

**NOTE: Metriport pre-signed URLs are only valid for 10 minutes, so this action should run early in the care flow, shortly after the realtime update webhook fires.**

| Field | Type | Description |
| --- | --- | --- |
| `url` | string | The pre-signed payload URL to fetch (the webhook's `bundleUrl` data point). |
| `eventType` | string (optional) | The Metriport notification type — wire this from the realtime update webhook's `eventType` data point. Recorded on the import Provenance so admit, transfer and discharge can be told apart. |
| `provenanceReason` | text (optional) | Free-text reason recorded on the import Provenance, describing why the data was imported. |

| Data point | Type | Description |
| --- | --- | --- |
| `bundle` | json | The FHIR bundle fetched from the URL, exactly as Metriport sent it. |
| `transactionBundle` | json | The same data rewritten as an executable FHIR transaction. Omitted when the payload is not a Patient Encounter Bundle. |
| `encounterId` | string | Metriport's UUID for the Encounter in the bundle. Resolve the imported Encounter in Medplum with `Encounter?identifier=https://metriport.com/fhir/encounter\|<encounterId>`. Omitted when the bundle carries no Encounter. |
| `reasonForVisit` … `dischargeSummaryCoverage` | string / json | The discharge summary fields, only for a `patient.discharge-summary` bundle. See "Discharge summary fields" below. |

### Discharge summary fields

A `patient.discharge-summary` bundle is Metriport's FHIR conversion of the HIE's discharge summary document: one `Composition` plus the patient's encounter history and the clinical resources the document references. The Composition's sections carry title-only narratives, so there is no text to read off them; the content lives in the resources each section points at. Both bundle actions lift the fields a care team asks for out of those resources and return them as plain data points, so a care flow, Panels or an analytics export can use them without parsing the bundle. For any other bundle the fields are all omitted.

Every field is read relative to the encounter the Composition is about (`Composition.encounter`), **not** the first Encounter in the bundle, which is just the patient's oldest visit. Each is omitted, never empty, when the document does not carry it.

| Data point | Type | Where it comes from |
| --- | --- | --- |
| `reasonForVisit` | string | The encounter's `reasonCode` texts, `; `-separated. |
| `visitDiagnosis` | string | The encounter's diagnoses as `<text> (<ICD-10-CM code>)`, `; `-separated, from `Encounter.diagnosis`, else from the Conditions categorised `encounter-diagnosis` that point at the encounter. |
| `planOfTreatment` | string | The CarePlans in the Plan of care section (LOINC `18776-5`): description, then one line per activity. |
| `procedures` | string | The Procedures in the Procedures section (`47519-4`) as `<name> (<date>)`, `; `-separated. |
| `procedureNote` | string | The notes those Procedures report to (`Procedure.report`), each headed by the report's name. The source files these under Results rather than in a section of their own. |
| `dischargeDisposition` | string | `Encounter.hospitalization.dischargeDisposition` as text. |
| `dischargeDispositionCode` | string | The same, as its code (`home`, `snf`, `rehab`, …, from `http://terminology.hl7.org/CodeSystem/discharge-disposition`). |
| `dischargeInstructions` | string | The note in the Hospital discharge instructions section (`8653-8`), else in the Discharge instructions document section (`74213-0`). |
| `dischargeSummaryCoverage` | json | `{ documentType, documentTypeText, sections, fields }`: the Composition's LOINC type, the section codes it carried, and which of the fields above were found. Lets coverage be measured instead of guessed. |

Notes are carried as base64 `DiagnosticReport.presentedForm` attachments, `text/html` or `text/plain` depending on the source EHR. HTML is reduced to plain text (paragraphs and breaks become line breaks, tags and entities are dropped or decoded); anything that is not `text/*`, such as a PDF, yields nothing. A single field is capped at 100,000 characters, far above any note seen, purely so a pathological document cannot push the activity result over the message size limit.

This is built against the documents seen from two source EHR families, keyed on section LOINC codes because the titles differ between them ("Plan of Treatment" in one, "Treatment Plan" in the other). It targets the common pattern, not every variant: a document that files a field somewhere else simply does not yield it, and `dischargeSummaryCoverage` says so.

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

1. **Realtime Update** webhook fires and emits `bundleUrl` and `eventType`.
2. **Get Webhook Bundle** — pass `bundleUrl` to `url` and `eventType` to `eventType`. Run this early; the URL expires after 10 minutes.
3. Medplum **Find or create resource** — pass the `transactionBundle` data point to its `resourceJson` field. No changes to that action are needed; it detects a Bundle and executes it.

**PREREQUISITE: for imported resources to be tagged with the Metriport organization, the Medplum Patient must already carry it in `meta.accounts` before the notification arrives.** Resources created without a `meta` inherit their accounts from the compartment of the Patient they reference, so tagging the Patient once causes every subsequent import to inherit it automatically. Note that this only covers resources *in* the patient compartment — `Location` and `Practitioner` are shared directory resources and are intentionally created untagged, since scoping a hospital or a physician to one patient's tenant would be wrong.

**NOTE: the conditional Patient reference only resolves if your Medplum Patients carry an identifier under the `https://awellhealth.com/patients` system with the Awell patient id as its value. A conditional reference that matches no Patient fails the whole transaction.**

### When the transaction bundle is omitted

`Get Webhook Bundle` serves several Metriport webhook types and only ADT notifications carry encounter bundles. For any payload that is not a `collection` bundle, `transactionBundle` is simply omitted and `bundle` is emitted on its own — the action still succeeds.

A `collection` bundle that is missing its Patient or Encounter entry is treated differently: that is an encounter bundle which does not describe an encounter, so the action **fails** rather than silently emitting a partial result.

## Store Webhook Bundle

Downloads the FHIR bundle from a Metriport webhook payload URL like **Get Webhook Bundle**, but into storage and without loading it into memory, and returns references instead of the bundle. Use it when a bundle can be too large to pass between care flow steps: a discharge summary can be larger than the 5 MiB limit on messages inside Awell, which the `bundle` and `transactionBundle` data points of **Get Webhook Bundle** would then hit, and can reach 100 MB, which is more than a job can hold in memory several times over while it parses, rewrites and sends it.

It takes the same fields as **Get Webhook Bundle**: `url`, `eventType` and `provenanceReason`.

| Data point | Type | Description |
| --- | --- | --- |
| `bundleRef` | string | Reference to the stored bundle, byte for byte as Metriport sent it. |
| `transactionBundleRef` | string | Reference to the list of stored executable FHIR transactions the bundle was split into (see "How a large bundle is handled" below), for the Medplum **Execute stored bundle** action. Omitted when the payload is not a Patient Encounter Bundle. |
| `encounterId` | string | Metriport's UUID for the Encounter in the bundle. Omitted when the bundle carries no Encounter. |
| `reasonForVisit` … `dischargeSummaryCoverage` | string / json | The discharge summary fields, only for a `patient.discharge-summary` bundle, exactly as **Get Webhook Bundle** returns them (see "Discharge summary fields" above). They are small, so they travel as plain data points even though the bundle itself is stored. |

A reference is opaque: pass it on, do not build or parse one. Stored bundles are named after the activity, so a retried action replaces what the failed attempt stored. The action cannot be previewed.

### How a large bundle is handled

1. **Download.** The bundle goes from the pre-signed URL into storage as it arrives, with nothing parsed on the way, so what is held does not grow with its size. It starts at once, as the URL only lasts 10 minutes; once the bundle is stored the URL no longer matters. A download that sends nothing for 60 seconds, takes more than 5 minutes, or is over 250 MB fails. The stored size is compared with the `Content-Length` the server sent (when it sent one, and did not compress the body), so a connection cut short fails the action instead of leaving a truncated bundle that the next step would read as whole.
2. **Read back.** The stored bundle is read a resource at a time, several times: once for what can only be known of the whole of it (its resources, how their references resolve, the order they have to be written in), then once for each step of that order. What is kept in between is an index of a few short strings per resource: about 11 MB for a 100 MB bundle of 31,000 resources, measured, and never the resources.
3. **Split.** The bundle is cut into transactions of at most 200 resources and 4 MiB, each stored as its own object, and the list of them in the order to execute them is what `transactionBundleRef` points at. A single resource that is over the limits on its own gets a transaction of its own.
   - **Order.** A `urn:uuid` reference only resolves inside its own transaction, so a reference to a resource in another transaction is a conditional one (`Encounter?identifier=https://metriport.com/fhir/encounter|…`), which only resolves to something already written. Resources are therefore written after the resources they refer to.
   - **Records.** Resources that refer to each other, such as an Encounter and its diagnoses, cannot be put in order, so they are written together in one transaction, never split, where the references between them resolve. So is a resource of a type that has no `identifier` (`Binary`, `AuditEvent`, `Provenance`) together with every resource that refers to it, as nothing in another transaction could refer to it conditionally.
   - **Rerun.** Every entry is a conditional update on the identifier Metriport's id is stamped as, or a conditional create, and the same bundle always makes the same transactions, so running the import again after a failure part way replaces what was written and adds nothing. **The exception is a resource of a type that has no `identifier`** (`Binary`, `AuditEvent`, `Provenance`, which Metriport's encounter bundles do not carry in practice): it is written with a POST, as it always was, and a rerun writes it again. Nothing is put in `meta` to find it by, as Medplum reserves it: specifying it makes the server overwrite the `meta.account` a resource would inherit from the patient.
   - **Provenance.** One per transaction, for the resources of that transaction, in place of the one for the whole bundle that **Get Webhook Bundle** writes. Each is a conditional update on a key of the source bundle's id and the transaction's number, carried as a second coding of the agent's type (the standard `agent-type` search), so a rerun replaces it. A bundle id that is not a valid FHIR id is hashed first.
   - **What it will not take on.** More than 300,000 resources, references nested more than 64 levels deep (each level is another read of the stored bundle), more than 5,000 resources in one group that refer to each other, or a resource whose id or type is not valid FHIR (the id goes into the search that writes it) fails the action with a message that says which and quotes nothing. Each of these is far beyond a real bundle, and is there so that a crafted one cannot take the memory or the time of the process that every tenant's jobs share.
   - **Limits.** A reference to a resource that is not in the bundle is left as it is. A reference that cannot be satisfied in order fails the transaction that holds it, and the **Execute stored bundle** action says which one. A single very large resource, such as one with a document in an attachment, is held whole while it is written, a few times over.

The raw bundle stays stored if it is then rejected (a `collection` with no Patient or Encounter, or a resource with no id): only the transactions are not written.

**NOTE: Metriport pre-signed URLs are only valid for 10 minutes, so this action should run early in the care flow, shortly after the realtime update webhook fires.**

### Wiring it into a care flow

1. **Realtime Update** webhook fires and emits `bundleUrl` and `eventType`.
2. **Store Webhook Bundle** — pass `bundleUrl` to `url` and `eventType` to `eventType`.
3. Medplum **Execute stored bundle** — pass the `transactionBundleRef` data point to its `bundleRef` field.

**If the Medplum bots that sync Tasks should link them to the Encounter**, map this action's `encounterId` data point to the care flow's baseline `encounter_id` data point. The bots read `encounter_id` from the baseline data points, and the mapping belongs to the action in the care flow, so a flow that moves from **Get Webhook Bundle** to this action needs it set again. `encounterId` itself is the same value in both.

# Webhooks

## Realtime Update

An enrollment trigger that starts a care flow when Metriport sends a [real-time patient notification](https://docs.metriport.com/medical-api/handling-data/realtime-patient-notifications).

Metriport POSTs every notification type to the same endpoint. Four of them share one payload shape — a `meta` envelope plus a `payload` pointing at a pre-signed bundle URL — and this webhook enrolls a patient on all four:

- `patient.admit` (HL7 ADT^A01)
- `patient.discharge` (HL7 ADT^A03)
- `patient.transfer` (HL7 ADT^A02)
- `patient.discharge-summary`

The `eventType` data point carries the raw Metriport webhook type, so a care flow can branch on it. The payload's `url` is a pre-signed link to the [FHIR Encounter Bundle](https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle).

The webhook validates the request, emits the data points (including the pre-signed bundle URL on `bundleUrl`), and replies immediately — it does **not** download the bundle. Fetch the bundle later in the care flow with the **Get Webhook Bundle** action, using the `bundleUrl` data point. Because the URL expires after 10 minutes, run that action early.

Any other notification type Metriport sends — `medical.document-download`, `medical.consolidated-data`, and anything added in future — is acknowledged with a `200` and does not enroll a patient. A notification whose type *is* handled but whose payload is malformed fails loudly instead, so a genuine integration problem is not mistaken for an event we chose to ignore. Metriport [verification `ping` messages](https://docs.metriport.com/medical-api/getting-started/webhooks#the-ping-message) are answered with a `200` that echoes the ping value back as `pong: <value>`.

### Data points

| Data point | Type | Description |
| --- | --- | --- |
| `eventType` | string | The Metriport webhook type: `patient.admit`, `patient.discharge`, `patient.transfer` or `patient.discharge-summary` |
| `metriportPatientId` | string | The Metriport patient ID (also used as the patient identifier for enrollment) |
| `externalId` | string | Your external patient ID, if provided to Metriport |
| `when` | date | When the event occurred — the admit time on an admit event, the discharge time on a discharge event |
| `messageId` | string | The Metriport message ID for the notification |
| `bundleUrl` | string | Pre-signed URL to the FHIR bundle; fetch it with the **Get Webhook Bundle** action (valid for 10 minutes) |

### Verifying incoming requests

Optionally set the **Webhook Key** setting to the webhook key from the Metriport dashboard (Settings/Developers tab). Metriport [authenticates each webhook](https://docs.metriport.com/medical-api/getting-started/webhooks#authentication) with an HMAC-SHA256 signature of the raw request body, keyed with your webhook key and sent in the `x-metriport-signature` header. When the setting is populated, the webhook recomputes the HMAC over the raw body and rejects any request whose signature is missing or does not match (`401`). When left empty, requests are not verified.

## More Info

For more information on how to integrate with Metriport please visit our [Medical API docs](https://docs.metriport.com/medical-api/getting-started/quickstart)
