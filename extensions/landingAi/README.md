---
title: Landing.ai
description: Turn your documents and images into visual intelligence. LandingAI’s cutting-edge software platform makes computer vision easy for a wide range of applications across all industries.
---

# Landing.ai

Turn your documents and images into visual intelligence. LandingAI’s cutting-edge software platform makes computer vision easy for a wide range of applications across all industries.

## Extension settings

To enable the extension, you must configure an API key. You can obtain this key from the Landing.ai platform.

## Actions

### Document extraction

Extract structured data from an image or PDF by providing a URL to the file. Please note that the file has to be publicly accessible. If you require enhanced security, we can also build custom connectors to access secure data stores such as Google Cloud Storage (GCS), AWS, and others. Please contact our customer support team to explore this option.

In most cases, you'll want to specify the "Fields schema", which allows you to define what data to extract and the desired output format. This schema must be written in JSON following a specific format.

We recommend creating the schema using Landing.ai’s playground, [exporting it](https://docs.landing.ai/ade/ade-extract-playground#export-the-schema), and then copying it into Awell.

Example schema:
```json
{
  "type": "object",
  "title": "Physician Referral Extraction Schema",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "required": [
    "date_of_birth",
    "urgency",
    "Referral reason"
  ],
  "properties": {
    "date_of_birth": {
      "type": "string",
      "format": "YYYY-MM-DD",
      "description": "Date of birth of the patient"
    },
    "urgency": {
      "type": "string",
      "description": "Urgency of the referral"
    },
    "Referral reason": {
      "type": "string",
      "description": "Reason of the referral"
    }
  },
  "description": "Schema for extracting high-value, form-like fields from a physician's referral markdown document."
}
```

