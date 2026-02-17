import { FieldType, type Field } from '@awell-health/extensions-core'

export const startNetworkQueryFields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The ID of the Patient for which to query health data',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>
