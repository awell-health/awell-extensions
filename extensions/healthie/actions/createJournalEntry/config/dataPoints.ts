import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  journalEntryId: {
    key: 'journalEntryId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
