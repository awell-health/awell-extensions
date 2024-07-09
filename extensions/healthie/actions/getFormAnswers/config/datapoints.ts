import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  formAnswers: {
    key: 'formAnswers',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
