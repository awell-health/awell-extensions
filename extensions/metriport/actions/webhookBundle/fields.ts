import { FieldType, type Field } from '@awell-health/extensions-core'
import { MetriportWebhookType } from '../../webhooks/types'

export const fields = {
  url: {
    id: 'url',
    label: 'Bundle URL',
    description:
      'The pre-signed Metriport payload URL to fetch the FHIR bundle from. This is the `bundleUrl` data point emitted by the realtime update webhook. Note: Metriport pre-signed URLs are only valid for 10 minutes, so this action should run shortly after the webhook fires.',
    type: FieldType.STRING,
    required: true,
  },
  eventType: {
    id: 'eventType',
    label: 'Event Type',
    description:
      'The Metriport notification type, as emitted on the realtime update webhook `eventType` data point. Recorded on the Provenance of the importable bundle so admission, transfer and discharge imports can be told apart. Leave empty to omit it.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: [
        {
          label: 'Admission (patient.admit)',
          value: MetriportWebhookType.PatientAdmit,
        },
        {
          label: 'Transfer (patient.transfer)',
          value: MetriportWebhookType.PatientTransfer,
        },
        {
          label: 'Discharge (patient.discharge)',
          value: MetriportWebhookType.PatientDischarge,
        },
      ],
    },
  },
  provenanceReason: {
    id: 'provenanceReason',
    label: 'Provenance Reason',
    description:
      'Free-text reason recorded on the Provenance of the importable bundle, describing why this data was imported. Lets imported bundles be traced back to the clinical event that triggered them.',
    type: FieldType.TEXT,
    required: false,
  },
} satisfies Record<string, Field>
