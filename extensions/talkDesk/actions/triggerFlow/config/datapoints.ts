import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  interactionId: {
    key: 'interactionId',
    valueType: 'string',
  },
  flowVersionId: {
    key: 'flowVersionId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
