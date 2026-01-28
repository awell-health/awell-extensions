---
title: Documo
description: Documo extension for Awell
---
# Documo extension

Documo extension for Awell that integrates with Documo's intelligent document processing platform.

## Webhooks

### OCR Document Completed

Triggered when OCR processing completes on a document. Uses an LLM to extract patient information from the OCR text.

**Data Points:**
- `webhookData` - Full webhook payload (JSON)
- `extractedInfo` - Extracted patient information (JSON)

### Document Field Value Assigned

Triggered when a field value is assigned to a document. Extracts patient and provider information from the document field assignments.

**Data Points:**

| Data Point | Type | Description |
|------------|------|-------------|
| `webhookData` | json | Full webhook payload |
| `patientFirstName` | string | Patient's first name |
| `patientLastName` | string | Patient's last name |
| `patientZipCode` | string | Patient's zip code |
| `patientIdentifiers` | json | Array of patient identifiers (e.g., MRN, insurance ID) |
| `patientMobilePhone` | string | Patient's phone number |
| `receivingProviderFullName` | string | Name of the receiving provider |

**Field Mappings:**

The webhook maps Documo field names to data points:

| Documo Field Name | Data Point |
|-------------------|------------|
| Patient First Name | `patientFirstName` |
| Patient Last Name | `patientLastName` |
| Patient Zip Code | `patientZipCode` |
| Patient Identifiers | `patientIdentifiers` |
| Patient Phone Number | `patientMobilePhone` |
| Receiving Provider Full Name | `receivingProviderFullName` |

## Settings

- **Api Key**: Documo API Key

## Development

### Running Tests

To run tests for a specific file:

```bash
yarn run test -- <file name>
```

Or run all Documo tests:

```bash
yarn run test -- --testPathPattern='extensions/documo' --runInBand
```
