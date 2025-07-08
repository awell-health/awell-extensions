# Observation created

This webhook listener is designed to receive `Observation` resource events from Medplum when new observations are **created**.

## 🔧 Setup Instructions

To successfully receive only `Observation` **creation** events, you must configure the FHIR `Subscription` resource in Medplum with the appropriate filters and extensions.

### 📝 Sample Subscription Resource

When creating your `Subscription`, make sure to:

1. Set the `criteria` field to filter for the `Observation` resource.
2. Use the `subscription-supported-interaction` extension to restrict notifications to `create` events only.

```json
{
  "resourceType": "Subscription",
  "reason": "Listen for new Observations",
  "status": "active",
  "criteria": "Observation",
  "channel": {
    "type": "rest-hook",
    "endpoint": "https://your-webhook-endpoint.com/webhook"
  },
  "extension": [
    {
      "url": "https://medplum.com/fhir/StructureDefinition/subscription-supported-interaction",
      "valueCode": "create"
    }
  ]
}

Without this extension, Medplum will trigger the webhook for both create and update events by default.