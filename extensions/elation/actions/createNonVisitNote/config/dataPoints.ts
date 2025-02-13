import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  nonVisitNoteId: {
    key: 'nonVisitNoteId',
    valueType: 'number',
  },
  nonVisitNoteBulletId: {
    key: 'nonVisitNoteBulletId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
