import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  visitNoteId: {
    key: 'visitNoteId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
