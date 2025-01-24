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

## Actions

### Get patient (R4)

Retrieve a patient’s details using their FHIR resource ID. This action returns the full FHIR Patient resource.
