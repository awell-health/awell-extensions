---
title: Epic
description: Epic is an Electronic Health Records (EHR) system for healthcare organizations, hospitals and large practices.
---

# Epic

Epic is an Electronic Health Records (EHR) system for healthcare organizations, hospitals and large practices.

## Introduction

### Integration landscape

Epic provides a comprehensive range of interfaces for integration. We've grouped them into four key categories:

1. **Read**: Retrieve data from Epic (e.g., patient demographics).  
2. **Write**: Send data to Epic (e.g., create a patient, create a document).  
3. **Subscriptions/Events**: Subscribe to events in Epic.  
4. **Embedded Apps**: Embed applications within Epic, SSO launch, and more (typically via SMART-on-FHIR).  

Each category offers multiple interfaces tailored to specific workflows and use cases.

We seamlessly integrates with Epic across all categories using industry-standard protocols like HL7, FHIR, and proprietary APIs. We prioritize trust and flexibility, supporting both REST and non-REST interfaces to meet your organization's needs.

### The Epic extension

The **Epic Extension** is designed to support **Read** and **Write** integrations via [SMART Backend Services](https://fhir.epic.com/Documentation?docId=oauth2&section=BackendOAuth2Guide). These integrations are server-to-server (backend) and do not require direct user interaction—whether from patients or practitioners.

The extension supports a variety of REST-based interfaces, including:

- Vendor Services API
- FHIR R4
- FHIR DSTU2
- FHIR STU3

In addition to REST interfaces, Epic also supports non-REST standards like HL7, enabling tasks such as querying patient demographics (ADR A19) or creating documents (ORU messages). **Awell supports these non-REST standards as well.** However, the Epic Extension focuses specifically on REST-based interfaces.

## Setup

To set up the Epic Extension in Awell, you’ll need to configure the following:

- **Base URL**: The Epic instance's base URL (e.g., `https://fhir.epic.com/interconnect-fhir-oauth/api/`).  
- **Auth URL**: The URL for obtaining access tokens (e.g., `https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token`).  
- **Client ID**: The client ID of Awell’s registered Epic application.  
- **Private Key**: The private key for the application, formatted as a single string with new lines explicitly indicated by `\n`.

**Example of Private Key Format**:
`-----BEGIN PRIVATE KEY-----\naaaaaaa\nbbbbb\n-----END PRIVATE KEY-----`

## Actions

### Get patient (R4)

Retrieve a patient’s details using their FHIR resource ID. This action returns the full FHIR Patient resource.

### Match patient (R4)

Find a patient using demographic data. The action returns a matching Patient resource **only if a single high-confidence match is found**.  

- If multiple high-confidence matches or no matches are found, the action fails.  
- This uses the `Patient.$match` (R4) operation, recommended for backend-to-backend integrations (learn more: [Epic Documentation](https://fhir.epic.com/Sandbox?api=10423)).

The action will return the FHIR resource ID of the matched patient.

### Create patient (R4)

Add a new patient to Epic using demographic information. Required fields include:  

- SSN
- Given name
- Family name
- Gender
- Birth date

While optional, including an email address is highly recommended to improve accuracy when matching patients in the future.  

The action will return the FHIR resource ID of the created patient.

### Get appointment

Retrieve details of a specific appointment using its FHIR resource ID. The action returns the full FHIR Appointment resource.

### Create clinical note (R4)

Create a clinical document in Epic. Required fields include:

- **Patient resource ID**: The patient’s FHIR resource ID.  
- **Encounter resource ID**: The related encounter’s FHIR resource ID (currently required; [Pre-Charting support is coming February 2025](https://fhir.epic.com/Sandbox?api=1046)).  
- **Document status**: The status of the document.  
- **Document type**: The type of the document.  
- **Document content**: The content of the document.  

The action will return the FHIR resource ID of the created document.

### Find patient by MRN (R4)

Leverages the `Patient.search` (R4) operation to find a patient by their MRN. The action will return the FHIR resource ID of the patient.

