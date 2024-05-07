import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  questionnnaireResponseId: {
    key: 'questionnnaireResponseId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
