---
title: Cerner
description: Cerner EMR is an electronic medical records system that helps healthcare organizations improve patient care and increase efficiency.
---

# Cerner

Cerner EMR is an electronic medical records system that helps healthcare organizations improve patient care and increase efficiency.

## The Cerner extension

The **Cerner Extension** is designed to support **Read** and **Write** integrations via [SMART Backend Services](https://docs.oracle.com/en/industries/health/millennium-platform-apis/fhir-authorization-framework/#requesting-authorization-on-behalf-of-a-system). These integrations are server-to-server (backend) and do not require direct user interaction—whether from patients or practitioners. The extension connects to **Cerner's FHIR R4 API**.

In addition to REST interfaces, customers using Cerner usually also have healthcare-specific interfaces, like HL7, enabling tasks such as querying patient demographics (ADR A19) or creating documents (ORU messages). **Awell supports these interfaces as well.**

## Setup

To set up the Cerner Extension in Awell, you’ll need to configure the following:

- **Tenant ID**: the tenant ID associated to the organization you are connecting to ([more info](https://docs.oracle.com/en/industries/health/millennium-platform-apis/fhir-app-provisioning/))
- **Client ID**: the client ID of the Cerner app used to authenticate. ([more info](https://docs.oracle.com/en/industries/health/millennium-platform-apis/fhir-authorization-framework/#registering-an-application)) 
- **Client secret**: the client secret of the Cerner app used to authenticate ([more info](https://docs.oracle.com/en/industries/health/millennium-platform-apis/fhir-authorization-framework/#registering-a-system-account))

**Important:** The actions below list what scopes are required to be added to the Cerner app. Without the scopes, the actions will not work as the app will not have the necessary permissions to access the data.

## Actions

### Get patient (R4)

Retrieve a patient’s details using their FHIR resource ID. This action returns the full FHIR Patient resource.

Required application scopes: `system/Patient.read`

### Create patient (R4)

Add a new patient to Cerner using demographic information. Required fields include:  

- Assigning Organization ID
- Given name
- Family name

While optional, including additional demographic information such as email address, data of birth, etc is highly recommended to improve accuracy when matching patients in the future.  

The action will return the FHIR resource ID of the created patient.

Required application scopes: `system/Patient.write`

### Find patient by MRN (R4)

Leverages the `Patient.search` (R4) operation to find a patient by their MRN. The action will return the FHIR resource ID of the patient.

Note: the default identifier system used to look up the patient based on MRN is `urn:oid:2.16.840.1.113883.6.1000`.

Required application scopes: `system/Patient.read`

### Get appointment (R4)

Retrieve details of a specific appointment using its FHIR resource ID. The action returns the full FHIR Appointment resource.

Required application scopes: `system/Appointment.read`

### Get patient encounters (R4)

Retrieve all encounters for a patient using their FHIR resource ID. The action returns all FHIR Encounter resources for the patient.

Required application scopes: `system/Encounter.read`

### Create document (R4)

Create a new document reference (clinical note) in Cerner. The action returns the FHIR resource ID of the created document reference.

Required application scopes: `system/DocumentReference.write`

### Get encounter (R4)

Retrieve details of a specific encounter using its FHIR resource ID. The action returns the full FHIR Encounter resource.

Required application scopes: `system/Encounter.read`
