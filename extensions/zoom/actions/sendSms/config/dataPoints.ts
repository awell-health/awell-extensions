import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  messageId: {
    key: 'messageId',
    valueType: 'string',
  },
  success: {
    key: 'success',
    valueType: 'boolean',
  },
  code: {
    key: 'code',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
