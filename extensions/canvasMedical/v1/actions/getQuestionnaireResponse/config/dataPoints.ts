import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  questionnaireResponseData: {
    key: 'questionnaireResponseData',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
