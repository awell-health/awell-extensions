import { FieldType, type Field } from '@awell-health/extensions-core'

export const fields = {
  url: {
    id: 'url',
    label: 'Bundle URL',
    description:
      'The pre-signed Metriport payload URL to fetch the FHIR bundle from. This is the `bundleUrl` data point emitted by the enrollment webhook. Note: Metriport pre-signed URLs are only valid for 10 minutes, so this action should run shortly after the webhook fires.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>
