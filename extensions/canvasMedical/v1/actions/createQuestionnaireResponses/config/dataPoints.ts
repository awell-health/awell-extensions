import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  questionnaireResponseId: {
    key: 'questionnaireResponseId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
