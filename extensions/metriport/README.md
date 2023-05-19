# Metriport

Metriport is Plaid for healthcare data. We help digital health companies access and manage patient health and medical data, through an open-source and universal API.

Through a single integration, our API enables modern health companies to get the comprehensive patient data they need from both HIEs and EHRs, as well as popular wearable devices.

As a developer-first interoperability solution, Metriport is powering the next wave of innovative companies, accelerating a revolution in digital health.

To learn more visit https://www.metriport.com/
# Extension settings

In order to set up this extension, **you will need to provide a Metriport API key**. You can obtain an API key via the Metriport dashboard by selecting the `Developers tab`. To learn more on how to get started with Metriport visit our [quick start docs](https://docs.metriport.com/medical-api/getting-started/quickstart) for our Medical API. Also, to better understand how our API keys work check out the [API Keys section](https://docs.metriport.com/home/api-info/api-keys) of our docs as well.

# Custom Actions

**GENERAL NOTE: When providing a facilityId it must be the id of the facility the patient belongs to.**

## Create patient

Creates a Patient in Metriport for the specified Facility where the patient is receiving care.

## Update patient

Updates the specified Patient.

## Get patient

Retrieves the specified Patient.

## Remove patient

Removes a patient at Metriport and at HIEs the patient is linked to.

## Get all links

Builds and returns the current state of a patient's links across HIEs.

## Create link

Creates link between a patient at Metriport and an entity (person/patient) on an HIE (medical data source).

## Remove link

Removes a link between a patient at Metriport and an entity (person/patient) on an HIE (medical data source).

## List documents

Lists all Documents that can be retrieved for a Patient.

**NOTE: It also returns the status of querying document references across HIEs, indicating whether there is an asynchronous query in progress (status processing) or not (status completed). If the query is in progress, you will also receive the total number of documents to be queried as well as the ones that have already been completed.**

## Query documents

Triggers a document query for the specified patient across HIEs.

**NOTE: When executed, this endpoint triggers an asynchronous document query with HIEs and immediately returns the status of document query, processing .**

## Get document url

Gets a presigned URL for downloading the specified document.

**NOTE: This endpoint returns a URL which you can use to download the specified document using the file name provided from the List Documents endpoint.**

## More Info

For more information on how to integrate with Metriport please visit our [Medical API docs](https://docs.metriport.com/medical-api/getting-started/quickstart)
