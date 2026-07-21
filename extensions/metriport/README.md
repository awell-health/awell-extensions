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

# Webhooks

## Enrollment

An enrollment trigger that starts a care flow when Metriport sends a [real-time patient notification](https://docs.metriport.com/medical-api/handling-data/realtime-patient-notifications).

Metriport POSTs every notification type to the same endpoint, so this webhook discriminates on the notification `type` and only enrolls on two events:

- `patient.admit` → surfaced as `eventType` = `adt` (HL7 ADT^A01). The payload carries a pre-signed URL to the [FHIR Encounter Bundle](https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle) (valid for 10 minutes), which is downloaded and exposed on the `encounterBundle` data point.
- `medical.discharge-summary` → surfaced as `eventType` = `discharge`. This event is currently undocumented by Metriport and is modelled on the published `medical.*` webhook family (a `patients` array). The discharge summary FHIR data — whether embedded inline (`patients[].bundle`) or referenced by a pre-signed URL — is exposed on the `dischargeSummary` data point.

Use the `eventType` data point in your care flow to branch on admit vs discharge. Every other notification type (`patient.discharge`, `patient.transfer`, ...) and verification `ping` requests are acknowledged with a `200` but do not enroll a patient. If a referenced bundle cannot be downloaded, enrollment still proceeds without it.

### Data points

| Data point | Type | Description |
| --- | --- | --- |
| `eventType` | string | `adt` (admit) or `discharge` |
| `metriportPatientId` | string | The Metriport patient ID (also used as the patient identifier for enrollment) |
| `externalId` | string | Your external patient ID, if provided to Metriport |
| `admitTimestamp` | date | When the patient was admitted (admit events only) |
| `whenSourceSent` | date | When the source sent the notification, if available (admit events) |
| `messageId` | string | The Metriport message ID for the notification |
| `encounterBundle` | json | The FHIR Encounter Bundle (admit events) |
| `dischargeSummary` | json | The discharge summary FHIR data (discharge events) |

### Verifying incoming requests

Optionally set the **Webhook Key** setting to the webhook key from the Developers tab of the Metriport dashboard. When set, incoming requests must include a matching `x-webhook-key` header or they are rejected with a `401`. When left empty, requests are not verified.

# More Info

For more information on how to integrate with Metriport please visit our [Medical API docs](https://docs.metriport.com/medical-api/getting-started/quickstart)
