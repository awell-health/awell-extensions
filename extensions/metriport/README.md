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

## More Info

For more information on how to integrate with Metriport please visit our [Medical API docs](https://docs.metriport.com/medical-api/getting-started/quickstart)
