import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  contactId: {
    key: 'contactId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
