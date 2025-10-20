---
title: Medplum
description: Medplum is the open source healthcare developer platform that helps you build, test, and deliver any healthcare product or service.
---

# Medplum

Medplum is the open source healthcare developer platform that helps you build, test, and deliver any healthcare product or service.

## Extension settings

The following settings are required to configure the Medplum extension:

- **Client ID**: Used to authenticate with Medplum's API (required)
- **Client Secret**: Used to authenticate with Medplum's API (required)
- **Base URL**: Optional custom base URL for your Medplum server (e.g., `https://api.medplum.com/`). Leave empty to use the default Medplum server.

## Actions

### Create resource

Create any FHIR resource in Medplum. Supports single resources or FHIR Bundles (transaction/batch) for creating multiple resources atomically.

#### Data Points

**Single Resource:**
- `resourceId` (string): The ID of the created resource
- `resourceType` (string): The type of the created resource (e.g., "Patient", "Observation")

**Bundle:**
- `bundleId` (string): The ID of the bundle
- `bundleType` (string): The type of bundle response (e.g., "transaction-response")
- `resourceIds` (string): Comma-separated list of created resource IDs
- `resourcesCreated` (json): Structured array of created resources with detailed information

#### resourcesCreated Structure

When creating a bundle, the `resourcesCreated` data point contains a JSON array with the following structure:

```json
[
  {
    "id": "patient-1",
    "resourceType": "Patient",
    "status": "201 Created",
    "location": "Patient/patient-1"
  },
  {
    "id": "observation-2",
    "resourceType": "Observation",
    "status": "201 Created",
    "location": "Observation/observation-2"
  }
]
```

This structured format allows you to:
- Filter resources by type using derived data points
- Access individual resource IDs with context about their resource type
- Check creation status for each resource
- Reference specific resources in subsequent actions

**Example usage in derived data points:**

```javascript
// Get the Patient ID from a bundle
const resources = JSON.parse(resourcesCreated);
const patientResource = resources.find(r => r.resourceType === 'Patient');
const patientId = patientResource.id;

// Get all Observation IDs
const observationIds = resources
  .filter(r => r.resourceType === 'Observation')
  .map(r => r.id);
```
