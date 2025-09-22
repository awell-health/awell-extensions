import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  has_been_enrolled_in_track: {
    key: 'has_been_enrolled_in_track',
    valueType: 'boolean',
  },
  is_enrolled_in_track: {
    key: 'is_enrolled_in_track',
    valueType: 'boolean',
  },
  track_is_scheduled: {
    key: 'track_is_scheduled',
    valueType: 'boolean',
  },
  next_track_scheduled_date: {
    key: 'next_track_scheduled_date',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>
