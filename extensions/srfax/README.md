# SRFax

Retrieve fax documents from SRFax and extract text via LandingAI OCR.

## Extension settings

- Account ID (required)
- Password (required)
- Base URL (optional, default: https://www.srfax.com/SRF_SecWebSvc.php)

## Action: Get fax document with OCR

- Inputs
  - faxId (string, required): SRFax FaxDetailsID (number after the `|`) or full FileName
  - ocrProvider: `awell-landing-ai`
  - ocrProviderApiKey (string, required)
  - fieldsSchema (JSON, optional)
- Outputs
  - markdown (string)
  - chunks (json)
  - extractedDataBasedOnSchema (json)
  - extractedMetadata (json)
  - direction (string)
  - date (date)
  - status (string)
  - format (string)
  - pageCount (number)
